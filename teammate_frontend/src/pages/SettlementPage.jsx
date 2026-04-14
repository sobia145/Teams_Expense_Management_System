import { useContext, useState, useEffect } from 'react';
import SettlementSummary from '../components/settlement/SettlementSummary';
import SettlementTable from '../components/settlement/SettlementTable';
import { AppContext } from '../context/AppContext';
import { groupService } from '../services/groupService';
import useAuth from '../hooks/useAuth';

const SettlementPage = () => {
  const { 
    settlements, 
    setSettlements, 
    groups,
    selectedGroupId, 
    setSelectedGroupId,
    setGroupLocked, 
    groupLocked, 
    refreshHistory, 
    addHistoryEvent,
    refreshSettlements
  } = useContext(AppContext);
  const { user } = useAuth();
  const [filter, setFilter] = useState('ALL'); // ALL, UNPAID, PAID
  
  // Ensure we have fresh data when navigating to this page
  useEffect(() => {
    refreshSettlements();
  }, [refreshSettlements]);

  // REORGANIZATION: Final Group Segregation logic
  const renderSettlementContent = (data, isUniversal = false) => {
    const currentUserId = user?.userId || user?.id;
    const filtered = data.filter(s => {
      if (filter === 'UNPAID') return s.status === 'UNPAID';
      if (filter === 'PAID') return s.status === 'PAID';
      return true;
    });

    const youOwe = filtered.filter(s => currentUserId && String(s.fromUserId) === String(currentUserId));
    const owedToYou = filtered.filter(s => currentUserId && String(s.toUserId) === String(currentUserId));

    return (
      <div className="settlement-layout">
          <SettlementSummary rows={data} groupLocked={groupLocked} />
          
          <div className="stack-gap-lg">
              <section className="settlement-section">
                  <h4 className="section-title">📉 You Owe</h4>
                  <SettlementTable
                      rows={youOwe}
                      onMarkPaid={null} // DEBTORS CANNOT MARK AS PAID
                      disabled={groupLocked}
                      isOwner={true}
                  />
              </section>

              <section className="settlement-section">
                  <h4 className="section-title">📈 Owed to You</h4>
                  <SettlementTable
                      rows={owedToYou}
                      onMarkPaid={markPaid} // ONLY CREDITORS CAN VERIFY PAYMENT
                      disabled={groupLocked}
                      isOwner={false}
                  />
              </section>
          </div>
      </div>
    );
  };

  // Logic for the single-group view
  const groupSettlements = settlements.filter(s => 
    String(s.groupId) === String(selectedGroupId)
  );

  const handleGroupChange = (e) => {
    setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null);
  };

  const markPaid = async (settlement) => {
    if (!settlement) return;
    try {
        const { settlementService } = await import('../services/settlementService');
        await settlementService.settlePayment({
            groupId: settlement.groupId || selectedGroupId,
            fromUserId: settlement.fromUserId,
            toUserId: settlement.toUserId,
            amount: Number(settlement.amount)
        });
        refreshHistory();
        refreshSettlements();
        addHistoryEvent('Payment Recorded', `Recorded ₹${settlement.amount} to ${settlement.toUserName}`);
    } catch (err) {
        console.error("Settlement failed", err);
    }
  };

  const lockTeam = async () => {
    if (!selectedGroupId) return;
    try {
        await groupService.lockGroup(selectedGroupId);
        setGroupLocked(true);
        addHistoryEvent('Team Locked', 'Group modifications disabled.');
    } catch (err) {
        console.error("Lock failed", err);
    }
  };

  const handleLockAttempt = async () => {
    const unpaid = groupSettlements.filter(s => s.status !== 'PAID');
    if (unpaid.length > 0) {
        alert("Cannot lock! Unpaid settlements exist.");
        return;
    }
    await lockTeam();
  };

  const universalGroups = settlements.reduce((acc, s) => {
    const gn = s.groupName || 'Other Group';
    if (!acc[gn]) acc[gn] = [];
    acc[gn].push(s);
    return acc;
  }, {});

  return (
    <div className="stack-gap-lg">
      <div className="page-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
            <h1>Settlement Board</h1>
            {selectedGroupId && (
              <button 
                  className="btn btn-primary" 
                  disabled={groupLocked} 
                  onClick={handleLockAttempt}
              >
              {groupLocked ? 'Team Locked' : 'Finalize & Lock Team'}
              </button>
            )}
        </div>

        <div className="row-gap" style={{width: '100%', background: 'var(--bg-card)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
            <div className="form-field" style={{flex: 1}}>
                <label>Group Context:</label>
                <select 
                    className="input" 
                    value={selectedGroupId || ''} 
                    onChange={handleGroupChange}
                >
                    <option value="">🌎 Universal Overview (All Groups)</option>
                    {groups.map(g => (
                        <option key={g.groupId} value={g.groupId}>{g.name}</option>
                    ))}
                </select>
            </div>
            
            <div className="filter-group row-gap">
                {['ALL', 'UNPAID', 'PAID'].map(f => (
                  <button 
                    key={f}
                    className={`btn ${filter === f ? 'btn-primary' : 'btn-muted'}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </button>
                ))}
            </div>
        </div>
      </div>

      {!selectedGroupId ? (
          <div className="stack-gap-xl">
              {Object.keys(universalGroups).length > 0 ? Object.entries(universalGroups).map(([groupName, groupData]) => (
                <div key={groupName} className="group-segregation-block">
                  <h2 className="group-header-label">📦 Group: {groupName}</h2>
                  {renderSettlementContent(groupData, true)}
                </div>
              )) : (
                <div className="empty-state">
                  <p>No active settlements found across any of your groups.</p>
                </div>
              )}
          </div>
      ) : (
        renderSettlementContent(groupSettlements)
      )}
    </div>
  );
};

export default SettlementPage;

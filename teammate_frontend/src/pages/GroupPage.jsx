import { useContext, useEffect, useState } from 'react';
import GroupCard from '../components/group/GroupCard';
import GroupForm from '../components/group/GroupForm';
import MemberList from '../components/group/MemberList';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import formatCurrency from '../utils/formatCurrency';

const GroupPage = () => {
  const { user } = useAuth();
  const { groups, setGroups, expenses, addHistoryEvent, selectedGroupId, setSelectedGroupId } = useContext(AppContext);
  const selectedGroup = groups.find(g => String(g.groupId) === String(selectedGroupId)) || null;
  const [members, setMembers] = useState([]);

  const groupExpenses = expenses.filter(e => String(e.groupId) === String(selectedGroupId) && e.status === 'APPROVED');
  const totalSpent = groupExpenses.reduce((sum, exp) => sum + (exp.totalAmount || 0), 0);

  const handleAddGroup = async (group) => {
    try {
      // Connect to MySQL rather than just temporarily editing local browser state!
      const realGroup = await groupService.createGroup(group, user.userId);
      setGroups((prev) => [realGroup, ...prev]);
      addHistoryEvent('Group Created', `Group ${realGroup.name} created successfully.`);
    } catch (err) {
      console.error(err);
      const backendError = err.response?.data?.message || err.response?.data?.error || err.message;
      alert("JAVA BACKEND CRASH: " + backendError);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      groupService.getGroupMembers(selectedGroupId)
        .then(setMembers)
        .catch(() => setMembers([]));
    } else {
      setMembers([]);
    }
  }, [selectedGroupId]);

  const handleDeleteGroup = async (groupId) => {
    const targetGroup = groups.find((group) => String(group.groupId) === String(groupId));
    if (!targetGroup) return;
 
    // OPTIMISTIC UPDATE: Hide it immediately for a snappy feel!
    const previousGroups = [...groups];
    setGroups((prev) => prev.filter((group) => String(group.groupId) !== String(groupId)));
    if (String(selectedGroupId) === String(groupId)) {
        setSelectedGroupId(null);
    }

    try {
        await groupService.deleteGroup(groupId, user.userId);
        addHistoryEvent('Group Deleted', `Group ${targetGroup.name} was securely deleted.`, user.name);
    } catch(err) {
        console.error("Deletion sync failed", err);
        // ROLLBACK: Bring it back if the server says no!
        setGroups(previousGroups);
        
        // Extract real error message from backend if available!
        const backendError = err.response?.data || err.message;
        alert("Delete Failed: " + backendError);
    }
  };

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId(null);
      return;
    }

    if (!selectedGroupId || !groups.some((group) => String(group.groupId) === String(selectedGroupId))) {
      setSelectedGroupId(groups[0].groupId);
    }
  }, [groups, selectedGroupId, setSelectedGroupId]);

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Group Management</h1>
      </div>

      {selectedGroup && (
        <section className="content-card panel-pad" style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: '16px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ margin: 0, color: 'var(--brand-800)' }}>{selectedGroup.name} Overview</h2>
                    <p style={{ margin: '0.5rem 0 0 0', color: 'var(--brand-600)', fontSize: '0.9rem' }}>
                        Active Trip | {selectedGroup.currency || 'INR'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <div style={{ textAlign: 'center' }}>
                        <small style={{ display: 'block', color: 'var(--slate-500)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Total Spent</small>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-700)' }}>{formatCurrency(totalSpent)}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <small style={{ display: 'block', color: 'var(--slate-500)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Members</small>
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-700)' }}>{members.length}</span>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <small style={{ display: 'block', color: 'var(--slate-500)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600 }}>Status</small>
                        <span className={`badge ${selectedGroup.isLocked ? 'badge-danger' : 'badge-success'}`}>
                            {selectedGroup.isLocked ? 'Locked' : 'Open'}
                        </span>
                    </div>
                </div>
            </div>
        </section>
      )}

      <div className="grid-two">
        <GroupForm onSubmit={handleAddGroup} />
        <MemberList members={members} />
      </div>
      <section className="grid-two">
        {groups.map((group) => (
          <GroupCard
            key={group.groupId}
            group={group}
            onSelect={() => setSelectedGroupId(group.groupId)}
            onDeleteGroup={handleDeleteGroup}
          />
        ))}
      </section>
    </div>
  );
};

export default GroupPage;

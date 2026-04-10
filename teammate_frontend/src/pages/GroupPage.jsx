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
  const selectedGroup = groups.find(g => g.groupId === selectedGroupId) || null;

  const groupExpenses = expenses.filter(e => e.groupId === selectedGroupId && e.status === 'APPROVED');
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

  const handleDeleteGroup = async (groupId) => {
    const targetGroup = groups.find((group) => group.groupId === groupId);
    if (!targetGroup) return;

    try {
        await groupService.deleteGroup(groupId, user.userId);
        setGroups((prev) => prev.filter((group) => group.groupId !== groupId));
        addHistoryEvent('Group Deleted', `Group ${targetGroup.name} was securely deleted.`);
    } catch(err) {
        alert("Delete Failed: Network Error");
    }
  };

  useEffect(() => {
    if (!groups.length) {
      setSelectedGroupId(null);
      return;
    }

    if (!selectedGroupId || !groups.some((group) => group.groupId === selectedGroupId)) {
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
                        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-700)' }}>{selectedGroup.members?.length || 0}</span>
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
        <MemberList members={selectedGroup?.members || []} />
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

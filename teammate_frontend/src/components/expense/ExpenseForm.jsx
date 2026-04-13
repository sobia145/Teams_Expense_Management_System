import { useState, useEffect } from 'react';
import { BUDGET_CATEGORIES } from '../../utils/constants';
import { groupService } from '../../services/groupService';
import useAuth from '../../hooks/useAuth';

const ExpenseForm = ({ onAddExpense, disabled, creatorName, userGroups = [], selectedGroupId }) => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: BUDGET_CATEGORIES[0],
    customCategory: '',
    groupId: selectedGroupId || (userGroups.length > 0 ? userGroups[0].groupId : '')
  });
  
  const [groupMembers, setGroupMembers] = useState([]);
  const [splitType, setSplitType] = useState('EQUAL'); // 'EQUAL' or 'CUSTOM'
  const [customSplitMembers, setCustomSplitMembers] = useState([]);
 
  // Sync internal form groupId when the GLOBAL selectedGroupId changes in the header!
  useEffect(() => {
    if (selectedGroupId) {
        setForm(prev => ({ ...prev, groupId: selectedGroupId }));
    }
  }, [selectedGroupId]);

  // Sync default groupId when userGroups arrives from the backend!
  useEffect(() => {
    if (!form.groupId && userGroups.length > 0) {
        setForm(prev => ({ ...prev, groupId: userGroups[0].groupId }));
    }
  }, [userGroups, form.groupId]);
  
  useEffect(() => {
    if (form.groupId) {
        groupService.getGroupMembers(form.groupId).then((members) => {
            setGroupMembers(members);
            const initialIds = members.map(m => m.userId);
            if (user && !initialIds.includes(user.userId)) {
                initialIds.push(user.userId);
            }
            setCustomSplitMembers(initialIds);
        });
    }
  }, [form.groupId, user]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleParticipant = (userId) => {
      // Prevents the payer (self) from being deselected per user requirement
      if (userId === user?.userId) return;

      setCustomSplitMembers((prev) => 
          prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
  };

  const calculateSplits = () => {
    const splits = {};
    const totalAmount = parseFloat(form.amount) || 0;
    const numParticipants = customSplitMembers.length;
    
    if (numParticipants > 0 && totalAmount > 0) {
        const share = Math.floor((totalAmount / numParticipants) * 100) / 100;
        let cumulative = 0;

        customSplitMembers.forEach((id, index) => {
            if (index === numParticipants - 1) {
                // Last person takes the remainder to ensure perfect match
                splits[id] = parseFloat((totalAmount - cumulative).toFixed(2));
            } else {
                splits[id] = share;
                cumulative += share;
            }
        });
    }
    return splits;
  };

  const getShareAmount = () => {
    const totalAmount = parseFloat(form.amount) || 0;
    const numParticipants = customSplitMembers.length;
    if (numParticipants === 0 || totalAmount === 0) return 0;
    return (totalAmount / numParticipants).toFixed(2);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    
    if (!form.title || !form.amount || !form.groupId) {
        alert("Please select a valid group and fill all fields!");
        return;
    }

    const calculatedSplits = calculateSplits();
    if (Object.keys(calculatedSplits).length === 0) {
        alert("Cannot split expense with 0 participants selected!");
        return;
    }

    onAddExpense({
      title: form.title,
      totalAmount: Number(form.amount),
      paidBy: user.userId,
      groupId: form.groupId,
      categoryId: BUDGET_CATEGORIES.indexOf(form.category) + 1,
      category: form.category,
      customCategory: form.category === 'Other' ? form.customCategory : null,
      splits: calculatedSplits,
      expenseDate: new Date().toISOString().split('T')[0]
    });

    setForm((prev) => ({ ...prev, title: '', amount: '' }));
  };

  const isCurrentGroupLocked = userGroups.find(g => g.groupId === form.groupId)?.isLocked;

  return (
    <form className="content-card panel-pad stack-gap" onSubmit={onSubmit}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{marginBottom: '5px'}}>Add Expense</h3>
        {isCurrentGroupLocked && (
            <span className="badge badge-error" style={{background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca'}}>
                ⚠️ Team Locked
            </span>
        )}
      </div>
      <p style={{fontSize: '13px', color: 'var(--slate-500)', marginBottom: '15px'}}>Create a new expense and split it with your team.</p>

      {isCurrentGroupLocked && (
        <div style={{padding: '10px', background: 'var(--bg-card-alt)', borderRadius: '8px', borderLeft: '4px solid #dc2626', fontSize: '12px', color: '#dc2626', fontWeight: 'bold'}}>
            This Team is locked. No new expenses can be added until it is unlocked.
        </div>
      )}

      <div className="input-group">
        <label style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--slate-600)'}}>Select Team</label>
        <select
          className="select"
          value={form.groupId}
          disabled={userGroups.length === 0}
          onChange={(e) => onChange('groupId', parseInt(e.target.value))}
        >
          <option value="" disabled>Select Team Group...</option>
          {userGroups.map((group) => (
            <option key={group.groupId} value={group.groupId}>
              {group.isLocked ? '🔒' : '💸'} {group.name} {group.currency ? `(${group.currency})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="input-group">
        <label style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--slate-600)'}}>Payer</label>
        <div className="input" style={{background: 'var(--bg-card-alt)', color: 'var(--slate-500)', cursor: 'not-allowed'}}>
           <strong>{user?.name || 'Me'}</strong> (Automatically Included)
        </div>
      </div>

      <div className="input-group">
         <label style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--slate-600)'}}>Total Amount</label>
         <input
            className="input"
            placeholder="0.00"
            type="number"
            step="0.01"
            style={{ MozAppearance: 'textfield' }}
            value={form.amount}
            disabled={isCurrentGroupLocked}
            onChange={(e) => onChange('amount', e.target.value)}
          />
      </div>
      
      {/* 🚀 Participant Selection (Checkbox Grid) */}
      <div className="input-group">
        <label style={{fontSize: '12px', fontWeight: 'bold', color: 'var(--slate-600)'}}>Participants (Selected for split)</label>
        <div className="participant-selection content-card" style={{background: 'var(--bg-card-alt)', padding: '15px', borderRadius: '8px', marginTop: '5px'}}>
            <div className="checkbox-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxHeight: '150px', overflowY: 'auto'}}>
                {groupMembers.map((member) => (
                    <label key={member.userId} style={{
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        fontSize: '13px', 
                        opacity: (isCurrentGroupLocked || member.userId === user?.userId) ? 0.7 : 1,
                        cursor: (isCurrentGroupLocked || member.userId === user?.userId) ? 'not-allowed' : 'pointer'
                    }}>
                        <input 
                            type="checkbox" 
                            checked={customSplitMembers.includes(member.userId)}
                            disabled={isCurrentGroupLocked || member.userId === user?.userId}
                            onChange={() => toggleParticipant(member.userId)}
                        />
                        <span>{member.userId === user?.userId ? `${member.name} (Payer)` : member.name}</span>
                    </label>
                ))}
            </div>
            
            {parseFloat(form.amount) > 0 && (
                <div style={{
                    marginTop: '15px', 
                    paddingTop: '10px', 
                    borderTop: '1px border var(--slate-200)', 
                    textAlign: 'right',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#3b82f6'
                }}>
                    Each person pays: ₹{getShareAmount()}
                </div>
            )}
        </div>
      </div>

      <input
        className="input"
        placeholder="Expense title"
        value={form.title}
        disabled={isCurrentGroupLocked}
        onChange={(e) => onChange('title', e.target.value)}
      />
      <select
        className="select"
        value={form.category}
        disabled={isCurrentGroupLocked}
        onChange={(e) => onChange('category', e.target.value)}
        required
      >
        <option value="" disabled>Select Category...</option>
        {BUDGET_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      
      {form.category === 'Other' && (
        <input
            className="input"
            placeholder="Custom category name (e.g. Fuel ⛽)"
            value={form.customCategory}
            disabled={isCurrentGroupLocked}
            onChange={(e) => onChange('customCategory', e.target.value)}
            required
        />
      )}
      <button className="btn btn-primary" disabled={isCurrentGroupLocked} type="submit">
        Submit Expense
      </button>
    </form>
  );
};

export default ExpenseForm;

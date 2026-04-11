import { useState, useEffect } from 'react';
import { BUDGET_CATEGORIES } from '../../utils/constants';
import { groupService } from '../../services/groupService';

const ExpenseForm = ({ onAddExpense, disabled, creatorName, userGroups = [] }) => {
  const [form, setForm] = useState({
    title: '',
    amount: '',
    payer: '',
    category: BUDGET_CATEGORIES[0],
    groupId: userGroups.length > 0 ? userGroups[0].groupId : ''
  });
  
  const [groupMembers, setGroupMembers] = useState([]);
  const [splitType, setSplitType] = useState('EQUAL'); // 'EQUAL' or 'CUSTOM'
  const [customSplitMembers, setCustomSplitMembers] = useState([]);
 
  // Sync default groupId when userGroups arrives from the backend!
  useEffect(() => {
    if (!form.groupId && userGroups.length > 0) {
        setForm(prev => ({ ...prev, groupId: userGroups[0].groupId }));
    }
  }, [userGroups, form.groupId]);
 
  // Auto-fetch members of the selected group!
  useEffect(() => {
    if (form.groupId) {
        groupService.getGroupMembers(form.groupId).then((members) => {
            setGroupMembers(members);
            // Default Custom Splits checkboxes to include everyone by default
            setCustomSplitMembers(members.map(m => m.userId));
        });
    }
  }, [form.groupId]);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCustomSplit = (userId) => {
      setCustomSplitMembers((prev) => 
          prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
      );
  };

  const calculateSplits = () => {
      const splits = {};
      const totalAmount = parseFloat(form.amount) || 0;
      
      if (splitType === 'EQUAL') {
          const numMembers = groupMembers.length;
          if (numMembers > 0) {
              const equalAmount = totalAmount / numMembers;
              groupMembers.forEach(m => {
                  splits[m.userId] = parseFloat(equalAmount.toFixed(2));
              });
          }
      } else {
          const numSelected = customSplitMembers.length;
          if (numSelected > 0) {
              const equalAmount = totalAmount / numSelected;
              customSplitMembers.forEach(id => {
                  splits[id] = parseFloat(equalAmount.toFixed(2));
              });
          }
      }
      return splits;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.payer || !form.groupId) {
        alert("Please select a valid group and fill all fields!");
        return;
    }

    const calculatedSplits = calculateSplits();
    if (Object.keys(calculatedSplits).length === 0) {
        alert("Cannot split expense with 0 members selected!");
        return;
    }

    // Connect securely to the Backend mapping engine
    onAddExpense({
      title: form.title,
      totalAmount: Number(form.amount),
      paidBy: parseInt(form.payer),
      groupId: form.groupId,
      category: form.category || 'General',
      splits: calculatedSplits,
      expenseDate: new Date().toISOString().split('T')[0]
    });

    setForm((prev) => ({ ...prev, title: '', amount: '' }));
  };

  return (
    <form className="content-card panel-pad stack-gap" onSubmit={onSubmit}>
      <h3>Add Expense</h3>
      <select
        className="select"
        value={form.groupId}
        disabled={disabled || userGroups.length === 0}
        onChange={(e) => onChange('groupId', parseInt(e.target.value))}
      >
        <option value="" disabled>Select Team Group...</option>
        {userGroups.map((group) => (
          <option key={group.groupId} value={group.groupId}>
            💸 {group.name} {group.currency ? `(${group.currency})` : ''}
          </option>
        ))}
      </select>
      <select
        className="select"
        value={form.payer}
        disabled={disabled || groupMembers.length === 0}
        onChange={(e) => onChange('payer', e.target.value)}
      >
        <option value="" disabled>Select User who Paid...</option>
        {groupMembers.map((member) => (
          <option key={member.userId} value={member.userId}>
            {member.name}
          </option>
        ))}
      </select>
      <input
        className="input"
        placeholder="Amount"
        type="number"
        value={form.amount}
        disabled={disabled}
        onChange={(e) => onChange('amount', e.target.value)}
      />
      
      {/* 🚀 New Dynamic Splitting UI */}
      {form.amount && groupMembers.length > 0 && (
          <div className="split-engine content-card panel-pad" style={{background: 'var(--bg-card-alt)'}}>
            <p style={{fontSize: "14px", fontWeight: "600", marginBottom: "10px"}}>Split Strategy:</p>
            <div className="row-gap" style={{marginBottom: "15px"}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <input 
                        type="radio" 
                        name="splitType" 
                        checked={splitType === 'EQUAL'}
                        onChange={() => setSplitType('EQUAL')}
                    /> EQUAL SPLIT (All {groupMembers.length})
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <input 
                        type="radio" 
                        name="splitType" 
                        checked={splitType === 'CUSTOM'}
                        onChange={() => setSplitType('CUSTOM')}
                    /> CUSTOMIZE
                </label>
            </div>
            
            {splitType === 'CUSTOM' && (
                <div className="checkbox-grid stack-gap" style={{maxHeight: '150px', overflowY: 'auto'}}>
                    {groupMembers.map((member) => (
                        <label key={member.userId} style={{display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px'}}>
                            <input 
                                type="checkbox" 
                                checked={customSplitMembers.includes(member.userId)}
                                onChange={() => toggleCustomSplit(member.userId)}
                            />
                            <span>{member.name}</span>
                        </label>
                    ))}
                </div>
            )}
          </div>
      )}

      <input
        className="input"
        placeholder="Expense title"
        value={form.title}
        disabled={disabled}
        onChange={(e) => onChange('title', e.target.value)}
      />
      <select
        className="select"
        value={form.category}
        disabled={disabled}
        onChange={(e) => onChange('category', e.target.value)}
      >
        {BUDGET_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" disabled={disabled} type="submit">
        Submit Expense
      </button>
    </form>
  );
};

export default ExpenseForm;

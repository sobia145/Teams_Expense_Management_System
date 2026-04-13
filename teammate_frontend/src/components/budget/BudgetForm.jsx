import { useState, useEffect } from 'react';
import { BUDGET_CATEGORIES } from '../../utils/constants';

const BudgetForm = ({ onSave, userGroups = [], selectedGroupId, onSelectGroup }) => {
  const [form, setForm] = useState({ 
      category: BUDGET_CATEGORIES[0], 
      customCategory: '',
      limit: ''
  });
  const [spent, setSpent] = useState(0);

  useEffect(() => {
    if (selectedGroupId && form.category) {
        const catIdx = BUDGET_CATEGORIES.indexOf(form.category) + 1;
        import('../../services/api').then(({ default: api }) => {
            api.get('/expenses/category-spend', {
                params: {
                    groupId: selectedGroupId,
                    categoryId: catIdx,
                    category: form.category,
                    customCategory: form.category === 'Other' ? form.customCategory : null
                }
            }).then(res => setSpent(res.data))
              .catch(() => setSpent(0));
        });
    }
  }, [selectedGroupId, form.category, form.customCategory]);

  const onChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.limit || !selectedGroupId) {
        alert("Please select a group and assign a threshold!");
        return;
    }

    const limitVal = Number(form.limit);
    if (spent >= limitVal) {
        alert(`🚨 BUDGET EXCEEDED: You are setting a limit of ₹${limitVal} but have already spent ₹${spent} in this category!`);
    }

    // Map category name to ID (1-6)
    const categoryIndex = BUDGET_CATEGORIES.indexOf(form.category) + 1;

    onSave({
      groupId: selectedGroupId,
      categoryId: categoryIndex,
      category: form.category,
      customCategory: form.category === 'Other' ? form.customCategory : null,
      limitAmount: limitVal
    });
    setForm((prev) => ({ ...prev, limit: '' }));
  };

  return (
    <form className="content-card panel-pad stack-gap" onSubmit={onSubmit}>
      <h3>Set Category Budget</h3>
      <select
        className="select"
        value={selectedGroupId || ''}
        disabled={userGroups.length === 0}
        onChange={(e) => onSelectGroup(e.target.value ? parseInt(e.target.value) : null)}
      >
        <option value="" disabled>Select Target Group...</option>
        {userGroups.map((group) => (
          <option key={group.groupId} value={group.groupId}>
            💸 {group.name} {group.currency ? `(${group.currency})` : ''}
          </option>
        ))}
      </select>
      <select
        className="select"
        value={form.category}
        onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
      >
        {BUDGET_CATEGORIES.map((category) => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>

      {form.category === 'Other' && (
          <input 
            className="input"
            placeholder="Custom Category name"
            value={form.customCategory}
            onChange={(e) => setForm((prev) => ({ ...prev, customCategory: e.target.value }))}
            required
          />
      )}
      {form.groupId && form.category && (
          <div style={{ 
              fontSize: '0.9rem', 
              fontWeight: '600', 
              padding: '8px 12px', 
              borderRadius: '8px',
              backgroundColor: spent > (Number(form.limit) || 0) ? 'var(--danger-50)' : (spent > (Number(form.limit) || 0) * 0.8 ? 'var(--warning-50)' : 'var(--brand-50)'),
              color: spent > (Number(form.limit) || 0) ? 'var(--danger-600)' : (spent > (Number(form.limit) || 0) * 0.8 ? 'var(--warning-700)' : 'var(--brand-700)'),
              border: `1px solid ${spent > (Number(form.limit) || 0) ? 'var(--danger-200)' : (spent > (Number(form.limit) || 0) * 0.8 ? 'var(--warning-300)' : 'var(--brand-200)')}`
          }}>
            Spent so far: ₹{spent} {form.limit ? `/ ₹${form.limit}` : ''}
            {form.limit && spent > Number(form.limit) && <span style={{display: 'block', fontSize: '0.75rem', marginTop: '4px'}}>⚠️ LIMIT EXCEEDED</span>}
            {form.limit && spent > Number(form.limit) * 0.8 && spent <= Number(form.limit) && <span style={{display: 'block', fontSize: '0.75rem', marginTop: '4px'}}>⚠️ NEAR LIMIT (80%+)</span>}
          </div>
      )}

      <input
        className="input"
        type="number"
        placeholder="Budget limit"
        value={form.limit}
        onChange={(e) => onChange('limit', e.target.value)}
      />
      <button className="btn btn-primary" type="submit">
        Save Budget
      </button>
    </form>
  );
};

export default BudgetForm;

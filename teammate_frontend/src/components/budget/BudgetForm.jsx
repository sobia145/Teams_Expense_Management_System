import { useState } from 'react';
import { BUDGET_CATEGORIES } from '../../utils/constants';

const BudgetForm = ({ onSave, userGroups = [] }) => {
  const [form, setForm] = useState({ 
      category: BUDGET_CATEGORIES[0], 
      limit: '',
      groupId: userGroups.length > 0 ? userGroups[0].groupId : '' 
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.limit || !form.groupId) {
        alert("Please select a group and assign a threshold!");
        return;
    }

    onSave({
      id: Date.now(),
      groupId: form.groupId,
      category: form.category,
      limit: Number(form.limit),
      spent: 0
    });
    setForm((prev) => ({ ...prev, limit: '' }));
  };

  return (
    <form className="content-card panel-pad stack-gap" onSubmit={onSubmit}>
      <h3>Set Category Budget</h3>
      <select
        className="select"
        value={form.groupId}
        disabled={userGroups.length === 0}
        onChange={(e) => setForm((prev) => ({ ...prev, groupId: parseInt(e.target.value) }))}
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
          <option key={category}>{category}</option>
        ))}
      </select>
      <input
        className="input"
        type="number"
        placeholder="Budget limit"
        value={form.limit}
        onChange={(e) => setForm((prev) => ({ ...prev, limit: e.target.value }))}
      />
      <button className="btn btn-primary" type="submit">
        Save Budget
      </button>
    </form>
  );
};

export default BudgetForm;

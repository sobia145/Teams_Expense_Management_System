import { useState, useEffect } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import { BUDGET_CATEGORIES } from '../../utils/constants';

const BudgetMeter = ({ item }) => {
  const [spent, setSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // 1. Fetch real-time spending from the source of truth (Backend)
  useEffect(() => {
    const groupId = item.group?.groupId || item.groupId;
    const categoryId = item.categoryId;
    const categoryName = item.category;
    const customCategory = item.customCategory;

    if (groupId && (categoryId || categoryName)) {
        import('../../services/api').then(({ default: api }) => {
            api.get('/expenses/category-spend', {
                params: {
                    groupId,
                    categoryId,
                    category: categoryName,
                    customCategory: categoryName === 'Other' ? customCategory : null
                }
            }).then(res => {
                setSpent(res.data);
                setLoading(false);
            }).catch(() => {
                setSpent(0);
                setLoading(false);
            });
        });
    }
  }, [item]);

  const limit = item.limitAmount || 1;
  const percentage = Math.round((spent / limit) * 100 || 0);
  const isExceeded = spent >= limit;
  const isWarning = percentage >= 80 && !isExceeded;

  const categoryName = item.category || (item.categoryId === 6 ? item.customCategory : BUDGET_CATEGORIES[item.categoryId - 1]);

  return (
    <article className="content-card panel-pad" style={{
        border: isExceeded ? '2px solid var(--danger-500)' : isWarning ? '2px solid var(--warning-500)' : '1px solid var(--border-color)',
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.3s ease'
    }}>
      <div className="panel-head">
        <h4>{categoryName}</h4>
        <span className={`badge ${isExceeded ? 'badge-danger' : isWarning ? 'badge-warning' : 'badge-success'}`}>
            {isExceeded ? 'EXCEEDED' : isWarning ? 'NEAR LIMIT' : 'HEALTHY'}
        </span>
      </div>
      <p style={{fontWeight: 700, fontSize: '1.2rem', margin: '5px 0'}}>
        {formatCurrency(spent)} <span style={{fontWeight: 400, color: 'var(--text-muted)', fontSize: '1rem'}}>of {formatCurrency(limit)}</span>
      </p>
      
      <div className="meter-track" style={{background: 'var(--bg-card-alt)', height: '12px', borderRadius: '6px', overflow: 'hidden', margin: '12px 0'}}>
        <div
          className="meter-fill"
          style={{
            height: '100%',
            width: `${Math.min(100, percentage)}%`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            background: isExceeded ? 'var(--danger-500)' : isWarning ? 'var(--warning-500)' : 'var(--success-500)'
          }}
        />
      </div>
      
      <div className="stack-gap-sm">
          {isExceeded && (
            <div className="text-danger" style={{fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px'}}>
              <span style={{fontSize: '1.2rem'}}>🚨</span> Budget Exceeded! ({(percentage).toLocaleString()}% used)
            </div>
          )}
          {isWarning && (
            <div className="text-warning" style={{fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px'}}>
              <span style={{fontSize: '1.2rem'}}>⚠️</span> Approaching limit ({percentage}% used)
            </div>
          )}
          {!isExceeded && !isWarning && (
            <div className="text-success" style={{fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px'}}>
              <span style={{fontSize: '1.2rem'}}>✅</span> Safe spending zone ({percentage}% used)
            </div>
          )}
      </div>
    </article>
  );
};

export default BudgetMeter;

import formatCurrency from '../../utils/formatCurrency';

const BudgetMeter = ({ item }) => {
  const percentage = Math.min(100, Math.round((item.spent / item.limit) * 100 || 0));
  const danger = item.spent > item.limit;

  return (
    <article className="content-card panel-pad">
      <div className="panel-head">
        <h4>{item.category}</h4>
        <span className="badge">{percentage}%</span>
      </div>
      <p>
        {formatCurrency(item.spent)} / {formatCurrency(item.limit)}
      </p>
      <div className="meter-track">
        <div
          className="meter-fill"
          style={{
            width: `${percentage}%`,
            background: danger ? 'var(--danger-600)' : 'var(--brand-700)'
          }}
        />
      </div>
      {danger && <small style={{ color: 'var(--danger-600)' }}>Threshold exceeded</small>}
    </article>
  );
};

export default BudgetMeter;

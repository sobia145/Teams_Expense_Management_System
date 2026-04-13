import { getCountdownLabel } from '../../utils/dateUtils';

const stylesByType = {
  approval: { background: 'var(--brand-100)', border: 'var(--brand-500)', accent: 'var(--brand-600)' },
  budget: { background: 'var(--accent-100)', border: 'var(--accent-700)', accent: 'var(--accent-700)' },
  reminder: { background: 'color-mix(in srgb, var(--success-600) 12%, var(--bg-surface))', border: 'var(--success-600)', accent: 'var(--success-700)' }
};

const NotificationItem = ({ notification, onAction }) => {
  const style = stylesByType[notification.type] || stylesByType.approval;
  const countdown = getCountdownLabel(notification.objectionDeadline);

  return (
    <article
      className="notification-item"
      style={{ background: style.background, borderColor: style.border }}
    >
      <div className="notification-content">
        <h4>{notification.expenseTitle}</h4>
        <p>
          <strong>{notification.payerName}</strong> added this expense — 
          your share is <strong>₹{notification.amountOwedByMe}</strong>
        </p>
        {countdown && (
            <small style={{ color: countdown === 'Expired' ? 'var(--color-danger)' : style.accent, fontWeight: 'bold' }}>
                ⏳ {countdown}
            </small>
        )}
      </div>
      <div className="notification-actions row-gap-sm" style={{ marginTop: '0.5rem' }}>
        <button 
            className="btn btn-primary btn-sm" 
            onClick={() => onAction(notification.approvalId, 'APPROVED')}
        >
          Approve Now
        </button>
        <button 
            className="btn btn-danger btn-sm" 
            onClick={() => onAction(notification.approvalId, 'OBJECTED')}
        >
          Object
        </button>
      </div>
    </article>
  );
};

export default NotificationItem;

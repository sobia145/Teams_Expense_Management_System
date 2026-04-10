import { formatDateTime } from '../../utils/dateUtils';

const stylesByType = {
  approval: { background: 'var(--brand-100)', border: 'var(--brand-500)' },
  budget: { background: 'var(--accent-100)', border: 'var(--accent-700)' },
  reminder: { background: 'color-mix(in srgb, var(--success-600) 12%, var(--bg-surface))', border: 'var(--success-600)' }
};

const NotificationItem = ({ notification, onToggleRead }) => {
  const style = stylesByType[notification.type] || stylesByType.approval;

  return (
    <article
      className="notification-item"
      style={{ background: style.background, borderColor: style.border }}
    >
      <div>
        <h4>Signature Required: {notification.expense?.title}</h4>
        <p>A teammate requested your approval on a split! Cost: Rs. {notification.expense?.totalAmount || 0}</p>
        <small>{formatDateTime(notification.expense?.createdAt || new Date().toISOString())}</small>
      </div>
      <button className="btn btn-muted" onClick={() => onToggleRead(notification.approvalId)}>
        Acknowledge
      </button>
    </article>
  );
};

export default NotificationItem;

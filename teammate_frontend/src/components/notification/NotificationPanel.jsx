import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import NotificationItem from './NotificationItem';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const NotificationPanel = ({ onAction }) => {
  const { notifications, setNotifications } = useContext(AppContext);
  const { user } = useAuth();

  const handleAction = async (notificationId, status) => {
    try {
      const target = notifications.find(n => n.approvalId === notificationId);
      if (!target || !user) return;

      const expenseId = target.expenseId || target.id;

      // Physically persist the choice in MySQL
      const endpoint = `/approvals/${expenseId}/status/${user.userId}/${status}`;
      await api.post(endpoint);

      // Remove from UI state after DB confirmation
      setNotifications((prev) => prev.filter((item) => item.approvalId !== notificationId));
      
      if (onAction) onAction();
    } catch (error) {
      console.error("Action Failed:", error);
      alert("Encryption error or sync failure. Please try again.");
    }
  };

  return (
    <section className="content-card panel-pad">
      <div className="panel-head">
        <h3>Action Required!</h3>
        <span className="badge">
          {notifications.length} Pending
        </span>
      </div>
      <div className="stack-gap">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.approvalId}
            notification={notification}
            onAction={handleAction}
          />
        ))}
        {notifications.length === 0 && <p style={{color: 'var(--color-muted)'}}>All clear, boss!</p>}
      </div>
    </section>
  );
};

export default NotificationPanel;

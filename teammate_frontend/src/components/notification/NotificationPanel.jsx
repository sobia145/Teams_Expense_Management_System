import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import NotificationItem from './NotificationItem';

const NotificationPanel = () => {
  const { notifications, setNotifications } = useContext(AppContext);

  const toggleRead = (notificationId) => {
    // Temporary client-side discard for acknowledged notifications
    setNotifications((prev) => prev.filter((item) => item.approvalId !== notificationId));
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
            onToggleRead={toggleRead}
          />
        ))}
        {notifications.length === 0 && <p style={{color: 'var(--color-muted)'}}>All clear, boss!</p>}
      </div>
    </section>
  );
};

export default NotificationPanel;

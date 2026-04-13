import { useContext } from 'react';
import { formatDateTime } from '../../utils/dateUtils';
import { AppContext } from '../../context/AppContext';

const HistoryItem = ({ item }) => {
  const { groups } = useContext(AppContext);
  
  // Logic: Identify if the group still exists in the active state
  const groupExists = item.groupId && groups.some(g => String(g.groupId) === String(item.groupId));
  const groupLabel = item.groupName ? (groupExists ? item.groupName : `${item.groupName} (deleted)`) : null;

  return (
    <article className="history-item">
      <div className="history-header">
        <h4>{item.action || item.event}</h4>
        {groupLabel && <span className="history-group-badge">{groupLabel}</span>}
      </div>
      <p>{item.newData || item.details}</p>
      <small>
        <strong>{item.performedByName || item.actor || 'System'}</strong> | {formatDateTime(item.createdAt || item.time)}
      </small>
    </article>
  );
};

export default HistoryItem;

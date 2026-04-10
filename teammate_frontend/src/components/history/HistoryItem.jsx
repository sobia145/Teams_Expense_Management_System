import { formatDateTime } from '../../utils/dateUtils';

const HistoryItem = ({ item }) => {
  return (
    <article className="history-item">
      <h4>{item.action || item.event}</h4>
      <p>{item.newData || item.details}</p>
      <small>
        <strong>{item.performedByName || item.actor || 'System'}</strong> | {formatDateTime(item.time || item.createdAt)}
      </small>
    </article>
  );
};

export default HistoryItem;

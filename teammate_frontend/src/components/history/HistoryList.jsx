import HistoryItem from './HistoryItem';

const HistoryList = ({ items }) => {
  return (
    <section className="content-card panel-pad stack-gap">
      <h3>Immutable Activity Log</h3>
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} />
      ))}
    </section>
  );
};

export default HistoryList;

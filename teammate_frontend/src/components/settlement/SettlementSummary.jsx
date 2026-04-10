import formatCurrency from '../../utils/formatCurrency';

const SettlementSummary = ({ rows, tripLocked }) => {
  const pending = rows.filter((item) => item.status !== 'PAID');
  const pendingAmount = pending.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="content-card panel-pad stack-gap">
      <h3>Settlement Summary</h3>
      <p>Total transactions: {rows.length}</p>
      <p>Pending transactions: {pending.length}</p>
      <p>Pending amount: {formatCurrency(pendingAmount)}</p>
      <div className="badge" style={{ width: 'fit-content' }}>
        {tripLocked ? 'Trip Locked' : 'Trip Open'}
      </div>
    </section>
  );
};

export default SettlementSummary;

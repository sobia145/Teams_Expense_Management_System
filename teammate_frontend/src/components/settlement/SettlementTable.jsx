import formatCurrency from '../../utils/formatCurrency';

const SettlementTable = ({ rows, onMarkPaid, onDownloadReceipt, disabled }) => {
  return (
    <section className="content-card panel-pad">
      <h3>Optimized Settlements</h3>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Team</th>
              <th>Expense</th>
              <th>From</th>
              <th>To</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={index}>
                <td>{item.teamName || '-'}</td>
                <td>{item.expenseTitle || `Debt Clearance`}</td>
                <td>{item.fromUserName || item.from}</td>
                <td>{item.toUserName || item.to}</td>
                <td>{formatCurrency(item.amount)}</td>
                <td>{item.status || 'UNPAID'}</td>
                <td>
                  <div className="row-gap">
                    <button
                      className="btn btn-muted"
                      disabled={disabled || item.status === 'PAID'}
                      onClick={() => onMarkPaid(index)}
                    >
                      Mark Paid
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={item.status !== 'PAID'}
                      onClick={() => onDownloadReceipt(item)}
                      title={item.status !== 'PAID' ? 'Mark this settlement as paid to download receipt' : 'Download receipt'}
                    >
                      Download Receipt
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SettlementTable;

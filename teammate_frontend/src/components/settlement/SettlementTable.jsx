import formatCurrency from '../../utils/formatCurrency';

const SettlementTable = ({ rows, onMarkPaid, onDownloadReceipt, disabled }) => {
  return (
    <section className="content-card panel-pad">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
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
                <td><strong>{item.fromUserName || item.from}</strong></td>
                <td>{item.toUserName || item.to}</td>
                <td><span className="amount-pill">{formatCurrency(item.amount)}</span></td>
                <td>
                    <span className={`status-badge ${item.status === 'PAID' ? 'status-success' : 'status-pending'}`}>
                        {item.status || 'UNPAID'}
                    </span>
                </td>
                <td>
                  <div className="row-gap">
                    {onMarkPaid && (
                        <button
                          className="btn btn-muted"
                          disabled={disabled || item.status === 'PAID'}
                          onClick={() => onMarkPaid(item)}
                        >
                          Mark Paid
                        </button>
                    )}
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
            {rows.length === 0 && (
                <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
                        No records found in this category.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SettlementTable;

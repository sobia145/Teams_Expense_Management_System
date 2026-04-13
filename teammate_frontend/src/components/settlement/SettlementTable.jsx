import formatCurrency from '../../utils/formatCurrency';

const SettlementTable = ({ rows, onMarkPaid, disabled, isOwner }) => {
  return (
    <section className="content-card panel-pad">
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{isOwner ? 'To Member' : 'From Member'}</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <tr key={index}>
                <td><strong>{isOwner ? (item.toUserName || item.to) : (item.fromUserName || item.from)}</strong></td>
                <td><span className="amount-pill">{formatCurrency(item.amount)}</span></td>
                <td>
                    <span className={`status-badge ${item.status === 'PAID' ? 'status-success' : 'status-pending'}`}>
                        {item.status || 'UNPAID'}
                    </span>
                </td>
                <td>
                  <div className="row-gap">
                    {item.status === 'PAID' ? (
                      <span className="paid-timestamp" style={{fontSize: '12px', color: 'var(--color-muted)'}}>
                        Paid on {item.settledAt ? new Date(item.settledAt).toLocaleDateString() : 'N/A'}
                      </span>
                    ) : (
                      onMarkPaid && (
                        <button
                          className="btn btn-muted"
                          disabled={disabled}
                          onClick={() => {
                            console.log("[SettlementTable] Mark Paid Clicked for item:", item);
                            onMarkPaid(item);
                          }}
                        >
                          Mark Paid
                        </button>
                      )
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
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

import formatCurrency from '../../utils/formatCurrency';

const GroupExpenseLedger = ({ expenses }) => {
  return (
    <section className="content-card panel-pad stack-gap" style={{marginTop: '2rem'}}>
      <div className="panel-head">
        <h3>Group Expense History</h3>
        <span className="badge">{expenses.length} Records</span>
      </div>
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Expense Title</th>
              <th>Paid By</th>
              <th>Total Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.expenseId || expense.id}>
                <td>{expense.expenseDate || 'N/A'}</td>
                <td><strong>{expense.title}</strong></td>
                <td>{expense.paidBy?.name || 'Unknown'}</td>
                <td><span className="amount-pill">{formatCurrency(expense.totalAmount)}</span></td>
                <td>
                  <span className={`status-badge ${
                    expense.status === 'APPROVED' ? 'status-success' : 
                    expense.status === 'OBJECTED' ? 'status-danger' : 
                    'status-pending'
                  }`}>
                    {expense.status}
                  </span>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--color-muted)'}}>
                  No expenses recorded for this group yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default GroupExpenseLedger;

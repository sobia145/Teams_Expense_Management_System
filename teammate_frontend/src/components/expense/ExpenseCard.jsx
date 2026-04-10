import { formatDateTime } from '../../utils/dateUtils';
import formatCurrency from '../../utils/formatCurrency';

const ExpenseCard = ({ expense, onDeleteExpense, canDeleteExpense, getDeleteBlockReason }) => {
  const isObjected = expense.status === 'OBJECTED' || expense.status === 'DISPUTED';
  const statusLabel = isObjected ? 'Objected' : expense.status.charAt(0) + expense.status.slice(1).toLowerCase();
  const allowDelete = canDeleteExpense ? canDeleteExpense(expense) : true;
  const deleteBlockReason = getDeleteBlockReason ? getDeleteBlockReason(expense) : '';

  const handleDelete = () => {
    if (!allowDelete) return;

    const shouldDelete = window.confirm(`Delete expense "${expense.title}"?`);
    if (!shouldDelete) return;
    onDeleteExpense?.(expense.id);
  };

  return (
    <article className={`content-card panel-pad expense-card ${isObjected ? 'expense-card-objected' : ''}`}>
      <div className="panel-head">
        <h4>{expense.title}</h4>
        <span className="badge">{statusLabel}</span>
      </div>
      <p>{formatCurrency(expense.totalAmount || 0)}</p>
      <p>Paid by: {expense.paidBy?.name || 'Loading...'}</p>
      {isObjected && expense.objectionReason && (
        <p className="expense-objection-note">
          <strong>Objection reason:</strong> {expense.objectionReason}
        </p>
      )}
      <div className="card-actions">
        <button
          className="btn btn-danger"
          type="button"
          onClick={handleDelete}
          disabled={!allowDelete}
          title={deleteBlockReason || 'Delete this expense'}
        >
          Delete Expense
        </button>
      </div>
      {isObjected && expense.objectionRaisedAt && <small>Objected on {formatDateTime(expense.objectionRaisedAt)}</small>}
      <small>{formatDateTime(expense.createdAt)}</small>
    </article>
  );
};

export default ExpenseCard;

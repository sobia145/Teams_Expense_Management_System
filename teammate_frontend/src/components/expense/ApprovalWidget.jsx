import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const ApprovalWidget = ({
  expenses,
  onUpdateStatus,
  onRaiseObjection,
  onDeleteExpense,
  canDeleteExpense,
  getDeleteBlockReason
}) => {
  const { notifications } = useContext(AppContext);
  const pending = expenses.filter((item) => item.status === 'PENDING');

  const calculateHoursLeft = (createdAt) => {
    if (!createdAt) return 24;
    const createdTime = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffHours = (now - createdTime) / (1000 * 60 * 60);
    return Math.max(0, Math.floor(24 - diffHours));
  };

  return (
    <section className="content-card panel-pad">
      <div className="panel-head">
        <h3>Pending Expenses</h3>
        <span className="badge">{pending.length} pending</span>
      </div>

      <div className="stack-gap">
        {pending.map((expense) => {
          const allowDelete = canDeleteExpense ? canDeleteExpense(expense) : true;
          const deleteBlockReason = getDeleteBlockReason ? getDeleteBlockReason(expense) : '';
          const hoursLeft = calculateHoursLeft(expense.createdAt);
          const isExpired = hoursLeft === 0;
          
          // CRITICAL: Only allow approving if there is an active MySQL PENDING ticket targeting you!
          const userNeedsToApprove = notifications.some(n => n.expense?.expenseId === expense.expenseId || n.expense?.expenseId === expense.id);

          return (
            <article key={expense.id || expense.expenseId} className="approval-row">
              <div>
                <strong>{expense.title}</strong>
                <p>{hoursLeft}h left in objection window {isExpired && <span style={{color:'var(--color-danger)'}}>(EXPIRED)</span>}</p>
              </div>
              <div className="row-gap">
                {userNeedsToApprove && !isExpired && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => onUpdateStatus(expense.id || expense.expenseId, 'APPROVED')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-muted"
                      onClick={() => onRaiseObjection(expense)}
                    >
                      Raise Objection
                    </button>
                  </>
                )}
                {isExpired && userNeedsToApprove && (
                   <p style={{fontSize: '12px', color: 'var(--color-danger)'}}>Lock expired. Automatic discard processing.</p>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => onDeleteExpense(expense.id || expense.expenseId)}
                  disabled={!allowDelete}
                  title={deleteBlockReason || 'Delete this expense'}
                >
                  Delete
                </button>
              </div>
            </article>
          );
        })}
        {!pending.length && <p>Everything is reviewed.</p>}
      </div>
    </section>
  );
};

export default ApprovalWidget;

import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { getCountdownLabel } from '../../utils/dateUtils';

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
          const countdown = getCountdownLabel(expense.objectionDeadline);
          const isExpired = countdown === 'Expired';
          
          // Check if WE (authenticated user) have an active notification for this
          const myNotification = notifications.find(n => String(n.expenseId) === String(expense.expenseId || expense.id));

          return (
            <article key={expense.id || expense.expenseId} className="approval-card panel-pad">
              <div className="approval-card-info">
                <h4>{expense.title}</h4>
                {countdown && (
                    <p className={`countdown-timer ${isExpired ? 'expired' : ''}`}>
                         ⏳ {countdown}
                    </p>
                )}
                
                {/* Member Status Tracker */}
                <div className="member-status-list">
                    {expense.approvals && expense.approvals.map(app => (
                        <div key={app.approvalId} className="member-status-row">
                            <span>{app.user?.name}</span>
                            <span className={`status-dot ${app.status?.toLowerCase()}`}></span>
                            <small>{app.status}</small>
                        </div>
                    ))}
                </div>
              </div>

              <div className="card-actions">
                {myNotification && !isExpired && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => onUpdateStatus(expense.id || expense.expenseId, 'APPROVED')}
                    >
                      Approve Now
                    </button>
                    <button
                      className="btn btn-muted"
                      onClick={() => onRaiseObjection(expense)}
                    >
                      Object
                    </button>
                  </>
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

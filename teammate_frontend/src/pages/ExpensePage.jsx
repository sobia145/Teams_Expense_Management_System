import { useContext, useState, useEffect } from 'react';
import ApprovalWidget from '../components/expense/ApprovalWidget';
import Modal from '../components/common/Modal';
import ExpenseForm from '../components/expense/ExpenseForm';
import ExpenseList from '../components/expense/ExpenseList';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';

const ExpensePage = () => {
  const { expenses, setExpenses, groups, settlements, tripLocked, addHistoryEvent } = useContext(AppContext);
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const [objectionTarget, setObjectionTarget] = useState(null);
  const [objectionReason, setObjectionReason] = useState('');

  // Hydrate only groups mapped directly to this user!
  useEffect(() => {
    if(user && user.userId) {
        groupService.getGroupsForApp(user).then(setUserGroups);
    }
  }, [user]);

  const pendingExpenses = expenses.filter((item) => item.status === 'PENDING');
  const approvedExpenses = expenses.filter((item) => item.status === 'APPROVED');
  const objectedExpenses = expenses.filter(
    (item) => item.status === 'OBJECTED' || item.status === 'DISPUTED'
  );

  const addExpense = async (expensePayload) => {
    try {
        const savedExpense = await expenseService.addExpense(expensePayload);
        setExpenses((prev) => [savedExpense, ...prev]);
        addHistoryEvent('Expense Submitted', `${savedExpense.title} saved persistently for Rs. ${savedExpense.totalAmount}.`);
    } catch (err) {
        console.error(err);
        const backendError = err.response?.data?.message || err.response?.data?.error || err.message;
        alert("JAVA BACKEND CRASH: " + backendError);
    }
  };

  const isExpenseCreator = (expense) => {
    const creatorName = expense.createdBy || expense.payer;
    return Boolean(user?.name) && user.name === creatorName;
  };

  const isExpenseFullySettled = (expense) => {
    const group = groups.find((item) => item.id === expense.groupId);
    if (!group) return false;

    const requiredMembers = group.members.filter((member) => member !== expense.payer);
    if (!requiredMembers.length) return true;

    const expenseRows = settlements.filter((row) => row.expenseId === expense.id);

    return requiredMembers.every((member) =>
      expenseRows.some((row) => row.from === member && row.status === 'PAID')
    );
  };

  const getDeleteBlockReason = (expense) => {
    if (!isExpenseCreator(expense)) {
      return 'Only the person who created this expense can delete it.';
    }

    if (!isExpenseFullySettled(expense)) {
      return 'This expense can be deleted only after all team members have completed settlement.';
    }

    return '';
  };

  const canDeleteExpense = (expense) => !getDeleteBlockReason(expense);

  const updateStatus = async (expenseId, status) => {
    try {
        const updatedExpense = await expenseService.updateStatus({ expenseId, userId: user.userId, status });
        setExpenses((prev) =>
          prev.map((item) => (item.id === expenseId || item.expenseId === expenseId ? updatedExpense : item))
        );
        addHistoryEvent('Expense Status Updated', `Expense #${expenseId} moved to ${status}.`);
    } catch (e) {
        console.error(e);
        alert("SQL Write Error: Failed to save approval ticket to backend map!");
    }
  };

  const deleteExpense = (expenseId) => {
    const targetExpense = expenses.find((item) => item.id === expenseId);
    if (!targetExpense) return;

    const blockReason = getDeleteBlockReason(targetExpense);
    if (blockReason) {
      window.alert(blockReason);
      return;
    }

    setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
    addHistoryEvent('Expense Deleted', `${targetExpense.title} was deleted.`);
  };

  const openObjection = (expense) => {
    setObjectionTarget(expense);
    setObjectionReason(expense.objectionReason || '');
  };

  const closeObjection = () => {
    setObjectionTarget(null);
    setObjectionReason('');
  };

  const submitObjection = async (e) => {
    e.preventDefault();

    if (!objectionTarget || !objectionReason.trim()) return;

    try {
        const expenseId = objectionTarget.id || objectionTarget.expenseId;
        const updatedExpense = await expenseService.updateStatus({
             expenseId, 
             userId: user.userId, 
             status: 'OBJECTED' 
        });

        setExpenses((prev) =>
          prev.map((item) =>
            item.id === expenseId || item.expenseId === expenseId
              ? {
                  ...updatedExpense,
                  objectionReason: objectionReason.trim()
                }
              : item
          )
        );

        addHistoryEvent(
          'Expense Objection Raised',
          `${objectionTarget.title} was objected with reason: ${objectionReason.trim()}`
        );

        closeObjection();
    } catch (err) {
        console.error("SQL Objection Failure", err);
    }
  };

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Expense Workflow</h1>
        <span className="badge">{tripLocked ? 'Trip Locked' : 'Trip Active'}</span>
      </div>
      <div className="grid-two">
        <ExpenseForm 
            onAddExpense={addExpense} 
            disabled={tripLocked} 
            creatorName={user?.name || ''} 
            userGroups={userGroups} 
        />
        <ApprovalWidget
          expenses={pendingExpenses}
          onUpdateStatus={updateStatus}
          onRaiseObjection={openObjection}
          onDeleteExpense={deleteExpense}
          canDeleteExpense={canDeleteExpense}
          getDeleteBlockReason={getDeleteBlockReason}
        />
      </div>
      <ExpenseList
        title="Approved Expenses"
        expenses={approvedExpenses}
        onDeleteExpense={deleteExpense}
        canDeleteExpense={canDeleteExpense}
        getDeleteBlockReason={getDeleteBlockReason}
        emptyMessage="No approved expenses yet."
      />
      <ExpenseList
        title="Objected Expenses"
        expenses={objectedExpenses}
        onDeleteExpense={deleteExpense}
        canDeleteExpense={canDeleteExpense}
        getDeleteBlockReason={getDeleteBlockReason}
        emptyMessage="No objections raised yet."
      />

      <Modal open={Boolean(objectionTarget)} title="Raise Objection" onClose={closeObjection}>
        <form className="stack-gap" onSubmit={submitObjection}>
          <div className="objected-summary content-card panel-pad">
            <strong>{objectionTarget?.title}</strong>
            <p>{objectionTarget ? `Rs. ${objectionTarget.amount} paid by ${objectionTarget.payer}` : ''}</p>
          </div>
          <label className="stack-gap objection-field">
            <span>Reason for the objection</span>
            <textarea
              className="textarea"
              rows="4"
              placeholder="Explain what is wrong with this expense so the team can review it"
              value={objectionReason}
              onChange={(e) => setObjectionReason(e.target.value)}
              required
            />
          </label>
          <div className="row-gap">
            <button className="btn btn-primary" type="submit">
              Submit Objection
            </button>
            <button className="btn btn-muted" type="button" onClick={closeObjection}>
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpensePage;

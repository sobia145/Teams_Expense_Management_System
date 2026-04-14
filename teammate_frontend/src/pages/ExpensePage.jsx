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
  const { 
    expenses, setExpenses, groups, settlements, groupLocked, addHistoryEvent,
    selectedGroupId, setSelectedGroupId
  } = useContext(AppContext);
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const [objectionTarget, setObjectionTarget] = useState(null);
  const [objectionReason, setObjectionReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Hydrate only groups mapped directly to this user!
  useEffect(() => {
    if(user && user.userId) {
        groupService.getGroupsForApp(user).then(setUserGroups);
    }
  }, [user]);

  // V2 STABILIZATION: Isolated fetch with locking to prevent global overwrites
  useEffect(() => {
    let isMounted = true;
    
    if (selectedGroupId) {
        setLoading(true);
        expenseService.getExpensesByGroup(selectedGroupId)
            .then(data => {
                if (isMounted) setExpenses(data);
            })
            .catch(() => {
                if (isMounted) setExpenses([]);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
    } else if (user && user.userId) {
        setLoading(true);
        expenseService.getExpenses(user)
            .then(data => {
                if (isMounted) setExpenses(data);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
    } else {
        setExpenses([]);
    }

    return () => { isMounted = false; };
  }, [selectedGroupId, user, setExpenses]);

  // Filter logic updated to strictly respect group isolation (Fix 1)
  // Use String() coercion to prevent Number/String type mismatch bug reported in testing (Problem 2)
  const isCorrectGroup = (item) => !selectedGroupId || String(item.groupId || item.group?.groupId) === String(selectedGroupId);

  const pendingExpenses = expenses.filter((item) => item.status === 'PENDING' && isCorrectGroup(item));
  const approvedExpenses = expenses.filter((item) => 
    ['APPROVED', 'SETTLED', 'PAID', 'COMPLETED'].includes(item.status) && isCorrectGroup(item)
  );
  const objectedExpenses = expenses.filter(
    (item) => (item.status === 'OBJECTED' || item.status === 'DISPUTED') && isCorrectGroup(item)
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
    // Java Entity mapping: expense.paidBy is a full user object
    const creatorId = expense.paidBy?.userId || expense.payerId;
    return user && user.userId === creatorId;
  };

  const isExpenseFullySettled = (expense) => {
    const group = groups.find((item) => String(item.groupId || item.id) === String(expense.groupId || expense.group?.groupId));
    if (!group || !group.groupMembers) return false;

    // Filter everyone except the payer
    const payerId = expense.paidBy?.userId;
    const requiredMembers = group.groupMembers.filter((m) => m.user?.userId !== payerId);
    if (!requiredMembers.length) return true;

    // If approvals list exists, checking if everyone in the 'requiredMembers' have statuses indicating they are DONE
    const expenseRows = (settlements || []).filter((row) => row.expenseId === (expense.expenseId || expense.id));

    return requiredMembers.every((m) =>
      expenseRows.some((row) => row.fromUserId === m.user?.userId && row.status === 'PAID')
    );
  };

  const getDeleteBlockReason = (expense) => {
    if (!isExpenseCreator(expense)) {
      return 'Only the person who created this expense can delete it.';
    }

    // Allow deleting PENDING expenses freely if creator
    if (expense.status === 'PENDING') return '';

    if (!isExpenseFullySettled(expense)) {
      return 'This approved expense can be deleted only after all team members have completed settlement.';
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

  const deleteExpense = async (expenseId) => {
    const targetExpense = expenses.find((item) => item.id === expenseId || item.expenseId === expenseId);
    if (!targetExpense) return;

    const blockReason = getDeleteBlockReason(targetExpense);
    if (blockReason) {
      window.alert(blockReason);
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${targetExpense.title}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
        const idToUse = targetExpense.expenseId || targetExpense.id;
        await expenseService.deleteExpense(idToUse);
        
        setExpenses((prev) => prev.filter((item) => item.id !== expenseId && item.expenseId !== expenseId));
        addHistoryEvent('Expense Deleted', `${targetExpense.title} was permanently deleted.`);
    } catch (err) {
        console.error("Deletion Failed", err);
        alert("SQL Deletion Error: Could not remove expense from database.");
    }
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
             status: 'OBJECTED',
             reason: objectionReason.trim()
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

  const renderGroupSections = (groupExpenses, isUniversal = false) => {
    const isCorrectGroupLocal = (item) => !selectedGroupId || String(item.groupId || item.group?.groupId) === String(selectedGroupId);
    
    // Nested filtering for this specific segment of data
    const sortedExpenses = [...groupExpenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    const p = sortedExpenses.filter((item) => item.status === 'PENDING' && isCorrectGroupLocal(item));
    const a = sortedExpenses.filter((item) => 
      ['APPROVED', 'SETTLED', 'PAID', 'COMPLETED'].includes(item.status) && isCorrectGroupLocal(item)
    );
    const o = sortedExpenses.filter(
      (item) => (item.status === 'OBJECTED' || item.status === 'DISPUTED') && isCorrectGroupLocal(item)
    );

    return (
      <>
        <div className="grid-two">
          {!isUniversal && (
             <ExpenseForm 
                onAddExpense={addExpense} 
                disabled={groupLocked} 
                creatorName={user?.name || ''} 
                userGroups={userGroups} 
                selectedGroupId={selectedGroupId}
            />
          )}
          <ApprovalWidget
            expenses={p}
            onUpdateStatus={updateStatus}
            onRaiseObjection={openObjection}
            onDeleteExpense={deleteExpense}
            canDeleteExpense={canDeleteExpense}
            getDeleteBlockReason={getDeleteBlockReason}
          />
        </div>
        <ExpenseList
          title="Approved Expenses"
          expenses={a}
          onDeleteExpense={deleteExpense}
          canDeleteExpense={canDeleteExpense}
          getDeleteBlockReason={getDeleteBlockReason}
          emptyMessage="No approved expenses yet."
        />
        <ExpenseList
          title="Objected Expenses"
          expenses={o}
          onDeleteExpense={deleteExpense}
          canDeleteExpense={canDeleteExpense}
          getDeleteBlockReason={getDeleteBlockReason}
          emptyMessage="No objections raised yet."
        />
      </>
    );
  };

  // V3 SECURITY FIREWALL: Ensure we only process expenses for groups the user actually belongs to
  const expensesByGroup = expenses.reduce((acc, e) => {
    const groupId = e.groupId || e.group?.groupId;
    const isMember = userGroups.some(g => String(g.groupId) === String(groupId));
    
    if (!isMember) return acc; // DROP unauthorized data locally for safety

    const gn = e.groupName || e.group?.name || 'Other Group';
    if (!acc[gn]) acc[gn] = [];
    
    // Enhance category display: show custom name if primary is 'Other'
    const displayCategory = e.category === 'Other' && e.customCategory ? e.customCategory : e.category;
    acc[gn].push({ ...e, displayCategory });
    
    return acc;
  }, {});

  return (
    <div className="stack-gap-lg">
      <div className="page-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
            <h1>Expense Workflow</h1>
            <span className="badge">{groupLocked ? 'Team Locked' : 'Team Active'}</span>
        </div>

        <div className="row-gap" style={{width: '100%', background: 'var(--bg-card)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
            <div className="form-field" style={{flex: 1}}>
                <label>Active Group Context:</label>
                <select 
                    className="input" 
                    value={selectedGroupId || ''} 
                    onChange={(e) => setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null)}
                >
                    <option value="">🌎 Universal Overview (All Groups)</option>
                    {userGroups.map(g => (
                        <option key={g.groupId} value={g.groupId}>{g.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {!selectedGroupId ? (
         <div className="stack-gap-xl">
            {/* Universal Segregation Mode */}
            {Object.keys(expensesByGroup).length > 0 ? Object.entries(expensesByGroup).map(([groupName, groupData]) => (
                <div key={groupName} className="group-segregation-block">
                    <h2 className="group-header-label">📦 Group: {groupName}</h2>
                    {renderGroupSections(groupData, true)}
                </div>
            )) : (
                <div className="empty-state">
                    <p>No expenses found across all your groups.</p>
                </div>
            )}
         </div>
      ) : (
        renderGroupSections(expenses)
      )}

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

import { useContext, useState, useEffect } from 'react';
import BudgetForm from '../components/budget/BudgetForm';
import BudgetMeter from '../components/budget/BudgetMeter';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';

const BudgetPage = () => {
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const { budgets, setBudgets, addHistoryEvent } = useContext(AppContext);

  // Sync groups directly bound to the authenticated user
  useEffect(() => {
    if(user && user.userId) {
        groupService.getGroupsForApp(user).then(setUserGroups);
    }
  }, [user]);

  const onSaveBudget = (budget) => {
    setBudgets((prev) => [budget, ...prev]);
    addHistoryEvent('Budget Configured', `${budget.category} budget set to Rs. ${budget.limit}.`);
  };

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Budget Thresholds</h1>
      </div>
      <div className="grid-two">
        <BudgetForm onSave={onSaveBudget} userGroups={userGroups} />
        <section className="stack-gap">
          {budgets.map((item) => (
            <BudgetMeter key={item.id} item={item} />
          ))}
        </section>
      </div>
    </div>
  );
};

export default BudgetPage;

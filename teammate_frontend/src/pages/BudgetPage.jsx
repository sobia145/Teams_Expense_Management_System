import { useContext, useEffect, useState } from 'react';
import BudgetForm from '../components/budget/BudgetForm';
import BudgetMeter from '../components/budget/BudgetMeter';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import { budgetService } from '../services/budgetService';

const BudgetPage = () => {
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const { budgets, setBudgets, addHistoryEvent, selectedGroupId, setSelectedGroupId, expenses } = useContext(AppContext);
  const [loadingGrps, setLoadingGrps] = useState(true);

  useEffect(() => {
    if(user && user.userId) {
        groupService.getGroupsForApp(user).then((grps) => {
            setUserGroups(grps);
            setLoadingGrps(false);
        });
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroupId) {
        budgetService.getBudgetsByGroup(selectedGroupId).then(setBudgets);
    } else {
        setBudgets([]);
    }
  }, [selectedGroupId, setBudgets]);

  const onSaveBudget = async (budgetReq) => {
    try {
        const saved = await budgetService.saveBudget(budgetReq);
        setBudgets((prev) => {
            const exists = prev.some(b => b.budgetId === saved.budgetId);
            if (exists) {
                return prev.map(b => b.budgetId === saved.budgetId ? saved : b);
            }
            return [saved, ...prev];
        });
        addHistoryEvent('Budget Configured', `Threshold updated for category ${budgetReq.customCategory || budgetReq.category}.`);
    } catch (err) {
        console.error("Budget save failed", err);
        alert("Failed to save budget.");
    }
  };

  const [universalBudgets, setUniversalBudgets] = useState({}); // { groupId: [budgets] }

  useEffect(() => {
    if (selectedGroupId) {
        budgetService.getBudgetsByGroup(selectedGroupId).then(setBudgets);
    } else if (userGroups.length > 0) {
        const promises = userGroups.map(g => 
          budgetService.getBudgetsByGroup(g.groupId).then(res => ({ gid: g.groupId, res }))
        );
        Promise.all(promises).then(results => {
            const newUni = {};
            results.forEach(({ gid, res }) => { newUni[gid] = res; });
            setUniversalBudgets(newUni);
        });
    }
  }, [selectedGroupId, userGroups, setBudgets]);

  const renderBudgetList = (groupBudgets, gId = null) => (
    <section className="stack-gap" style={{maxHeight: '70vh', overflowY: 'auto'}}>
      {groupBudgets.map((item) => (
         <BudgetMeter key={item.budgetId} item={item} expenses={expenses} />
      ))}
      {groupBudgets.length === 0 && (
          <div className="empty-state">
              <p>No budget thresholds set for this group.</p>
          </div>
      )}
    </section>
  );

  return (
    <div className="stack-gap-lg">
      <div className="page-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
            <h1>Budget Thresholds</h1>
        </div>

        <div className="row-gap" style={{width: '100%', background: 'var(--bg-card)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
            <div className="form-field" style={{flex: 1}}>
                <label>Filter Budgets by Team:</label>
                <select 
                    className="input" 
                    value={selectedGroupId || ''} 
                    onChange={(e) => setSelectedGroupId(e.target.value ? parseInt(e.target.value) : null)}
                >
                    <option value="">🌎 Global Overview (All Tripping Groups)</option>
                    {userGroups.map(g => (
                        <option key={g.groupId} value={g.groupId}>{g.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {!selectedGroupId ? (
          <div className="stack-gap-xl">
             {userGroups.map(g => (
               <div key={g.groupId} className="group-segregation-block">
                 <h2 className="group-header-label">🛡️ Group Budgets: {g.name}</h2>
                 {renderBudgetList(universalBudgets[g.groupId] || [])}
               </div>
             ))}
             {userGroups.length === 0 && (
               <div className="empty-state">
                  <p>You aren't a member of any groups yet. Set up a group to track budgets!</p>
               </div>
             )}
          </div>
      ) : (
        <div className="grid-two">
          <BudgetForm onSave={onSaveBudget} userGroups={userGroups} selectedGroupId={selectedGroupId} onSelectGroup={setSelectedGroupId} />
          {renderBudgetList(budgets, selectedGroupId)}
        </div>
      )}
    </div>
  );
};

export default BudgetPage;

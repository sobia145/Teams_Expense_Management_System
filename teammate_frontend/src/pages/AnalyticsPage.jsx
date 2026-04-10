import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import formatCurrency from '../utils/formatCurrency';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const { expenses } = useContext(AppContext);

  useEffect(() => {
    if(user && user.userId) {
        groupService.getGroupsForApp(user).then((grps) => {
            setUserGroups(grps);
            if (grps.length > 0) setSelectedGroupId(grps[0].groupId);
        });
    }
  }, [user]);

  // VITAL: Filter the global arrays down to ONLY the active group so mathematical leakage is impossible!
  const groupExpenses = expenses.filter(e => e.group?.groupId === selectedGroupId || e.groupId === selectedGroupId);

  const byCategory = groupExpenses.reduce((acc, item) => {
    const current = acc[item.category] || 0;
    acc[item.category] = current + item.amount;
    return acc;
  }, {});

  const chartData = Object.entries(byCategory)
    .map(([category, value]) => ({ category, value }))
    .sort((left, right) => right.value - left.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  const colors = ['#0E7490', '#F97316', '#22C55E', '#A855F7', '#E11D48', '#2563EB', '#F59E0B', '#14B8A6'];

  const pieGradient =
    total > 0
      ? chartData
          .map((item, index) => {
            const start = chartData.slice(0, index).reduce((sum, entry) => sum + entry.value, 0);
            const end = start + item.value;
            const startPercent = (start / total) * 100;
            const endPercent = (end / total) * 100;
            return `${colors[index % colors.length]} ${startPercent}% ${endPercent}%`;
          })
          .join(', ')
      : 'transparent';

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Expenditure Analytics</h1>
        <select
          className="select"
          value={selectedGroupId}
          disabled={userGroups.length === 0}
          onChange={(e) => setSelectedGroupId(parseInt(e.target.value))}
        >
          <option value="" disabled>Select Target Group...</option>
          {userGroups.map((group) => (
            <option key={group.groupId} value={group.groupId}>
              💸 {group.name} {group.currency ? `(${group.currency})` : ''}
            </option>
          ))}
        </select>
      </div>
      <section className="content-card panel-pad stack-gap-lg">
        <div className="analytics-layout">
          <div className="analytics-visual">
            <div className="analytics-pie" style={{ background: `conic-gradient(${pieGradient})` }}>
              <div className="analytics-pie-inner">
                <span className="brand-kicker">Total Spend</span>
                <strong>{formatCurrency(total)}</strong>
                <small>{chartData.length ? `${chartData.length} categories` : 'No expenditure data'}</small>
              </div>
            </div>
          </div>
          <div className="analytics-legend stack-gap">
            {chartData.length ? (
              chartData.map((item, index) => {
                const share = total > 0 ? Math.round((item.value / total) * 100) : 0;

                return (
                  <div key={item.category} className="analytics-legend-item">
                    <div className="analytics-legend-label">
                      <span
                        className="analytics-swatch"
                        style={{ backgroundColor: colors[index % colors.length] }}
                        aria-hidden="true"
                      />
                      <strong>{item.category}</strong>
                    </div>
                    <div className="analytics-legend-meta">
                      <span>{formatCurrency(item.value)}</span>
                      <small>{share}%</small>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="analytics-empty">
                <strong>No expenditure data yet</strong>
                <p>Add expenses to see the pie chart breakdown here.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AnalyticsPage;

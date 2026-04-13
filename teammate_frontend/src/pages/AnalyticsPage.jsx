import { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import useAuth from '../hooks/useAuth';
import { groupService } from '../services/groupService';
import formatCurrency from '../utils/formatCurrency';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [userGroups, setUserGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupData, setGroupData] = useState([]);
  const [myData, setMyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [universalData, setUniversalData] = useState({});

  const colors = ['#0E7490', '#F97316', '#22C55E', '#A855F7', '#E11D48', '#2563EB', '#F59E0B', '#14B8A6'];

  useEffect(() => {
    if(user && user.userId) {
        groupService.getGroupsForApp(user).then((grps) => {
            setUserGroups(grps);
        });
    }
  }, [user]);

  const fetchData = async (gid) => {
      try {
          const { default: api } = await import('../services/api');
          const [groupRes, myRes] = await Promise.all([
              api.get(`/analytics/group/${gid}`),
              api.get(`/analytics/my-spending/${gid}`)
          ]);
          return {
              groupData: groupRes.data.sort((l, r) => r.value - l.value),
              myData: myRes.data.sort((l, r) => r.value - l.value),
              total: groupRes.data.reduce((s, i) => s + (Number(i.value) || 0), 0),
              myTotal: myRes.data.reduce((s, i) => s + (Number(i.value) || 0), 0)
          };
      } catch (e) {
          console.error(`Failed to fetch analytics for group ${gid}`, e);
          return null;
      }
  };

  useEffect(() => {
    if (selectedGroupId) {
        setLoading(true);
        fetchData(selectedGroupId).then(res => {
            if (res) {
                setGroupData(res.groupData);
                setMyData(res.myData);
            }
            setLoading(false);
        });
    } else if (userGroups.length > 0) {
        setLoading(true);
        const promises = userGroups.map(g => fetchData(g.groupId).then(res => ({ gid: g.groupId, res })));
        Promise.all(promises).then(results => {
            const newUniversal = {};
            results.forEach(({ gid, res }) => { if(res) newUniversal[gid] = res; });
            setUniversalData(newUniversal);
            setLoading(false);
        });
    }
  }, [selectedGroupId, userGroups]);

  const getGradient = (data, total) => {
    if (total <= 0) return 'transparent';
    return data.map((item, index) => {
        const start = data.slice(0, index).reduce((sum, entry) => sum + entry.value, 0);
        const end = start + item.value;
        return `${colors[index % colors.length]} ${(start/total)*100}% ${(end/total)*100}%`;
    }).join(', ');
  };

  const AnalyticsSection = ({ title, data, total, colors, emptyMsg }) => (
    <section className="content-card panel-pad stack-gap-lg" style={{flex: 1}}>
        <h4 style={{fontSize: '1.1rem', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>{title}</h4>
        {total > 0 ? (
            <div className="analytics-layout">
                <div className="analytics-visual">
                    <div className="analytics-pie" style={{ background: `conic-gradient(${getGradient(data, total)})`, border: '6px solid var(--bg-card-alt)' }}>
                        <div className="analytics-pie-inner">
                            <strong>{formatCurrency(total)}</strong>
                        </div>
                    </div>
                </div>
                <div className="analytics-legend stack-gap">
                    {data.slice(0, 5).map((item, index) => {
                        const share = Math.round((item.value / total) * 100);
                        return (
                            <div key={item.category} className="analytics-legend-item">
                                <div className="analytics-legend-label">
                                    <span className="analytics-swatch" style={{ backgroundColor: colors[index % colors.length] }} />
                                    <small>{item.category}</small>
                                </div>
                                <div className="analytics-legend-meta">
                                    <small>{share}%</small>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ) : (
            <div className="analytics-empty">
                <small>{emptyMsg || "No expenditure data available"}</small>
            </div>
        )}
    </section>
  );

  const renderGroupAnalytics = (gData, mData, gTotal, mTotal) => (
    <div className="grid-two">
       <AnalyticsSection 
          title="Team Composition" 
          data={gData} 
          total={gTotal} 
          colors={colors}
          emptyMsg="No approved expenditure yet"
       />
       <AnalyticsSection 
          title="My Contribution" 
          data={mData} 
          total={mTotal} 
          colors={colors}
          emptyMsg="No contribution from your end yet"
       />
    </div>
  );

  return (
    <div className="stack-gap-lg">
      <div className="page-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>
            <h1>Expenditure Analytics</h1>
            {loading && <span className="loader-sm">Updating...</span>}
        </div>

        <div className="row-gap" style={{width: '100%', background: 'var(--bg-card)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)'}}>
            <div className="form-field" style={{flex: 1}}>
                <label>Filter Analytics by Team:</label>
                <select 
                    className="input" 
                    value={selectedGroupId || ''} 
                    onChange={(e) => setSelectedGroupId(e.target.value ? parseInt(e.target.value) : '')}
                >
                    <option value="">🌎 Global Expenditure (All Groups)</option>
                    {userGroups.map(g => (
                        <option key={g.groupId} value={g.groupId}>{g.name}</option>
                    ))}
                </select>
            </div>
        </div>
      </div>

      {!selectedGroupId ? (
          <div className="stack-gap-xl">
             {userGroups.map(g => universalData[g.groupId] && (
               <div key={g.groupId} className="group-segregation-block">
                 <h2 className="group-header-label">📊 Group Analytics: {g.name}</h2>
                 {renderGroupAnalytics(
                    universalData[g.groupId].groupData, 
                    universalData[g.groupId].myData, 
                    universalData[g.groupId].total, 
                    universalData[g.groupId].myTotal
                 )}
               </div>
             ))}
             {userGroups.length === 0 && (
               <div className="empty-state">
                  <p>No active groups found. Analytics will appear once you join a Team!</p>
               </div>
             )}
          </div>
      ) : (
        renderGroupAnalytics(groupData, myData, 
          groupData.reduce((s, i) => s + (Number(i.value) || 0), 0), 
          myData.reduce((s, i) => s + (Number(i.value) || 0), 0)
        )
      )}
    </div>
  );
};

export default AnalyticsPage;

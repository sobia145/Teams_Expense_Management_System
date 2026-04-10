import React, { useEffect, useState } from 'react';
import formatCurrency from '../utils/formatCurrency';
import { adminService } from '../services/adminService';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip
} from 'recharts';

// SVG Icons
const SearchIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>;
const CheckUserIcon = () => <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#EFF4FB"/><circle cx="16" cy="16" r="14" fill="#E2E8F0"/><path fill="#4318FF" d="M16 11a3 3 0 100-6 3 3 0 000 6zm0 2c-3.3 0-6 2.7-6 6v1h12v-1c0-3.3-2.7-6-6-6z"/><circle cx="24" cy="24" r="5" fill="#4318FF"/><path stroke="#FFF" strokeWidth="1.5" d="M22 24.5l1.5 1.5 3-3"/></svg>;
const MoreIcon = () => <svg width="24" height="24" fill="#A3AED0" viewBox="0 0 24 24"><path d="M12 13a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2zm-12 0a1 1 0 100-2 1 1 0 000 2z"/></svg>;

const UsersIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6555E2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const GroupsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2CA4E7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ExpensesIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F6A92A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;
const AlertsIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E45B5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const AlertTriangleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E45B5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalGroups: 0, totalExpenses: 0, categoryWiseSpending: {} });
  const [alerts, setAlerts] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getAnalytics(),
      adminService.getBudgetAlerts(),
      adminService.getExpenses(),
      adminService.getHistoryLogs()
    ]).then(([s, a, e, h]) => {
      setStats(s || { totalUsers: 0, totalGroups: 0, totalExpenses: 0, categoryWiseSpending: {} });
      setAlerts(a || []);
      setExpenses(e || []);
      setHistory(h || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const COLORS = { Food: '#3B82F6', Travel: '#F95858', Entertainment: '#9B51E0', Other: '#45D09E' };
  
  let pieData = [];

  if (stats?.categoryWiseSpending && Object.keys(stats.categoryWiseSpending).length > 0) {
    pieData = Object.entries(stats.categoryWiseSpending).map(([category, value]) => {
      let label = 'Other';
      if (category === '1' || category.toLowerCase() === 'food') label = 'Food';
      else if (category === '2' || category.toLowerCase() === 'travel') label = 'Travel';
      else if (category === '3' || category.toLowerCase() === 'stay') label = 'Entertainment';
      return { name: label, value: Number(value) };
    });
  }
  
  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  const trendsData = expenses.length > 0 ? expenses.reduce((acc, exp) => {
    if (!exp.createdAt || exp.isDeleted) return acc;
    const date = new Date(exp.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
    const existing = acc.find(item => item.date === date);
    if (existing) existing.amount += exp.totalAmount || 0;
    else acc.push({ date, amount: exp.totalAmount || 0 });
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7) : [];

  const finalTrends = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
    const found = trendsData.find(d => d.date === day);
    return { date: day, amount: found ? found.amount : 0 };
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B' }}>Loading Dashboard...</div>;

  return (
    <div style={{ background: '#F0F2F5', minHeight: '100vh', padding: '1.5rem', fontFamily: '"Inter", sans-serif', width: '100%' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '30px', padding: '2.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', maxWidth: '1400px', margin: '0 auto', color: '#1B2559' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1B2559', fontWeight: 700 }}>Admin Operations</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ background: '#F4F7FE', borderRadius: '30px', padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', color: '#A3AED0', width: '250px' }}>
              <SearchIcon />
              <input type="text" placeholder="Search analytics..." style={{ border: 'none', background: 'none', outline: 'none', marginLeft: '0.5rem', color: '#1B2559', width: '100%', fontSize: '0.9rem' }} />
            </div>
            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}><CheckUserIcon /></div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          {[
            { title: 'Total Users', value: stats.totalUsers || 0, icon: <UsersIcon />, bg: '#FFFFFF', iconBg: '#EFEEFE' },
            { title: 'Active Groups', value: stats.totalGroups || 0, icon: <GroupsIcon />, bg: '#FFFFFF', iconBg: '#E6F5FC' },
            { title: 'Total Spend', value: formatCurrency(stats.totalExpenses || 0), icon: <ExpensesIcon />, bg: '#FFFFFF', iconBg: '#FFF6E5' },
            { title: 'Active Alerts', value: alerts.length || 0, icon: <AlertsIcon />, bg: '#FFFFFF', iconBg: '#FBEBEB' }
          ].map((card, i) => (
            <div key={i} style={{ 
              background: card.bg, padding: '1.5rem', borderRadius: '20px', 
              display: 'flex', alignItems: 'center', gap: '1.25rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid #F1F4F8'
            }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: card.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ margin: 0, fontSize: '0.85rem', color: '#707EAE', fontWeight: 500 }}>{card.title}</span>
                <span style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', color: '#2B3674', fontWeight: 700 }}>{card.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid #F1F4F8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#2B3674', fontSize: '1.125rem', fontWeight: 700 }}>Expenditure Mix</h3>
              <MoreIcon />
            </div>
            {pieData.length > 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', height: '220px' }}>
                <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#A3AED0'} />
                        ))}
                        </Pie>
                    </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#A3AED0', fontWeight: 500, letterSpacing: '1px' }}>TOTAL</span>
                    <div style={{ fontSize: '1.1rem', color: '#2B3674', fontWeight: 700 }}>{formatCurrency(totalPieValue)}</div>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {pieData.map((entry, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[entry.name] || '#A3AED0' }}></div>
                        <span style={{ color: '#707EAE', width: '90px' }}>{entry.name}</span>
                        <span style={{ color: '#2B3674', fontWeight: 700 }}>{formatCurrency(entry.value)}</span>
                    </div>
                    ))}
                </div>
                </div>
            ) : (
                <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A3AED0' }}>No expenditure data yet.</div>
            )}
          </div>

          <div style={{ padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid #F1F4F8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#2B3674', fontSize: '1.125rem', fontWeight: 700 }}>Spending Velocity</h3>
              <MoreIcon />
            </div>
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={finalTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4318FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4318FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A3AED0', fontSize: 12 }} />
                  <LineTooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                  <Area type="monotone" dataKey="amount" stroke="#4318FF" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4318FF' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid #F1F4F8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: '#2B3674', fontSize: '1.125rem', fontWeight: 700 }}>Record of Activity</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#A3AED0', fontSize: '0.85rem' }}>User | Action</span>
                <MoreIcon />
              </div>
            </div>
            {history.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {history.slice(0, 5).map((log, i) => {
                    const name = log.performedByName || 'Authorized User';
                    const date = log.createdAt ? new Date(log.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Today';
                    return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 0', borderBottom: i !== history.length - 1 ? '1px solid #F1F4F8' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '50%' }}>
                        <img src={`https://ui-avatars.com/api/?name=${name}&background=F4F7FE&color=4318FF&rounded=true&bold=true`} alt={name} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#2B3674', fontWeight: 600, fontSize: '0.9rem' }}>{name}</span>
                            <span style={{ color: '#A3AED0', fontSize: '0.75rem' }}>{log.action}</span>
                        </div>
                        </div>
                        <span style={{ color: '#2B3674', fontWeight: 500, fontSize: '0.85rem', width: '30%', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.newData}</span>
                        <span style={{ color: '#A3AED0', fontSize: '0.85rem', fontWeight: 500, width: '20%', textAlign: 'right' }}>{date}</span>
                    </div>
                    );
                })}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#A3AED0' }}>No recent activities.</div>
            )}
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', padding: '1.5rem 2rem', borderRadius: '20px', border: '1px solid #F1F4F8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', background: '#FFFFFF' }}>
            <div style={{ flex: 1, zIndex: 2, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: '#2B3674', fontSize: '1.125rem', fontWeight: 700 }}>System Alerts</h3>
              </div>
              {alerts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '55%' }}>
                  {alerts.slice(0, 3).map((alert, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
                      <div style={{ background: '#FBEBEB', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangleIcon />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: '#2B3674', fontWeight: 600, fontSize: '0.9rem' }}>{alert.group?.name || 'Trip Alert'}</span>
                        <span style={{ color: '#A3AED0', fontSize: '0.8rem', fontWeight: 500 }}>Budget Overrun</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                  <div style={{ color: '#A3AED0', fontSize: '0.9rem' }}>All systems stable. No alerts found.</div>
              )}
            </div>
            
            <div style={{ position: 'absolute', bottom: '0', right: '-10px', width: '250px', height: '220px', zIndex: 1, opacity: alerts.length > 0 ? 1 : 0.4 }}>
              <svg viewBox="0 0 400 350" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="260" width="300" height="15" rx="5" fill="#E2E8F0" />
                <rect x="80" y="275" width="20" height="75" fill="#CBD5E1" />
                <rect x="250" y="275" width="20" height="75" fill="#CBD5E1" />
                <rect x="100" y="150" width="120" height="85" rx="8" fill="#4318FF" />
                <rect x="105" y="155" width="110" height="75" rx="4" fill="#FFFFFF" />
                <rect x="115" y="170" width="40" height="6" rx="3" fill="#E2E8F0" />
                <rect x="115" y="185" width="80" height="6" rx="3" fill="#E2E8F0" />
                <rect x="115" y="200" width="60" height="6" rx="3" fill="#E2E8F0" />
                <path d="M145 235 L 175 235 L 165 260 L 155 260 Z" fill="#94A3B8" />
                <path d="M30 240 Q 10 200 40 180 Q 50 200 45 240 Z" fill="#45D09E" />
                <path d="M40 240 Q 60 190 80 190 Q 70 210 55 240 Z" fill="#2eb886" />
                <rect x="35" y="240" width="25" height="20" fill="#6555E2" rx="4" />
                <path d="M220 220 C 220 160, 290 140, 300 200 L 300 260 L 220 260 Z" fill="#4318FF" />
                <rect x="230" y="250" width="35" height="80" fill="#1B2559" rx="8" />
                <rect x="250" y="250" width="35" height="60" fill="#1B2559" rx="8" />
                <rect x="230" y="320" width="40" height="15" fill="#0F172A" rx="5" />
                <path d="M250 170 C 210 180, 200 230, 180 230" stroke="#4318FF" strokeWidth="20" strokeLinecap="round" fill="none" />
                <circle cx="260" cy="110" r="30" fill="#FCD34D" />
                <path d="M235 110 C 235 70, 285 70, 285 110" fill="#1B2559" />
                <path d="M245 100 C 245 80, 275 80, 275 100 Z" fill="#0F172A" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

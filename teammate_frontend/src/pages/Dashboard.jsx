import { useContext, useEffect, useState, useCallback } from 'react';
import NotificationPanel from '../components/notification/NotificationPanel';
import { AppContext } from '../context/AppContext';
import formatCurrency from '../utils/formatCurrency';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    approvedSpend: 0,
    pendingApprovalsCount: 0,
    pendingPaymentsCount: 0,
    totalGroupsCount: 0
  });

  const fetchStats = useCallback(() => {
    if (user?.userId && user?.role !== 'ADMIN') {
        api.get(`/dashboard/stats/${user.userId}`)
          .then(res => setStats(res.data))
          .catch(err => console.error("Stats sync failed", err));
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);
  
  // Master conditional layout structure distinctly separating Admin vs User Architecture
  if (user?.role === 'ADMIN') {
      return <AdminDashboard />;
  }

  const cards = [
    { title: 'Total Groups', value: stats.totalGroupsCount },
    { title: 'Approved Spend', value: formatCurrency(stats.approvedSpend) },
    { title: 'Pending Payments', value: stats.pendingPaymentsCount },
    { title: 'Pending Approvals', value: stats.pendingApprovalsCount }
  ];

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Operations Dashboard</h1>
        <span className="badge">Welcome back, {user?.name?.split(' ')[0]}!</span>
      </div>
      <section className="grid-four">
        {cards.map((card) => (
          <article key={card.title} className="content-card panel-pad stat-card">
            <p>{card.title}</p>
            <h3>{card.value}</h3>
          </article>
        ))}
      </section>
      <NotificationPanel onAction={fetchStats} />
    </div>
  );
};

export default Dashboard;

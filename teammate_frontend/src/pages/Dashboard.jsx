import { useContext, useEffect, useState } from 'react';
import NotificationPanel from '../components/notification/NotificationPanel';
import { AppContext } from '../context/AppContext';
import formatCurrency from '../utils/formatCurrency';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { groups, expenses, settlements } = useContext(AppContext);
  const { user } = useAuth();
  
  // Master conditional layout structure distinctly separating Admin vs User Architecture
  if (user?.role === 'ADMIN') {
      return <AdminDashboard />;
  }

  const activeGroupIds = new Set(groups.map(g => String(g.groupId)));
  const approvedTotal = expenses
    .filter((item) => item.status === 'APPROVED' && activeGroupIds.has(String(item.groupId)))
    .reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  const pendingPayments = settlements.filter((item) => item.status !== 'PAID').length;

  const cards = [
    { title: 'Total Groups', value: groups.length },
    { title: 'Approved Spend', value: formatCurrency(approvedTotal) },
    { title: 'Pending Payments', value: pendingPayments },
    { title: 'Pending Approvals', value: expenses.filter((item) => item.status === 'PENDING').length }
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
      <NotificationPanel />
    </div>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import formatCurrency from '../utils/formatCurrency';

const AdminExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    adminService.getExpenses().then(setExpenses);
  }, []);

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Global Expenditure Network</h1>
      </div>
      <section className="content-card panel-pad" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '1rem 0' }}>ID</th>
              <th>Title</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Group Identity</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(e => (
              <tr key={e.expenseId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 0' }}>{e.expenseId}</td>
                <td><strong>{e.title}</strong></td>
                <td style={{ color: '#DC2626', fontWeight: 'bold' }}>{formatCurrency(e.totalAmount)}</td>
                <td>
                  <span className="badge" style={{ background: '#475569', color: 'white' }}>
                    {e.status}
                  </span>
                </td>
                <td>{e.group?.name || `Group #${e.group?.groupId}`}</td>
                <td>{e.createdAt ? new Date(e.createdAt).toLocaleString() : 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminExpensesPage;

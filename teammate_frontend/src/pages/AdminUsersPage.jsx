import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import useAuth from '../hooks/useAuth';

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    adminService.getUsers()
      .then(data => {
        setUsers(data || []);
        setLoading(false);
      })
      .catch(err => {
        setError("System Error: Could not synchronize with Global User Registry.");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="panel-pad text-center">Synchronizing User Registry...</div>;
  if (error) return <div className="panel-pad text-center text-danger">{error}</div>;

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Global User Directory</h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
          Displaying all registered system accounts for global oversight.
        </p>
      </div>
      
      <section className="content-card panel-pad" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '1rem 0' }}>Authority ID</th>
              <th>Full Name</th>
              <th>System Email</th>
              <th>System Role</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isCurrentUser = user?.userId === u.userId;
              return (
                <tr key={u.userId} style={{ 
                    borderBottom: '1px solid #F1F5F9',
                    background: isCurrentUser ? 'rgba(67, 24, 255, 0.03)' : 'transparent' 
                }}>
                  <td style={{ padding: '1rem 0' }}>{u.userId}</td>
                  <td style={{ fontWeight: 600, color: 'var(--slate-900)' }}>
                    {u.name} {isCurrentUser && <span style={{ color: 'var(--brand-600)', fontSize: '0.75rem', fontWeight: 500 }}>(Current Admin)</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className="badge" style={{ background: u.role === 'ADMIN' ? 'var(--danger-500)' : 'var(--brand-500)', color: 'white' }}>
                      {u.role || 'USER'}
                    </span>
                  </td>
                  <td>{u.phone || 'N/A'}</td>
                  <td>
                    <span style={{ color: u.isDeleted ? 'var(--danger-600)' : 'var(--success-600)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                      {u.isDeleted ? 'REVOKED' : 'ACTIVE'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminUsersPage;

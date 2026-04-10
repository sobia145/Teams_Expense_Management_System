import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    adminService.getUsers().then(setUsers);
  }, []);

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Global System Users</h1>
      </div>
      <section className="content-card panel-pad" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '1rem 0' }}>User ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>System Role</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.userId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 0' }}>{u.userId}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className="badge" style={{ background: u.role === 'ADMIN' ? '#EF4444' : '#3B82F6', color: 'white' }}>
                    {u.role || 'USER'}
                  </span>
                </td>
                <td>{u.phone || 'N/A'}</td>
                <td>
                  <span style={{ color: u.isDeleted ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>
                    {u.isDeleted ? 'DELETED' : 'ACTIVE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminUsersPage;

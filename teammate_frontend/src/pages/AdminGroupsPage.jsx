import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import formatCurrency from '../utils/formatCurrency';

const AdminGroupsPage = () => {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    adminService.getGroups().then(setGroups);
  }, []);

  return (
    <div className="stack-gap-lg">
      <div className="page-header">
        <h1>Global Registered Groups</h1>
      </div>
      <section className="content-card panel-pad" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E2E8F0' }}>
              <th style={{ padding: '1rem 0' }}>Group ID</th>
              <th>Name</th>
              <th>Currency</th>
              <th>Creation Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {groups.map(g => (
              <tr key={g.groupId} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '1rem 0' }}>{g.groupId}</td>
                <td><strong>{g.name}</strong></td>
                <td>{g.currency}</td>
                <td>{g.createdAt ? new Date(g.createdAt).toLocaleString() : 'N/A'}</td>
                <td>
                  <span style={{ color: g.isDeleted ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>
                    {g.isDeleted ? 'SOFT DELETED' : 'ACTIVE'}
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

export default AdminGroupsPage;

import { useState, useEffect } from 'react';
import formatCurrency from '../../utils/formatCurrency';
import { groupService } from '../../services/groupService';

const GroupCard = ({ group, onSelect, onDeleteGroup, currentUser }) => {
  const [realMembers, setRealMembers] = useState([]);

  // Fetch the real teammates bridging map the moment the card mounts!
  useEffect(() => {
     if (group.groupId) {
         groupService.getGroupMembers(group.groupId).then(setRealMembers);
     }
  }, [group.groupId]);

  const handleDelete = (e) => {
    e.stopPropagation();
    const shouldDelete = window.confirm(`Delete group "${group.name}"?`);
    if (!shouldDelete) return;
    onDeleteGroup?.(group.groupId);
  };

  const handleSelect = () => {
    // Inject the dynamically mapped array right back into the application logic before viewing the page!
    onSelect({ ...group, members: realMembers });
  };

  return (
    <article className="content-card panel-pad group-card" onClick={handleSelect}>
      <div className="panel-head">
        <h3>{group.name}</h3>
        <span className="badge">{realMembers.length} members</span>
      </div>
      <p>Total spent: {formatCurrency(group.totalSpent || 0)}</p>
      <p>Pending approvals: {group.pendingApprovals || 0}</p>
      <p>{group.isLocked ? 'Team Locked' : 'Team Active'}</p>
      
      {currentUser && group.createdBy && String(group.createdBy.userId) === String(currentUser.userId) && (
        <div className="card-actions">
          <button className="btn btn-danger" type="button" onClick={handleDelete}>
            Delete Group
          </button>
        </div>
      )}
    </article>
  );
};

export default GroupCard;

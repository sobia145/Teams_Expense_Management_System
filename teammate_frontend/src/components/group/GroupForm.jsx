import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const GroupForm = ({ onSubmit }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Immediately map all existing registered DB users into the Frontend List!
  useEffect(() => {
    userService.getAllUsers().then((users) => {
        // Exclude the current user AND the Global Admin account visually (Account for legacy '' role mappings)
        const others = users.filter((u) => u.userId !== user?.userId && u.role !== 'ADMIN' && u.email !== 'admin@tems.com');
        setAvailableUsers(others);
    });
  }, [user]);

  const toggleUser = (id) => {
    setSelectedIds((prev) => 
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    // Send the structured map matching the Java GroupRequest DTO identically!
    onSubmit({
      name: groupName,
      memberIds: selectedIds
    });

    setGroupName('');
    setSelectedIds([]);
  };

  return (
    <form className="content-card panel-pad stack-gap" onSubmit={handleSubmit}>
      <h3>Create Group</h3>
      <input
        className="input"
        placeholder="Group name (e.g. Goa Trip 🏖️)"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
      />
      
      <div className="members-selection">
          <p style={{marginBottom: "10px", fontSize: "14px", color: "var(--color-muted)"}}>
              Select verified teammates to add:
          </p>
          <div className="checkbox-grid stack-gap" style={{maxHeight: '150px', overflowY: 'auto'}}>
              {availableUsers.map((teammate) => (
                  <label key={teammate.userId} style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <input 
                          type="checkbox" 
                          checked={selectedIds.includes(teammate.userId)}
                          onChange={() => toggleUser(teammate.userId)}
                      />
                      <span>{teammate.name} ({teammate.email})</span>
                  </label>
              ))}
              {availableUsers.length === 0 && <p>No other teammates registered yet!</p>}
          </div>
      </div>

      <button className="btn btn-primary" type="submit">
        Add Group
      </button>
    </form>
  );
};

export default GroupForm;

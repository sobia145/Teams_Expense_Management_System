import { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import './GroupForm.css';

const GroupForm = ({ onSubmit }) => {
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Map all existing registered DB users into the Frontend List!
  useEffect(() => {
    userService.getAllUsers().then((users) => {
        // Exclude the current user AND the Global Admin account visually
        const others = users.filter((u) => u.userId !== user?.userId && u.role !== 'ADMIN' && u.email !== 'admin@tems.com');
        setAvailableUsers(others);
    });
  }, [user]);

  const toggleUser = (selectedUser) => {
    if (selectedMembers.find(m => m.userId === selectedUser.userId)) {
        // Remove if already selected
        setSelectedMembers(prev => prev.filter(m => m.userId !== selectedUser.userId));
    } else {
        // Add if not selected
        setSelectedMembers(prev => [...prev, selectedUser]);
        setSearch(''); // Clear search on selection
        setShowDropdown(false);
    }
  };

  const removeUser = (userId) => {
    setSelectedMembers(prev => prev.filter(m => m.userId !== userId));
  };

  const filteredUsers = availableUsers.filter((u) => {
    const isNotSelected = !selectedMembers.find(m => m.userId === u.userId);
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                         u.email.toLowerCase().includes(search.toLowerCase());
    return isNotSelected && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    // Send the structured map matching the Java GroupRequest DTO identically!
    onSubmit({
      name: groupName,
      memberIds: selectedMembers.map(m => m.userId)
    });

    setGroupName('');
    setSelectedMembers([]);
    setSearch('');
  };

  return (
    <form className="content-card panel-pad stack-gap" onSubmit={handleSubmit} style={{ overflow: 'visible' }}>
      <h3>Create Group</h3>
      <div className="input-wrap">
        <label>Group Name</label>
        <input
          className="search-input"
          placeholder="Team name (e.g. Project Alpha 🚀)"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />
      </div>
      
      <div className="members-selection">
          <label style={{marginBottom: "10px", display: 'block'}}>Select Members</label>
          
          {/* 🏷️ Selected Members Chips Area */}
          <div className="chips-container">
            {selectedMembers.map((m) => (
              <div key={m.userId} className="member-chip">
                <span>{m.name}</span>
                <button type="button" className="remove-btn" onClick={() => removeUser(m.userId)}>×</button>
              </div>
            ))}
            {selectedMembers.length === 0 && (
              <p style={{fontSize: '0.85rem', color: 'var(--slate-400)', margin: '4px 0'}}>No members selected yet</p>
            )}
          </div>

          {/* 🔍 Search Input & Dropdown */}
          <div className="search-container">
            <input 
              type="text"
              className="search-input"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
            />

            {showDropdown && search && (
              <div className="search-dropdown">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <div key={u.userId} className="dropdown-item" onClick={() => toggleUser(u)}>
                      <span className="user-name">{u.name}</span>
                      <span className="user-email">{u.email}</span>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item" style={{color: 'var(--slate-400)', cursor: 'default'}}>
                    No matching members found
                  </div>
                )}
              </div>
            )}
          </div>
      </div>

      <button className="primary-auth-button" type="submit" style={{ width: '100%', marginTop: '10px' }}>
        Create Group
      </button>
    </form>
  );
};

export default GroupForm;

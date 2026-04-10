const MemberList = ({ members }) => {
  return (
    <section className="content-card panel-pad">
      <h3>Members</h3>
      <ul className="plain-list">
        {members?.length ? (
          members.map((member) => (
             <li key={member.userId || member}>
                 {member.name || member} 
                 {member.email && <span style={{fontSize: '12px', color: 'var(--color-muted)', marginLeft: '10px'}}>({member.email})</span>}
             </li>
          ))
        ) : (
          <li>No members selected.</li>
        )}
      </ul>
    </section>
  );
};

export default MemberList;

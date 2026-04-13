import formatCurrency from '../../utils/formatCurrency';
import useAuth from '../../hooks/useAuth';

const SettlementSummary = ({ rows, groupLocked }) => {
  const { user } = useAuth();
  const currentUserId = user?.userId || user?.id;

  const groupPending = rows.filter((item) => item.status !== 'PAID');
  const groupAmount = groupPending.reduce((sum, item) => sum + item.amount, 0);

  // Calculate specifically for the logged-in user
  const personalPending = groupPending.filter(item => 
    String(item.fromUserId) === String(currentUserId) || 
    String(item.toUserId) === String(currentUserId)
  );
  const personalAmount = personalPending.reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="content-card panel-pad stack-gap">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3>Settlement Board Overview</h3>
        <div className="badge">
            {groupLocked ? 'Team Locked' : 'Team Open'}
        </div>
      </div>
      
      <div className="grid-two" style={{gap: '1.5rem'}}>
        <div className="stat-minor">
            <p className="text-muted">Your Pending Amount</p>
            <h2 style={{color: 'var(--primary-color)'}}>{formatCurrency(personalAmount)}</h2>
            <small>{personalPending.length} records</small>
        </div>
        <div className="stat-minor" style={{borderLeft: '1px solid var(--border-color)', paddingLeft: '1.5rem'}}>
            <p className="text-muted">Total Group Debt</p>
            <h2>{formatCurrency(groupAmount)}</h2>
            <small>{groupPending.length} of {rows.length} settled</small>
        </div>
      </div>
    </section>
  );
};

export default SettlementSummary;

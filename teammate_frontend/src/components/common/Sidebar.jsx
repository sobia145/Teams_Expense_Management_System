import { NavLink } from 'react-router-dom';
import { NAV_LINKS } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();

  // Conditionally strip out individual-user operational routes from the Global Admin's view!
  // Per vision: Admin should see dashboard and global controls but not interact with individual trip setups
  const activeLinks = user?.role === 'ADMIN' 
    ? NAV_LINKS.filter(link => ['Dashboard', 'History', 'Users'].includes(link.label))
    : NAV_LINKS;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h3>TEMS</h3>
        <p>{user?.role === 'ADMIN' ? 'Global Admin Panel' : 'Control panel'}</p>
      </div>
      <nav className="sidebar-nav">
        {activeLinks.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `side-link ${isActive ? 'side-link-active' : ''}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

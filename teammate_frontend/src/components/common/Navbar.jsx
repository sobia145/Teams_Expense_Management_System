import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { APP_NAME } from '../../utils/constants';
import useAuth from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(AppContext);
  const nextThemeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  return (
    <header className="content-card navbar">
      <div>
        <p className="brand-kicker">Enterprise Expense Intelligence</p>
        <h2>{APP_NAME}</h2>
      </div>
      <div className="nav-actions">
        <Link className="btn btn-muted" to="/dashboard">
          Home
        </Link>
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-pressed={theme === 'dark'}
          aria-label={nextThemeLabel}
        >
          <span className="theme-toggle-track" aria-hidden="true">
            <span className="theme-toggle-icon theme-toggle-icon-sun" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 1.8v2.4M12 19.8v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M1.8 12h2.4M19.8 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
              </svg>
            </span>
            <span className="theme-toggle-icon theme-toggle-icon-moon" aria-hidden="true">
              <svg viewBox="0 0 24 24" role="presentation" focusable="false">
                <path d="M20.5 14.8A8.8 8.8 0 0 1 9.2 3.5 9 9 0 1 0 20.5 14.8Z" />
              </svg>
            </span>
            <span className="theme-toggle-thumb" />
          </span>
          <span className="sr-only">{nextThemeLabel}</span>
        </button>
        <div className="user-chip">
          <strong>{user?.name}</strong>
          <small>{user?.role}</small>
        </div>
        <button className="btn btn-primary" onClick={logout}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;

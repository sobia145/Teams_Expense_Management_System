import { Outlet, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  const location = useLocation();
  const isLoginRoute = location.pathname === '/login';

  return (
    <div className="auth-layout">
      <div className={`auth-card content-card ${isLoginRoute ? 'auth-card-login' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

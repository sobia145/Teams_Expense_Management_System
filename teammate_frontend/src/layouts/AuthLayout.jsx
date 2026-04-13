import { Outlet, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-layout-root">
      <Outlet />
    </div>
  );
};

export default AuthLayout;

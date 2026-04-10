import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="content-card panel-pad stack-gap">
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link className="btn btn-primary" to="/dashboard">
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;

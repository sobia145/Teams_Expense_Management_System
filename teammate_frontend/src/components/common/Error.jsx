const Error = ({ message = 'Unable to load this section right now.' }) => {
  return (
    <div className="content-card panel-pad error-card">
      <h3>Error</h3>
      <p>{message}</p>
    </div>
  );
};

export default Error;

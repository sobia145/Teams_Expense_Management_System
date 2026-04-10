const Loader = ({ text = 'Loading...' }) => {
  return (
    <div style={{ display: 'grid', placeItems: 'center', padding: 30 }}>
      <div className="loader-wrap">
        <div className="loader-dot" />
        <p>{text}</p>
      </div>
    </div>
  );
};

export default Loader;

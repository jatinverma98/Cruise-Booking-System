const LoadingState = ({ message = 'Loading...' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 20px',
      gap: '16px',
    }}
  >
    <div className="spinner" />
    <p style={{ color: '#94a3b8', fontSize: '14px' }}>{message}</p>
  </div>
);

export default LoadingState;

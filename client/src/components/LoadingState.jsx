const LoadingState = ({ message = 'Loading...' }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '120px 24px',
      gap: '16px',
      backgroundColor: '#071923',
    }}
  >
    <div style={{ fontSize: '32px', animation: 'spin 2s linear infinite' }}>⚓</div>
    <p
      style={{
        fontFamily: "'Cinzel', serif",
        color: '#DCE5E8',
        fontSize: '12px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
      }}
    >
      {message}
    </p>
  </div>
);

export default LoadingState;

const ErrorMessage = ({ message = 'An unexpected error occurred.', onRetry }) => (
  <div
    className="luxury-card"
    style={{
      padding: '40px 24px',
      textAlign: 'center',
      backgroundColor: '#0D2633',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: '8px',
    }}
  >
    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
    <h3
      style={{
        fontFamily: "'Cinzel', serif",
        fontSize: '16px',
        fontWeight: 700,
        color: '#f87171',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '8px',
      }}
    >
      Voyage Error
    </h3>
    <p style={{ color: '#DCE5E8', fontSize: '13px', marginBottom: onRetry ? '20px' : '0', opacity: 0.85 }}>
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn-luxury-ghost"
        style={{ padding: '8px 20px', fontSize: '11px', marginTop: '16px' }}
      >
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;

const ErrorMessage = ({ message, onRetry }) => (
  <div
    className="glass-card"
    style={{
      padding: '32px',
      textAlign: 'center',
      maxWidth: '500px',
      margin: '40px auto',
    }}
  >
    <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
    <h3 style={{ color: '#f87171', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
      Something went wrong
    </h3>
    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.6, marginBottom: onRetry ? '20px' : 0 }}>
      {message || 'An unexpected error occurred. Please try again.'}
    </p>
    {onRetry && (
      <button className="btn-primary" onClick={onRetry} style={{ marginTop: '4px' }}>
        Try Again
      </button>
    )}
  </div>
);

export default ErrorMessage;

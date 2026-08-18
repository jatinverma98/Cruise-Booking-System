import { useState } from 'react';

const PromoCode = ({ cruiseId, ages, services, onPromoApplied }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState(null); // null | 'valid' | 'invalid'
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), cruiseId, ages, services }),
      });
      const data = await response.json();
      const result = data.data;

      if (result.valid) {
        setStatus('valid');
        setMessage(`✓ Code applied: ${result.promo.type === 'percentage' ? `${result.promo.value}% off` : `$${result.promo.value} off`}`);
        onPromoApplied(result.promo);
      } else {
        setStatus('invalid');
        setMessage(result.message);
        onPromoApplied(null);
      }
    } catch {
      setStatus('invalid');
      setMessage('Failed to validate promo code. Please try again.');
      onPromoApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setStatus(null);
    setMessage('');
    onPromoApplied(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          id="promo-code-input"
          type="text"
          placeholder="Enter promo code (e.g. SUMMER10)"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            if (status) { setStatus(null); setMessage(''); onPromoApplied(null); }
          }}
          className="input-field"
          disabled={status === 'valid'}
          style={{ textTransform: 'uppercase', letterSpacing: '0.05em', flex: 1 }}
        />
        {status !== 'valid' ? (
          <button
            id="promo-apply-btn"
            className="btn-primary"
            onClick={handleApply}
            disabled={loading || !code.trim()}
            style={{ padding: '10px 18px', fontSize: '14px', whiteSpace: 'nowrap' }}
          >
            {loading ? '...' : 'Apply'}
          </button>
        ) : (
          <button
            id="promo-remove-btn"
            onClick={handleRemove}
            style={{
              padding: '10px 18px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            Remove
          </button>
        )}
      </div>

      {message && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            background: status === 'valid' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${status === 'valid' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
            color: status === 'valid' ? '#4ade80' : '#f87171',
          }}
        >
          {message}
        </div>
      )}

      <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
        Try: SUMMER10 · FIRST150 · CREW25
      </p>
    </div>
  );
};

export default PromoCode;

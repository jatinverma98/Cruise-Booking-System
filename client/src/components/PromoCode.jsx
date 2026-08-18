import { useState } from 'react';
import { validatePromoCode } from '../services/api';

const PromoCode = ({ cruiseId, ages, services, onPromoApplied }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { valid: bool, message: string, promo: object }

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await validatePromoCode({
        code: code.trim().toUpperCase(),
        cruiseId,
        ages,
        services,
      });

      if (res.valid) {
        setStatus({
          valid: true,
          message: `${res.promo.code} applied — ${
            res.promo.type === 'percentage' ? `${res.promo.value}% voyage discount` : `₹${res.promo.value} discount`
          }`,
          promo: res.promo,
        });
        onPromoApplied(res.promo);
      } else {
        setStatus({
          valid: false,
          message: res.message || 'This promotional code is not applicable.',
        });
        onPromoApplied(null);
      }
    } catch (err) {
      setStatus({
        valid: false,
        message: err.response?.data?.message || 'Invalid promotional code.',
      });
      onPromoApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    setStatus(null);
    onPromoApplied(null);
  };

  return (
    <div>
      <form onSubmit={handleApply} style={{ display: 'flex', gap: '8px' }}>
        <input
          id="promo-code-input"
          type="text"
          placeholder="e.g. SUMMER10, CREW25"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className="luxury-input"
          style={{ flex: 1, letterSpacing: '0.08em' }}
          disabled={loading || status?.valid}
        />
        {status?.valid ? (
          <button
            id="remove-promo-btn"
            type="button"
            onClick={handleRemove}
            className="btn-luxury-ghost"
            style={{ padding: '10px 18px', fontSize: '11px' }}
          >
            Remove
          </button>
        ) : (
          <button
            id="apply-promo-btn"
            type="submit"
            className="btn-luxury-primary"
            disabled={loading || !code.trim()}
            style={{ padding: '10px 22px', fontSize: '11px' }}
          >
            {loading ? '...' : 'Apply'}
          </button>
        )}
      </form>

      {/* Validation Message */}
      {status && (
        <div
          style={{
            marginTop: '12px',
            fontSize: '12px',
            letterSpacing: '0.04em',
            color: status.valid ? '#4ade80' : '#f87171',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <span>{status.valid ? '✓' : '⚠️'}</span>
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

export default PromoCode;

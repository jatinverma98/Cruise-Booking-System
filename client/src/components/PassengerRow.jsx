const getFareBadge = (age) => {
  if (age === '' || age === null || age === undefined) return null;
  const num = Number(age);
  if (num < 0 || num > 120) return { label: 'Invalid', color: '#f87171' };
  if (num <= 4) return { label: 'Free (0–4)', color: '#4ade80' };
  if (num <= 11) return { label: '50% Child (5–11)', color: '#38bdf8' };
  if (num <= 17) return { label: '75% Child (12–17)', color: '#a78bfa' };
  return { label: 'Adult (18+)', color: '#e2b97f' };
};

const PassengerRow = ({ index, age, onAgeChange, onRemove, canRemove }) => {
  const badge = getFareBadge(age);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'rgba(7, 25, 35, 0.65)',
        border: '1px solid rgba(220, 229, 232, 0.1)',
        borderRadius: '6px',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
          }}
        >
          PASSENGER {String(index + 1).padStart(2, '0')}
        </span>
        {badge && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              color: badge.color,
              padding: '2px 8px',
              borderRadius: '2px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            {badge.label}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label
            htmlFor={`passenger-age-${index}`}
            style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Age
          </label>
          <input
            id={`passenger-age-${index}`}
            type="number"
            min="0"
            max="120"
            value={age}
            onChange={(e) => onAgeChange(index, e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            className="luxury-input"
            style={{ width: '80px', padding: '8px 12px', textAlign: 'center' }}
          />
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            style={{
              background: 'none',
              border: 'none',
              color: '#526f7d',
              cursor: 'pointer',
              fontSize: '12px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              transition: 'color 200ms',
            }}
            onMouseEnter={(e) => (e.target.style.color = '#f87171')}
            onMouseLeave={(e) => (e.target.style.color = '#526f7d')}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

export default PassengerRow;

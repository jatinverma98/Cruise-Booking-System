const PassengerRow = ({ index, age, onAgeChange, onRemove, canRemove }) => {
  const isInvalid = age !== '' && (typeof age !== 'number' || age < 0 || age > 120 || !Number.isInteger(age));

  let fareLabel = '';
  let fareSubtext = '';
  let fareColor = '#f1f5f9';
  let categoryIcon = '👤';

  if (age !== '' && !isInvalid) {
    if (age <= 4) {
      fareLabel = 'FREE';
      fareSubtext = 'Infant (0%)';
      fareColor = '#4ade80';
      categoryIcon = '👶';
    } else if (age <= 11) {
      fareLabel = '50% Fare';
      fareSubtext = 'Child (5–11)';
      fareColor = '#06b6d4';
      categoryIcon = '🧒';
    } else if (age <= 17) {
      fareLabel = '75% Fare';
      fareSubtext = 'Youth (12–17)';
      fareColor = '#fbbf24';
      categoryIcon = '🧑';
    } else {
      fareLabel = '100% Fare';
      fareSubtext = 'Adult (18+)';
      fareColor = '#f1f5f9';
      categoryIcon = '👤';
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: isInvalid ? 'rgba(239,68,68,0.06)' : 'rgba(255,255,255,0.03)',
        borderRadius: '10px',
        border: isInvalid ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.2s ease',
      }}
    >
      <div
        style={{
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: isInvalid ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg, #0891b2, #0369a1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0,
        }}
      >
        {categoryIcon}
      </div>

      <div style={{ flex: 1 }}>
        <label
          htmlFor={`passenger-age-${index}`}
          style={{ fontSize: '12px', color: isInvalid ? '#f87171' : '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' }}
        >
          Passenger {index + 1} Age
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            id={`passenger-age-${index}`}
            type="number"
            min={0}
            max={120}
            placeholder="e.g. 28 or 7"
            value={age}
            onChange={(e) => onAgeChange(index, e.target.value === '' ? '' : Number(e.target.value))}
            className="input-field"
            style={{
              maxWidth: '140px',
              borderColor: isInvalid ? '#ef4444' : undefined,
            }}
          />
          {age === '' && (
            <span style={{ fontSize: '11px', color: '#f59e0b' }}>Age required</span>
          )}
          {isInvalid && (
            <span style={{ fontSize: '11px', color: '#ef4444' }}>Invalid age (0–120)</span>
          )}
        </div>
      </div>

      {age !== '' && !isInvalid && (
        <div style={{ textAlign: 'right', minWidth: '95px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: fareColor }}>{fareLabel}</div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>{fareSubtext}</div>
        </div>
      )}

      {canRemove && (
        <button
          id={`remove-passenger-${index}`}
          type="button"
          onClick={() => onRemove(index)}
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '8px',
            color: '#f87171',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
          title="Remove passenger"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default PassengerRow;

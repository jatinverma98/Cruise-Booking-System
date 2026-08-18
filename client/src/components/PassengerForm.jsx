import PassengerRow from './PassengerRow';

const PassengerForm = ({ ages, onAgesChange }) => {
  const handleAgeChange = (index, value) => {
    const updated = [...ages];
    updated[index] = value;
    onAgesChange(updated);
  };

  const addAdult = () => {
    if (ages.length < 6) {
      onAgesChange([...ages, 30]);
    }
  };

  const addChild = () => {
    if (ages.length < 6) {
      onAgesChange([...ages, 8]);
    }
  };

  const addCustomPassenger = () => {
    if (ages.length < 6) {
      onAgesChange([...ages, '']);
    }
  };

  const removePassenger = (index) => {
    const updated = ages.filter((_, i) => i !== index);
    onAgesChange(updated);
  };

  const adultCount = ages.filter((a) => typeof a === 'number' && a >= 18).length;
  const childCount = ages.filter((a) => typeof a === 'number' && a >= 0 && a < 18).length;
  const hasAdult = adultCount > 0;
  const hasEmptyAge = ages.some((a) => a === '' || a === null || a === undefined);
  const hasNegativeAge = ages.some((a) => typeof a === 'number' && a < 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9' }}>Passengers</h3>
            <span style={{ fontSize: '12px', color: ages.length === 6 ? '#fbbf24' : '#64748b', fontWeight: 600 }}>
              ({ages.length}/6)
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span className="badge badge-teal" style={{ fontSize: '11px' }}>
              👤 {adultCount} Adult{adultCount !== 1 ? 's' : ''} (18+)
            </span>
            <span className="badge badge-gold" style={{ fontSize: '11px' }}>
              🧒 {childCount} Child{childCount !== 1 ? 'ren' : ''} (0–17)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            id="add-adult-btn"
            type="button"
            className="btn-primary"
            onClick={addAdult}
            disabled={ages.length >= 6}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            + Add Adult
          </button>
          <button
            id="add-child-btn"
            type="button"
            className="btn-primary"
            onClick={addChild}
            disabled={ages.length >= 6}
            style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(8,145,178,0.25)', border: '1px solid rgba(8,145,178,0.5)' }}
          >
            + Add Child
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
        {ages.map((age, index) => (
          <PassengerRow
            key={index}
            index={index}
            age={age}
            onAgeChange={handleAgeChange}
            onRemove={removePassenger}
            canRemove={ages.length > 1}
          />
        ))}
      </div>

      {/* Validation alert banners */}
      {!hasAdult && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '13px',
          marginBottom: '10px',
        }}>
          ⚠️ <strong>Minimum 1 adult required:</strong> At least one passenger must be 18 years or older.
        </div>
      )}

      {hasEmptyAge && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(245,158,11,0.12)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '8px',
          color: '#fbbf24',
          fontSize: '13px',
          marginBottom: '10px',
        }}>
          ⚠️ Please specify the age of every passenger.
        </div>
      )}

      {hasNegativeAge && (
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '8px',
          color: '#f87171',
          fontSize: '13px',
          marginBottom: '10px',
        }}>
          ⚠️ Passenger age cannot be negative.
        </div>
      )}

      {/* Child Fare Rules Legend */}
      <div style={{
        padding: '12px 14px',
        background: 'rgba(255,255,255,0.02)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
          Child & Adult Fare Policy:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: '#4ade80' }}>🟢 Age 0–4: <strong>FREE (0%)</strong></div>
          <div style={{ fontSize: '11px', color: '#06b6d4' }}>🔵 Age 5–11: <strong>50% Fare</strong></div>
          <div style={{ fontSize: '11px', color: '#fbbf24' }}>🟡 Age 12–17: <strong>75% Fare</strong></div>
          <div style={{ fontSize: '11px', color: '#f1f5f9' }}>⚪ Age 18+: <strong>100% (Adult)</strong></div>
        </div>
      </div>
    </div>
  );
};

export default PassengerForm;

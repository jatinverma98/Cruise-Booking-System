import PassengerRow from './PassengerRow';

const PassengerForm = ({ ages, onAgesChange }) => {
  const handleAgeChange = (index, value) => {
    const next = [...ages];
    next[index] = value;
    onAgesChange(next);
  };

  const handleAddPassenger = (defaultAge = 30) => {
    if (ages.length < 6) {
      onAgesChange([...ages, defaultAge]);
    }
  };

  const handleRemove = (index) => {
    if (ages.length > 1) {
      onAgesChange(ages.filter((_, i) => i !== index));
    }
  };

  const hasAdult = ages.some((a) => typeof a === 'number' && a >= 18);
  const adultsCount = ages.filter((a) => typeof a === 'number' && a >= 18).length;
  const childrenCount = ages.filter((a) => typeof a === 'number' && a < 18 && a >= 0).length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '8px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <h3
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '15px',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
          }}
        >
          WHO'S COMING ALONG?
        </h3>
        <div style={{ fontSize: '12px', color: '#526f7d', letterSpacing: '0.06em' }}>
          {adultsCount} Adult{adultsCount !== 1 ? 's' : ''} • {childrenCount} Child{childrenCount !== 1 ? 'ren' : ''}
        </div>
      </div>

      <p style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8, marginBottom: '20px' }}>
        Up to 6 passengers per booking. At least one adult (age 18+) is required.
      </p>

      {/* Passenger Rows List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {ages.map((age, i) => (
          <PassengerRow
            key={i}
            index={i}
            age={age}
            onAgeChange={handleAgeChange}
            onRemove={handleRemove}
            canRemove={ages.length > 1}
          />
        ))}
      </div>

      {/* Add Passenger Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          id="add-adult-btn"
          type="button"
          onClick={() => handleAddPassenger(30)}
          disabled={ages.length >= 6}
          className="btn-luxury-ghost"
          style={{ padding: '10px 20px', fontSize: '11px' }}
        >
          + Add Adult
        </button>
        <button
          id="add-child-btn"
          type="button"
          onClick={() => handleAddPassenger(8)}
          disabled={ages.length >= 6}
          className="btn-luxury-ghost"
          style={{ padding: '10px 20px', fontSize: '11px' }}
        >
          + Add Child
        </button>
      </div>

      {/* Warning if no adult */}
      {!hasAdult && (
        <div
          style={{
            marginTop: '16px',
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '4px',
            color: '#f87171',
            fontSize: '12px',
          }}
        >
          ⚠️ At least one adult passenger (age 18 or older) is required to book.
        </div>
      )}
    </div>
  );
};

export default PassengerForm;

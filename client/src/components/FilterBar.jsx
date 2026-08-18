import { useState } from 'react';

const FilterBar = ({ onFilter }) => {
  const [destination, setDestination] = useState('');
  const [maxFare, setMaxFare] = useState('');

  const destinations = ['', 'Caribbean', 'Mediterranean', 'Alaska', 'Northern Europe', 'Bahamas'];

  const handleFilter = () => {
    onFilter({ destination, maxFare: maxFare ? Number(maxFare) : undefined });
  };

  const handleReset = () => {
    setDestination('');
    setMaxFare('');
    onFilter({});
  };

  return (
    <div
      className="glass-card"
      style={{ padding: '20px 24px', marginBottom: '32px' }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignItems: 'flex-end',
        }}
      >
        {/* Destination Filter */}
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em' }}>
            DESTINATION
          </label>
          <select
            id="filter-destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input-field"
            style={{ cursor: 'pointer' }}
          >
            {destinations.map((d) => (
              <option key={d} value={d} style={{ background: '#0f2044' }}>
                {d || 'All Destinations'}
              </option>
            ))}
          </select>
        </div>

        {/* Max Fare Filter */}
        <div style={{ flex: '1', minWidth: '180px' }}>
          <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em' }}>
            MAX FARE (PER ADULT)
          </label>
          <input
            id="filter-max-fare"
            type="number"
            placeholder="e.g. 1500"
            value={maxFare}
            onChange={(e) => setMaxFare(e.target.value)}
            className="input-field"
            min={0}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            id="filter-apply-btn"
            className="btn-primary"
            onClick={handleFilter}
            style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
          >
            🔍 Search
          </button>
          <button
            id="filter-reset-btn"
            onClick={handleReset}
            style={{
              padding: '10px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '10px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s',
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

import CruiseCard from './CruiseCard';

const CruiseGrid = ({ cruises, loading }) => {
  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card" style={{ overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: '160px' }} />
            <div style={{ padding: '20px' }}>
              <div className="skeleton" style={{ height: '14px', width: '60%', marginBottom: '12px' }} />
              <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '16px' }} />
              <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '20px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="skeleton" style={{ height: '30px', width: '100px' }} />
                <div className="skeleton" style={{ height: '40px', width: '100px', borderRadius: '10px' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!cruises || cruises.length === 0) {
    return (
      <div
        className="glass-card"
        style={{ padding: '60px 32px', textAlign: 'center' }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h3 style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          No cruises found
        </h3>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          Try adjusting your filters to see more options.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
      {cruises.map((cruise) => (
        <CruiseCard key={cruise._id} cruise={cruise} />
      ))}
    </div>
  );
};

export default CruiseGrid;

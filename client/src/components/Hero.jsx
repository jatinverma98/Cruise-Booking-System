const Hero = () => (
  <div
    style={{
      background: 'linear-gradient(160deg, #0c4a6e 0%, #0a1628 50%, #0f172a 100%)',
      padding: '80px 24px 64px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    {/* Background decoration */}
    <div style={{
      position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(8,145,178,0.12) 0%, transparent 70%)',
      top: '-200px', left: '50%', transform: 'translateX(-50%)',
      pointerEvents: 'none',
    }} />
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
      background: 'linear-gradient(90deg, transparent, rgba(8,145,178,0.6), transparent)',
    }} />

    <div style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
      <div className="badge badge-teal" style={{ marginBottom: '20px', fontSize: '12px' }}>
        🚢 World-Class Cruise Experiences
      </div>

      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          fontWeight: 700,
          color: '#f1f5f9',
          lineHeight: 1.15,
          marginBottom: '20px',
        }}
      >
        Set Sail on Your{' '}
        <span style={{ color: '#06b6d4' }}>Dream Voyage</span>
      </h1>

      <p style={{ fontSize: '17px', color: '#94a3b8', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto 36px' }}>
        Discover extraordinary destinations with world-class cruise lines. 
        Book with confidence — transparent pricing, every time.
      </p>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { icon: '🌍', label: '5 Destinations' },
          { icon: '🚢', label: '5 Premium Ships' },
          { icon: '⭐', label: 'Price Guarantee' },
        ].map(({ icon, label }) => (
          <div
            key={label}
            className="glass-card"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ fontSize: '18px' }}>{icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#cbd5e1' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Hero;

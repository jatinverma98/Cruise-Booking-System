import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav
      style={{
        background: 'rgba(10, 22, 40, 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0891b2, #0369a1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              boxShadow: '0 4px 12px rgba(8,145,178,0.4)',
            }}
          >
            🚢
          </div>
          <div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              Odysseus
            </div>
            <div style={{ fontSize: '10px', color: '#06b6d4', fontWeight: 600, letterSpacing: '0.08em', marginTop: '-2px' }}>
              CRUISE BOOKING
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            to="/"
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: location.pathname === '/' ? '#06b6d4' : '#94a3b8',
              background: location.pathname === '/' ? 'rgba(8,145,178,0.1)' : 'transparent',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            Cruises
          </Link>

          <a
            href="#"
            style={{
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#0a1628',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
              transition: 'all 0.2s',
            }}
          >
            Find Booking
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

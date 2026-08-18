import { Link } from 'react-router-dom';
import { formatINRCompact } from '../utils/currency';

/**
 * Real destination images from Unsplash (free, no auth required).
 * ?auto=format&fit=crop ensures consistent sizing.
 */
const DESTINATION_IMAGES = {
  Caribbean:
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=600&q=80',
  Mediterranean:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  Alaska:
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80',
  'Northern Europe':
    'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=600&q=80',
  Bahamas:
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=600&q=80',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=600&q=80';

const CruiseCard = ({ cruise }) => {
  // `available` is computed SERVER-SIDE — the backend is the source of truth.
  // Do NOT recompute this from capacityLeft on the frontend.
  const isSoldOut = !cruise.available;
  const isLimited = cruise.available && cruise.capacityLeft <= 4;
  const image = DESTINATION_IMAGES[cruise.destination] || DEFAULT_IMAGE;

  return (
    <div
      className="glass-card animate-fade-in-up"
      style={{
        overflow: 'hidden',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: isSoldOut ? 'not-allowed' : 'pointer',
      }}
      onMouseEnter={(e) => {
        if (!isSoldOut) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 20px 50px rgba(8,145,178,0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Hero Image */}
      <div
        style={{
          height: '180px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <img
          src={image}
          alt={`${cruise.destination} cruise`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isSoldOut ? 'grayscale(0.7) brightness(0.5)' : 'brightness(0.8)',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => { if (!isSoldOut) e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        />
        {/* Gradient overlay for text readability */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(10,22,40,0.85) 0%, transparent 60%)',
          }}
        />

        {/* Cruise Line label on image */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '14px',
            fontSize: '11px',
            color: '#67e8f9',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textShadow: '0 1px 4px rgba(0,0,0,0.8)',
          }}
        >
          {cruise.cruiseLine}
        </div>

        {/* Availability badge */}
        {isSoldOut && (
          <div
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(239,68,68,0.92)', color: '#fff',
              padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              letterSpacing: '0.05em', backdropFilter: 'blur(4px)',
            }}
          >
            SOLD OUT
          </div>
        )}
        {isLimited && (
          <div
            style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(245,158,11,0.92)', color: '#0a1628',
              padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700,
              backdropFilter: 'blur(4px)',
            }}
          >
            {cruise.capacityLeft} LEFT
          </div>
        )}
      </div>

      {/* Card Content */}
      <div style={{ padding: '18px 20px 20px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f1f5f9', marginBottom: '10px', lineHeight: 1.3 }}>
          {cruise.ship}
        </h3>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
          <span className="badge badge-teal">📍 {cruise.destination}</span>
          <span className="badge badge-gold">🌙 {cruise.nights} nights</span>
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>from</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#f1f5f9' }}>
              {formatINRCompact(cruise.adultFare)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>per adult</div>
          </div>

          {!isSoldOut ? (
            <Link to={`/cruises/${cruise._id}`} style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                Book Now →
              </button>
            </Link>
          ) : (
            <button className="btn-primary" disabled style={{ padding: '10px 20px', fontSize: '14px' }}>
              Sold Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CruiseCard;

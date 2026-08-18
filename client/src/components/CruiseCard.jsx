import { Link } from 'react-router-dom';
import { formatINRCompact } from '../utils/currency';

const SHIP_IMAGES = {
  'Wonder of the Seas':
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=85',
  'Celebrity Beyond':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
  'Norwegian Prima':
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=85',
  'Sky Princess':
    'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1600&q=85',
  'MSC Seascape':
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1600&q=85',
};

const DESTINATION_IMAGES = {
  Caribbean:
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1600&q=85',
  Mediterranean:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85',
  Alaska:
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1600&q=85',
  'Northern Europe':
    'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1600&q=85',
  Bahamas:
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1600&q=85',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1600&q=85';

const CruiseCard = ({ cruise, isFeatured = false }) => {
  const { _id, cruiseLine, ship, destination, nights, adultFare, capacityLeft, available } = cruise;
  const isSoldOut = !available || capacityLeft === 0;
  const isLowCapacity = !isSoldOut && capacityLeft <= 4;
  const imageUrl = SHIP_IMAGES[ship] || DESTINATION_IMAGES[destination] || DEFAULT_IMAGE;

  if (isFeatured) {
    return (
      <div
        className="luxury-card image-zoom-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          borderRadius: '12px',
          border: '1px solid rgba(220, 229, 232, 0.15)',
          backgroundColor: '#0D2633',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        {/* Large Featured Image */}
        <div style={{ position: 'relative', minHeight: '380px', overflow: 'hidden' }}>
          <img
            src={imageUrl}
            alt={`${ship} — ${destination}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.85)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
            }}
          >
            <span
              style={{
                background: 'rgba(7, 25, 35, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '6px 14px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: '#e2b97f',
                textTransform: 'uppercase',
                borderRadius: '2px',
                border: '1px solid rgba(226, 185, 127, 0.3)',
              }}
            >
              ★ FEATURED FLAGSHIP VOYAGE
            </span>
          </div>
        </div>

        {/* Featured Content Info */}
        <div
          style={{
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.22em',
                color: '#38bdf8',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              {cruiseLine}
            </div>
            <h3
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              {ship}
            </h3>
            <div
              style={{
                display: 'flex',
                gap: '16px',
                fontSize: '13px',
                color: '#DCE5E8',
                letterSpacing: '0.08em',
                marginBottom: '24px',
                textTransform: 'uppercase',
              }}
            >
              <span>📍 {destination}</span>
              <span>•</span>
              <span>🌙 {nights} Nights</span>
            </div>

            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.15rem',
                lineHeight: 1.6,
                color: '#DCE5E8',
                marginBottom: '32px',
                opacity: 0.85,
              }}
            >
              Immerse yourself in unrivaled luxury with spacious suites, ocean-view fine dining,
              and bespoke shore excursions curated exclusively for Odysseus guests.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '20px',
              paddingTop: '24px',
              borderTop: '1px solid rgba(220, 229, 232, 0.1)',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                FROM
              </div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                {formatINRCompact(adultFare)}
                <span style={{ fontSize: '12px', color: '#526f7d', fontFamily: 'sans-serif', fontWeight: 400, marginLeft: '6px' }}>
                  / adult
                </span>
              </div>
              <div style={{ marginTop: '6px' }}>
                {isSoldOut ? (
                  <span className="luxury-badge luxury-badge-sold-out">SOLD OUT</span>
                ) : isLowCapacity ? (
                  <span className="luxury-badge luxury-badge-low">ONLY {capacityLeft} SEATS LEFT</span>
                ) : (
                  <span className="luxury-badge luxury-badge-available">{capacityLeft} SEATS AVAILABLE</span>
                )}
              </div>
            </div>

            <Link
              to={`/cruises/${_id}`}
              className={isSoldOut ? 'btn-luxury-ghost' : 'btn-luxury-primary'}
              style={{
                minWidth: '180px',
                opacity: isSoldOut ? 0.6 : 1,
              }}
            >
              {isSoldOut ? 'View Details' : 'Explore Voyage →'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Standard Editorial Card
  return (
    <div
      className="luxury-card image-zoom-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        border: '1px solid rgba(220, 229, 232, 0.12)',
        backgroundColor: '#0D2633',
        height: '100%',
      }}
    >
      {/* Image with status badge */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        <img
          src={imageUrl}
          alt={`${ship} — ${destination}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isSoldOut ? 'grayscale(0.6) brightness(0.6)' : 'brightness(0.9)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
          }}
        >
          {isSoldOut ? (
            <span className="luxury-badge luxury-badge-sold-out">SOLD OUT</span>
          ) : isLowCapacity ? (
            <span className="luxury-badge luxury-badge-low">ONLY {capacityLeft} SEATS LEFT</span>
          ) : (
            <span className="luxury-badge luxury-badge-available">{capacityLeft} AVAILABLE</span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
        }}
      >
        <div>
          <div
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            {cruiseLine}
          </div>
          <h4
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            {ship}
          </h4>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              fontSize: '12px',
              color: '#DCE5E8',
              letterSpacing: '0.06em',
              marginBottom: '20px',
              textTransform: 'uppercase',
            }}
          >
            <span>📍 {destination}</span>
            <span>•</span>
            <span>🌙 {nights} Nights</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(220, 229, 232, 0.08)',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: '#526f7d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              FROM
            </div>
            <div
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '20px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              {formatINRCompact(adultFare)}
            </div>
          </div>

          <Link
            to={`/cruises/${_id}`}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isSoldOut ? '#526f7d' : '#FFFFFF',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'color 200ms',
            }}
          >
            {isSoldOut ? 'View Details →' : 'Explore →'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CruiseCard;

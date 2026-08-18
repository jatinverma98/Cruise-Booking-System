import { useState } from 'react';

const DESTINATION_DATA = [
  {
    name: 'Caribbean',
    tagline: 'Turquoise lagoons & tropical trade winds',
    image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80',
    cruisesCount: '7-Night Voyages',
  },
  {
    name: 'Mediterranean',
    tagline: 'Ancient harbors, azure waters & coastal cliffs',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    cruisesCount: '10-Night Voyages',
  },
  {
    name: 'Alaska',
    tagline: 'Glacial wilderness, fjords & untamed majesty',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
    cruisesCount: '5-Night Voyages',
  },
  {
    name: 'Northern Europe',
    tagline: 'Fjords of Scandinavia & Baltic heritage',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=1200&q=80',
    cruisesCount: '12-Night Voyages',
  },
  {
    name: 'Bahamas',
    tagline: 'Sun-drenched coves & coral barrier reefs',
    image: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
    cruisesCount: '4-Night Voyages',
  },
];

const DestinationsSection = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const scrollToCruises = () => {
    const el = document.getElementById('featured-cruises');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="destinations"
      style={{
        padding: '120px 24px',
        backgroundColor: '#0D2633',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.35em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '12px',
            }}
          >
            DISCOVER THE WORLD
          </span>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(2rem, 4vw, 3.2rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            WHERE WILL
            <br />
            THE SEA TAKE YOU?
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.2rem',
              color: '#DCE5E8',
              maxWidth: '500px',
              margin: '0 auto',
              opacity: 0.85,
            }}
          >
            From sun-kissed Caribbean atolls to Scandinavian fjords, every destination is an ode to discovery.
          </p>
        </div>

        {/* Destination Cards Carousel / Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
          }}
        >
          {DESTINATION_DATA.map((dest, idx) => (
            <div
              key={dest.name}
              onClick={scrollToCruises}
              onMouseEnter={() => setActiveIdx(idx)}
              className="luxury-card image-zoom-container"
              style={{
                height: '420px',
                position: 'relative',
                borderRadius: '8px',
                cursor: 'pointer',
                border: '1px solid rgba(220, 229, 232, 0.15)',
              }}
            >
              <img
                src={dest.image}
                alt={dest.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.65)',
                }}
              />

              {/* Dark Overlay */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(to top, rgba(7, 25, 35, 0.95) 0%, rgba(7, 25, 35, 0.2) 60%, transparent 100%)',
                }}
              />

              {/* Card Content */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    color: '#38bdf8',
                    textTransform: 'uppercase',
                  }}
                >
                  {dest.cruisesCount}
                </span>
                <h3
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {dest.name}
                </h3>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.95rem',
                    color: '#DCE5E8',
                    lineHeight: 1.4,
                    opacity: 0.8,
                    marginBottom: '12px',
                  }}
                >
                  {dest.tagline}
                </p>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.14em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Explore Destination →
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestinationsSection;

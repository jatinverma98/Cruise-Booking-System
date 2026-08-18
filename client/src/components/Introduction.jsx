const Introduction = () => {
  return (
    <section
      style={{
        padding: '120px 24px',
        backgroundColor: '#071923',
        position: 'relative',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '64px',
          alignItems: 'center',
        }}
      >
        {/* Editorial Text */}
        <div>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.35em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '16px',
            }}
          >
            PHILOSOPHY OF VOYAGING
          </span>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(2rem, 3.8vw, 3.2rem)',
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: '0.08em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '28px',
            }}
          >
            THE JOURNEY
            <br />
            IS THE DESTINATION
          </h2>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              lineHeight: 1.8,
              color: '#DCE5E8',
              marginBottom: '24px',
              opacity: 0.9,
            }}
          >
            Odysseus crafts voyages for those who seek more than a cruise—those who yearn for
            the romance of the open sea, secluded coves untouched by time, and world-class hospitality
            that anticipates every desire before it is spoken.
          </p>
          <div
            style={{
              display: 'flex',
              gap: '40px',
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(220, 229, 232, 0.12)',
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                100%
              </div>
              <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                LOCKED-IN PRICING
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                5★
              </div>
              <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                CURATED SHIPS
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                }}
              >
                24/7
              </div>
              <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                VOYAGE CONCIERGE
              </div>
            </div>
          </div>
        </div>

        {/* Atmospheric Overlapping Image Card */}
        <div style={{ position: 'relative' }}>
          <div
            className="luxury-card image-zoom-container"
            style={{
              borderRadius: '12px',
              height: '480px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(220, 229, 232, 0.15)',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
              alt="Mediterranean Horizon"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '32px',
                background:
                  'linear-gradient(to top, rgba(7, 25, 35, 0.95), transparent)',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  letterSpacing: '0.2em',
                  color: '#38bdf8',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  marginBottom: '6px',
                }}
              >
                MEDITERRANEAN ARCHIPELAGO
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.25rem',
                  color: '#FFFFFF',
                  fontStyle: 'italic',
                }}
              >
                "The ocean stirs the heart, inspires the imagination and brings eternal joy to the soul."
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Introduction;

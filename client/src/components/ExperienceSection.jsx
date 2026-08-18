const EXPERIENCES = [
  {
    number: '01',
    title: 'THE OCEAN',
    description:
      'Immerse in the boundless calm of the open sea. Wake to endless horizons, secluded ocean sounds, and star-filled night skies far from the noise of civilization.',
  },
  {
    number: '02',
    title: 'THE DESTINATIONS',
    description:
      'Step ashore at hidden anchorages and storied harbors. Experience private shore excursions, local gastronomic heritage, and cultural discovery guided by regional masters.',
  },
  {
    number: '03',
    title: 'THE JOURNEY',
    description:
      'Travel with effortless elegance. From bespoke suite amenities and world-class culinary art to our transparent pricing guarantee, every detail is considered.',
  },
];

const ExperienceSection = () => {
  return (
    <section
      id="experience"
      style={{
        padding: '120px 24px',
        backgroundColor: '#071923',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Full-width Cinematic Image Card with subtle text overlay */}
        <div
          className="luxury-card"
          style={{
            position: 'relative',
            height: '460px',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '64px',
            border: '1px solid rgba(220, 229, 232, 0.15)',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=2000&q=80"
            alt="The Odysseus Experience"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'brightness(0.4)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              padding: '32px',
              background: 'radial-gradient(circle, transparent 40%, rgba(7,25,35,0.7) 100%)',
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.35em',
                color: '#38bdf8',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              DISTINCTIVE TRAVEL
            </span>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1.8rem, 4.5vw, 3.4rem)',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
                marginBottom: '16px',
              }}
            >
              THE ODYSSEUS EXPERIENCE
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.35rem',
                fontStyle: 'italic',
                color: '#DCE5E8',
                maxWidth: '560px',
              }}
            >
              More than a cruise. A timeless voyage designed to be remembered.
            </p>
          </div>
        </div>

        {/* 3 Editorial Experience Pillars */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
          }}
        >
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.number}
              style={{
                padding: '32px',
                background: 'rgba(13, 38, 51, 0.4)',
                border: '1px solid rgba(220, 229, 232, 0.08)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '36px',
                  fontWeight: 800,
                  color: 'rgba(56, 189, 248, 0.4)',
                  letterSpacing: '0.08em',
                }}
              >
                {exp.number}
              </div>
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {exp.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.15rem',
                  lineHeight: 1.7,
                  color: '#DCE5E8',
                  opacity: 0.85,
                }}
              >
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;

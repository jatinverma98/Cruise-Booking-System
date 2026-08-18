import { Link } from 'react-router-dom';

const Hero = () => {
  const scrollToCruises = () => {
    const el = document.getElementById('featured-cruises');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        position: 'relative',
        height: '100vh',
        minHeight: '680px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Background Cinematic Image */}
      <img
        src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=2400&q=85"
        alt="Odysseus Luxury Ocean Voyage"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 40%',
          filter: 'brightness(0.42)',
          transform: 'scale(1.02)',
        }}
      />

      {/* Atmospheric Radial & Gradient Overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, rgba(7,25,35,0.2) 0%, rgba(7,25,35,0.7) 70%, rgba(7,25,35,0.95) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(7,25,35,0.5) 0%, transparent 40%, rgba(7,25,35,0.9) 100%)',
        }}
      />

      {/* Hero Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '0 24px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Brand Tag */}
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.45em',
            color: '#DCE5E8',
            textTransform: 'uppercase',
            marginBottom: '20px',
            opacity: 0.9,
          }}
        >
          ODYSSEUS OCEANIC
        </div>

        {/* Cinematic Large Heading */}
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2.4rem, 6.5vw, 4.5rem)',
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '0.12em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '24px',
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.6)',
          }}
        >
          VOYAGES
          <br />
          BEYOND THE
          <br />
          ORDINARY
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 'clamp(1.15rem, 2vw, 1.45rem)',
            fontStyle: 'italic',
            lineHeight: 1.6,
            color: '#F5F3EF',
            maxWidth: '620px',
            marginBottom: '40px',
            opacity: 0.92,
          }}
        >
          Explore curated journeys across the world's most breathtaking oceans,
          where timeless luxury meets undiscovered horizons.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={scrollToCruises}
            className="btn-luxury-primary"
            style={{ minWidth: '180px' }}
          >
            Explore Cruises
          </button>
          <a
            href="#destinations"
            className="btn-luxury-ghost"
            style={{ minWidth: '180px' }}
          >
            Plan Your Journey
          </a>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
        onClick={scrollToCruises}
      >
        <span
          style={{
            fontSize: '9px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: '#DCE5E8',
            opacity: 0.6,
          }}
        >
          DISCOVER
        </span>
        <div
          style={{
            width: '1px',
            height: '24px',
            backgroundColor: 'rgba(220, 229, 232, 0.4)',
            animation: 'pulse 2s infinite',
          }}
        />
      </div>
    </section>
  );
};

export default Hero;

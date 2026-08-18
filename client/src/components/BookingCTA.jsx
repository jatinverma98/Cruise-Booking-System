import { Link } from 'react-router-dom';

const BookingCTA = () => {
  const scrollToCruises = () => {
    const el = document.getElementById('featured-cruises');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      style={{
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src="https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=2000&q=80"
        alt="Northern Europe Fjord"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.28)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, #071923, transparent 30%, transparent 70%, #071923)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '800px',
          textAlign: 'center',
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
            display: 'block',
            marginBottom: '16px',
          }}
        >
          BEGIN YOUR JOURNEY
        </span>
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          READY TO EMBARK ON
          <br />
          YOUR NEXT ODYSSEY?
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.25rem',
            color: '#DCE5E8',
            marginBottom: '40px',
            opacity: 0.9,
          }}
        >
          Explore available voyages, configure your travel party, and secure locked-in rates.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={scrollToCruises} className="btn-luxury-primary" style={{ minWidth: '200px' }}>
            Explore All Cruises
          </button>
          <Link to="/booking" className="btn-luxury-ghost" style={{ minWidth: '200px' }}>
            Find My Booking
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BookingCTA;

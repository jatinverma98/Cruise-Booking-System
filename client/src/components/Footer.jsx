import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: '#051119',
        borderTop: '1px solid rgba(220, 229, 232, 0.08)',
        padding: '80px 24px 40px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '48px',
          marginBottom: '64px',
        }}
      >
        {/* Brand Column */}
        <div style={{ gridColumn: 'span 2' }}>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.28em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            ODYSSEUS
          </div>
          <div
            style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            VOYAGES BEYOND THE ORDINARY
          </div>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.1rem',
              color: '#DCE5E8',
              lineHeight: 1.6,
              maxWidth: '360px',
              opacity: 0.8,
            }}
          >
            Curated luxury ocean voyages with guaranteed locked-in pricing, bespoke shore
            excursions, and unforgettable destinations across the globe.
          </p>
        </div>

        {/* Explore */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            EXPLORE
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <a href="/#featured-cruises" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px', transition: 'color 200ms' }}>
                Cruises
              </a>
            </li>
            <li>
              <a href="/#destinations" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px', transition: 'color 200ms' }}>
                Destinations
              </a>
            </li>
            <li>
              <a href="/#experience" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px', transition: 'color 200ms' }}>
                Experiences
              </a>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            COMPANY
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <a href="/#about" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px' }}>
                About
              </a>
            </li>
            <li>
              <a href="/#experience" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px' }}>
                Our Story
              </a>
            </li>
            <li>
              <a href="mailto:concierge@odysseuscruises.com" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px' }}>
                Contact Concierge
              </a>
            </li>
          </ul>
        </div>

        {/* Book */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.2em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            BOOK
          </div>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li>
              <a href="/#featured-cruises" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px' }}>
                Find a Cruise
              </a>
            </li>
            <li>
              <Link to="/booking" style={{ color: '#526f7d', textDecoration: 'none', fontSize: '13px' }}>
                My Booking Reference
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '32px',
          borderTop: '1px solid rgba(220, 229, 232, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          fontSize: '12px',
          color: '#526f7d',
        }}
      >
        <div>© 2026 Odysseus Cruises. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span>Privacy Policy</span>
          <span>Terms of Carriage</span>
          <span>Security</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

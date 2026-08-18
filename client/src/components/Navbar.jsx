import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'all 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          backgroundColor: scrolled ? 'rgba(7, 25, 35, 0.88)' : 'transparent',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: scrolled
            ? '1px solid rgba(220, 229, 232, 0.08)'
            : '1px solid rgba(255, 255, 255, 0.05)',
          padding: scrolled ? '16px 0' : '24px 0',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo / Wordmark */}
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '22px',
                fontWeight: 700,
                letterSpacing: '0.28em',
                color: '#FFFFFF',
                textTransform: 'uppercase',
              }}
            >
              ODYSSEUS
            </span>
            <span
              style={{
                fontSize: '9px',
                letterSpacing: '0.35em',
                color: '#DCE5E8',
                opacity: 0.7,
                textTransform: 'uppercase',
              }}
            >
              VOYAGES
            </span>
          </Link>

          {/* Desktop Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '36px',
            }}
            className="hidden md:flex"
          >
            <Link
              to="/#featured-cruises"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              Cruises
            </Link>
            <Link
              to="/#destinations"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              Destinations
            </Link>
            <Link
              to="/#experience"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              Experience
            </Link>
            <Link
              to="/#about"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              About
            </Link>

            {/* Find Booking Button */}
            <Link
              to="/booking"
              className="btn-luxury-ghost"
              style={{
                padding: '9px 18px',
                fontSize: '11px',
                letterSpacing: '0.14em',
              }}
            >
              Find Booking
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden"
            aria-label="Toggle navigation menu"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '1.5px',
                backgroundColor: '#FFFFFF',
                transition: 'all 300ms',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(4px, 5px)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '1.5px',
                backgroundColor: '#FFFFFF',
                opacity: mobileMenuOpen ? 0 : 1,
                transition: 'all 300ms',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '22px',
                height: '1.5px',
                backgroundColor: '#FFFFFF',
                transition: 'all 300ms',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(4px, -5px)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 49,
            backgroundColor: 'rgba(7, 25, 35, 0.98)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            padding: '40px 24px',
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '24px',
              letterSpacing: '0.3em',
              color: '#FFFFFF',
              marginBottom: '20px',
            }}
          >
            ODYSSEUS
          </span>

          <Link
            to="/#featured-cruises"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Cruises
          </Link>
          <Link
            to="/#destinations"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Destinations
          </Link>
          <Link
            to="/#experience"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            Experience
          </Link>
          <Link
            to="/#about"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
            }}
          >
            About
          </Link>
          <Link
            to="/booking"
            onClick={() => setMobileMenuOpen(false)}
            className="btn-luxury-primary"
            style={{ marginTop: '16px' }}
          >
            Find My Booking
          </Link>
        </div>
      )}
    </>
  );
};

export default Navbar;

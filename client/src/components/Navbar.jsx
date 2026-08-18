import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (location.pathname === '/') {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', `#${targetId}`);
      }
    } else {
      navigate(`/#${targetId}`);
    }
  };

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
          backgroundColor: scrolled ? 'rgba(7, 25, 35, 0.92)' : 'transparent',
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
            <a
              href="#featured-cruises"
              onClick={(e) => handleNavClick(e, 'featured-cruises')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              Cruises
            </a>
            <a
              href="#destinations"
              onClick={(e) => handleNavClick(e, 'destinations')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              Destinations
            </a>
            <a
              href="#experience"
              onClick={(e) => handleNavClick(e, 'experience')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              Experience
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, 'about')}
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#DCE5E8',
                textDecoration: 'none',
                transition: 'color 200ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#FFFFFF')}
              onMouseLeave={(e) => (e.target.style.color = '#DCE5E8')}
            >
              About
            </a>

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

          <a
            href="#featured-cruises"
            onClick={(e) => handleNavClick(e, 'featured-cruises')}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Cruises
          </a>
          <a
            href="#destinations"
            onClick={(e) => handleNavClick(e, 'destinations')}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Destinations
          </a>
          <a
            href="#experience"
            onClick={(e) => handleNavClick(e, 'experience')}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Experience
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            style={{
              fontSize: '18px',
              letterSpacing: '0.18em',
              color: '#F5F3EF',
              textDecoration: 'none',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            About
          </a>
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

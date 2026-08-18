import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BookingSummary from '../components/BookingSummary';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { fetchBookingByReference } from '../services/api';

const BookingConfirmationPage = () => {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search reference state
  const [searchRef, setSearchRef] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    if (!reference) {
      setLoading(false);
      return;
    }
    const load = async () => {
      try {
        const data = await fetchBookingByReference(reference);
        setBooking(data);
      } catch (err) {
        setError(err.response?.data?.message || `No booking found with reference "${reference}".`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reference]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchRef.trim()) return;
    setSearching(true);
    setSearchError(null);
    try {
      await fetchBookingByReference(searchRef.trim());
      navigate(`/booking/${searchRef.trim().toUpperCase()}`);
    } catch {
      setSearchError(`No booking found with reference "${searchRef.trim()}".`);
    } finally {
      setSearching(false);
    }
  };

  // No reference param — Show "Find Booking" Lookup Card
  if (!reference) {
    return (
      <div style={{ backgroundColor: '#071923', minHeight: '100vh', paddingTop: '120px' }}>
        <main style={{ maxWidth: '640px', margin: '40px auto 100px', padding: '0 24px' }}>
          <div
            className="luxury-card"
            style={{
              padding: '48px 36px',
              textAlign: 'center',
              backgroundColor: '#0D2633',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚓</div>
            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '24px',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '12px',
              }}
            >
              FIND YOUR VOYAGE
            </h1>
            <p style={{ color: '#DCE5E8', fontSize: '14px', marginBottom: '32px', opacity: 0.85 }}>
              Enter your official Odysseus booking reference (e.g. ODY-20260818-A7F42C) to view
              your confirmed itinerary.
            </p>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
              <input
                id="search-reference-input"
                type="text"
                placeholder="e.g. ODY-20260818-A7F42C"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
                className="luxury-input"
                style={{ flex: 1, letterSpacing: '0.08em', textAlign: 'center' }}
              />
              <button
                id="search-booking-btn"
                type="submit"
                className="btn-luxury-primary"
                disabled={searching || !searchRef.trim()}
                style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}
              >
                {searching ? '...' : 'Lookup'}
              </button>
            </form>

            {searchError && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '4px',
                  color: '#f87171',
                  fontSize: '13px',
                }}
              >
                ⚠️ {searchError}
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <Link
                to="/#featured-cruises"
                style={{
                  color: '#38bdf8',
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                ← Browse Available Voyages
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) return <LoadingState message="Retrieving your confirmed reservation..." />;

  if (error) {
    return (
      <div style={{ backgroundColor: '#071923', minHeight: '100vh', paddingTop: '120px' }}>
        <main style={{ maxWidth: '640px', margin: '40px auto 100px', padding: '0 24px' }}>
          <ErrorMessage message={error} />
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link
              to="/#featured-cruises"
              style={{
                color: '#38bdf8',
                fontSize: '12px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              ← Return to All Voyages
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#071923', minHeight: '100vh', paddingTop: '100px' }}>
      <title>{`Voyage ${reference} Confirmed — Odysseus Cruises`}</title>

      <main style={{ maxWidth: '860px', margin: '0 auto 80px', padding: '0 24px' }}>
        {/* Confirmed Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
            VOYAGE CONFIRMATION
          </span>
          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '12px',
            }}
          >
            YOUR JOURNEY
            <br />
            IS CONFIRMED
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.25rem',
              color: '#DCE5E8',
              opacity: 0.9,
            }}
          >
            Thank you for choosing Odysseus. Your reservation is permanently locked in.
          </p>
        </div>

        {/* Booking Summary Manifest */}
        <BookingSummary booking={booking} />

        {/* Action Controls */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '40px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            id="print-booking-btn"
            onClick={() => window.print()}
            className="btn-luxury-ghost"
            style={{ minWidth: '180px' }}
          >
            🖨️ Print Itinerary
          </button>
          <button
            id="browse-more-btn"
            onClick={() => navigate('/#featured-cruises')}
            className="btn-luxury-primary"
            style={{ minWidth: '220px' }}
          >
            Explore More Voyages
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingConfirmationPage;

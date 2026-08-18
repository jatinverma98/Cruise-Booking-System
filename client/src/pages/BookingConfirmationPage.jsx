import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import BookingSummary from '../components/BookingSummary';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { fetchBookingByReference } from '../services/api';

const BookingConfirmationPage = () => {
  const { reference } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // "Find a booking" lookup form
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

  // No reference param — show search form
  if (!reference) {
    return (
      <main style={{ maxWidth: '600px', margin: '80px auto', padding: '0 24px' }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', color: '#f1f5f9', marginBottom: '8px' }}>
            Find Your Booking
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '32px' }}>
            Enter your booking reference to view your confirmed booking.
          </p>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
            <input
              id="search-reference-input"
              type="text"
              placeholder="e.g. BK-ABC1234"
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value.toUpperCase())}
              className="input-field"
              style={{ flex: 1, letterSpacing: '0.05em' }}
            />
            <button
              id="search-booking-btn"
              type="submit"
              className="btn-primary"
              disabled={searching || !searchRef.trim()}
              style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
            >
              {searching ? '...' : 'Find'}
            </button>
          </form>
          {searchError && (
            <div style={{ marginTop: '16px', padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#f87171', fontSize: '13px' }}>
              {searchError}
            </div>
          )}
          <div style={{ marginTop: '24px' }}>
            <Link to="/" style={{ color: '#06b6d4', fontSize: '14px', textDecoration: 'none' }}>
              ← Browse cruises
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) return <LoadingState message="Retrieving your booking..." />;

  if (error) {
    return (
      <main style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
        <ErrorMessage message={error} />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/" style={{ color: '#06b6d4', fontSize: '14px', textDecoration: 'none' }}>
            ← Browse cruises
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px' }}>
      <title>Booking {reference} — Odysseus Cruises</title>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: '#f1f5f9', marginBottom: '8px' }}>
          Booking Confirmed
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Your adventure awaits. Here are your booking details.
        </p>
      </div>

      <BookingSummary booking={booking} />

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          id="print-booking-btn"
          onClick={() => window.print()}
          style={{
            padding: '12px 24px',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '10px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          🖨️ Print Booking
        </button>
        <button
          id="browse-more-btn"
          className="btn-primary"
          onClick={() => navigate('/')}
        >
          Browse More Cruises
        </button>
      </div>
    </main>
  );
};

export default BookingConfirmationPage;

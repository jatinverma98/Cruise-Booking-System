import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PassengerForm from '../components/PassengerForm';
import ServiceCard from '../components/ServiceCard';
import PromoCode from '../components/PromoCode';
import PriceBreakdown from '../components/PriceBreakdown';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { fetchCruiseById, getQuote, createBooking } from '../services/api';
import { formatINRCompact } from '../utils/currency';

const DESTINATION_IMAGES = {
  Caribbean:
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&q=80',
  Mediterranean:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  Alaska:
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1200&q=80',
  'Northern Europe':
    'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&w=1200&q=80',
  Bahamas:
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1200&q=80';

const CruiseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cruise, setCruise] = useState(null);
  const [cruiseLoading, setCruiseLoading] = useState(true);
  const [cruiseError, setCruiseError] = useState(null);

  const [ages, setAges] = useState([30]);
  const [services, setServices] = useState({ insurance: false, wifi: false, shoreExcursion: false });
  const [appliedPromo, setAppliedPromo] = useState(null);

  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);

  // Load cruise
  useEffect(() => {
    const load = async () => {
      setCruiseLoading(true);
      try {
        const data = await fetchCruiseById(id);
        setCruise(data);
      } catch (err) {
        setCruiseError(err.response?.data?.message || 'Failed to load cruise details.');
      } finally {
        setCruiseLoading(false);
      }
    };
    load();
  }, [id]);

  // Fetch quote when inputs change
  const fetchQuote = useCallback(async () => {
    const validAges = ages.filter((a) => a !== '' && typeof a === 'number' && a >= 0);
    const hasAdult = validAges.some((a) => a >= 18);
    if (!cruise || validAges.length === 0 || !hasAdult || validAges.length !== ages.length) {
      setQuote(null);
      return;
    }

    setQuoteLoading(true);
    try {
      const data = await getQuote({
        cruiseId: cruise._id,
        ages: validAges,
        services,
        promoCode: appliedPromo?.code || null,
      });
      setQuote(data);
    } catch {
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  }, [cruise, ages, services, appliedPromo]);

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 400);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const handleConfirmBooking = async () => {
    if (!customerName.trim() || !customerEmail.trim()) {
      setBookingError('Please enter your name and email address.');
      return;
    }
    if (!quote) {
      setBookingError('Please get a price quote first.');
      return;
    }

    setBookingLoading(true);
    setBookingError(null);

    try {
      const booking = await createBooking({
        cruiseId: cruise._id,
        customer: { name: customerName.trim(), email: customerEmail.trim() },
        ages: ages.filter((a) => a !== ''),
        services,
        promoCode: appliedPromo?.code || null,
        quoteHash: quote.quoteHash || quote.pricingHash,
        expectedTotal: quote.pricing.total,
      });

      navigate(`/booking/${booking.reference}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Booking failed. Please try again.';
      setBookingError(msg);
      if (err.response?.data?.reason === 'QUOTE_EXPIRED' || err.response?.data?.code === 'QUOTE_EXPIRED') {
        fetchQuote(); // Automatically fetch fresh quote
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (cruiseLoading) return <LoadingState message="Loading cruise details..." />;
  if (cruiseError) return <ErrorMessage message={cruiseError} />;
  if (!cruise) return null;

  const isSoldOut = !cruise.available;
  const image = DESTINATION_IMAGES[cruise.destination] || DEFAULT_IMAGE;

  return (
    <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/')}
        style={{
          background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer',
          fontSize: '14px', fontWeight: 500, marginBottom: '24px', padding: 0,
          display: 'flex', alignItems: 'center', gap: '6px',
        }}
      >
        ← Back to all cruises
      </button>

      {/* Cruise Header */}
      <div
        className="glass-card"
        style={{
          padding: '32px',
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(12,74,110,0.5), rgba(10,22,40,0.8))',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '28px',
          alignItems: 'center',
          flexWrap: 'wrap',
          position: 'relative',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* Background image */}
        <img
          src={image}
          alt={cruise.destination}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', filter: 'brightness(0.35)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, padding: '32px 32px 32px 32px', flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>
            {cruise.cruiseLine}
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '12px' }}>
            {cruise.ship}
          </h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge badge-teal">📍 {cruise.destination}</span>
            <span className="badge badge-gold">🌙 {cruise.nights} nights</span>
            {isSoldOut
              ? <span className="badge badge-red">🚫 Sold Out</span>
              : cruise.capacityLeft <= 4
              ? <span className="badge badge-gold">⚡ Only {cruise.capacityLeft} spots left</span>
              : <span className="badge badge-green">✅ Available</span>
            }
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'right', padding: '32px 32px 32px 0' }}>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>from</div>
          <div style={{ fontSize: '32px', fontWeight: 900, color: '#f1f5f9' }}>{formatINRCompact(cruise.adultFare)}</div>
          <div style={{ fontSize: '12px', color: '#94a3b8' }}>per adult</div>
        </div>
      </div>

      {isSoldOut ? (
        <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😢</div>
          <h2 style={{ color: '#f87171', fontSize: '22px', marginBottom: '8px' }}>This Cruise is Sold Out</h2>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>All spots have been taken. Browse other available cruises.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Browse Other Cruises</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* Passengers */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <PassengerForm ages={ages} onAgesChange={setAges} />
            </div>

            {/* Services */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>
                Optional Services
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <ServiceCard
                  id="service-insurance"
                  icon="🛡️"
                  title="Travel Insurance"
                  description="Comprehensive coverage for your voyage"
                  price="₹6,700/passenger"
                  checked={services.insurance}
                  onChange={(v) => setServices((s) => ({ ...s, insurance: v }))}
                />
                <ServiceCard
                  id="service-wifi"
                  icon="📶"
                  title="Wi-Fi Package"
                  description="Stay connected throughout your journey"
                  price={`₹1,260/passenger/night`}
                  checked={services.wifi}
                  onChange={(v) => setServices((s) => ({ ...s, wifi: v }))}
                />
                <ServiceCard
                  id="service-shore"
                  icon="🏔️"
                  title="Shore Excursion"
                  description="Guided tours at port destinations"
                  price="₹10,000/passenger"
                  checked={services.shoreExcursion}
                  onChange={(v) => setServices((s) => ({ ...s, shoreExcursion: v }))}
                />
              </div>
            </div>

            {/* Promo Code */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px' }}>
                Promotional Code
              </h3>
              <PromoCode
                cruiseId={cruise._id}
                ages={ages.filter((a) => a !== '')}
                services={services}
                onPromoApplied={setAppliedPromo}
              />
            </div>

            {/* Customer Details */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
                Your Details
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                We'll use this to send your booking confirmation.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em' }}>
                    FULL NAME
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    placeholder="John Smith"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 600, marginBottom: '6px', letterSpacing: '0.04em' }}>
                    EMAIL ADDRESS
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    placeholder="john@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Price & Confirm */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '84px' }}>
            <PriceBreakdown quote={quote} loading={quoteLoading} />

            {bookingError && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '10px',
                color: '#f87171',
                fontSize: '13px',
                lineHeight: 1.5,
              }}>
                ⚠️ {bookingError}
              </div>
            )}

            <button
              id="confirm-booking-btn"
              className="btn-gold"
              onClick={handleConfirmBooking}
              disabled={bookingLoading || !quote || !customerName.trim() || !customerEmail.trim()}
              style={{ width: '100%', fontSize: '16px', padding: '16px' }}
            >
              {bookingLoading ? '⏳ Processing...' : '✓ Confirm Booking'}
            </button>

            <p style={{ fontSize: '11px', color: '#475569', textAlign: 'center', lineHeight: 1.6 }}>
              By confirming, your price is locked in permanently. 
              You'll receive a unique booking reference.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default CruiseDetailPage;

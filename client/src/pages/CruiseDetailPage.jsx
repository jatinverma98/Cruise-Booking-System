import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PassengerForm from '../components/PassengerForm';
import ServiceCard from '../components/ServiceCard';
import PromoCode from '../components/PromoCode';
import PriceBreakdown from '../components/PriceBreakdown';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import Footer from '../components/Footer';
import { fetchCruiseById, getQuote, createBooking } from '../services/api';
import { formatINRCompact } from '../utils/currency';

const SHIP_IMAGES = {
  'Wonder of the Seas':
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1800&q=85',
  'Celebrity Beyond':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
  'Norwegian Prima':
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1800&q=85',
  'Sky Princess':
    'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1800&q=85',
  'MSC Seascape':
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1800&q=85',
};

const DESTINATION_IMAGES = {
  Caribbean:
    'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1800&q=85',
  Mediterranean:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=85',
  Alaska:
    'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1800&q=85',
  'Northern Europe':
    'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1800&q=85',
  Bahamas:
    'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1800&q=85',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=1800&q=85';

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
      setBookingError('Please enter your full name and email address.');
      return;
    }
    if (!quote) {
      setBookingError('Please configure your travel party to get a price quote first.');
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
        fetchQuote();
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (cruiseLoading) return <LoadingState message="Loading voyage details..." />;
  if (cruiseError) return <ErrorMessage message={cruiseError} />;
  if (!cruise) return null;

  const isSoldOut = !cruise.available || cruise.capacityLeft === 0;
  const isLowCapacity = !isSoldOut && cruise.capacityLeft <= 4;
  const imageUrl = SHIP_IMAGES[cruise.ship] || DESTINATION_IMAGES[cruise.destination] || DEFAULT_IMAGE;

  return (
    <div style={{ backgroundColor: '#071923', minHeight: '100vh', paddingTop: '80px' }}>
      <title>{`${cruise.ship} — ${cruise.destination} | Odysseus Cruises`}</title>

      {/* Cinematic Hero Banner */}
      <section
        style={{
          position: 'relative',
          height: '520px',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 32px 64px',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageUrl}
          alt={`${cruise.ship} — ${cruise.destination}`}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.38)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, #071923 0%, rgba(7, 25, 35, 0.4) 60%, rgba(7, 25, 35, 0.8) 100%)',
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
          }}
        >
          <Link
            to="/#featured-cruises"
            style={{
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '20px',
            }}
          >
            ← Back to all voyages
          </Link>

          <div
            style={{
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.3em',
              color: '#DCE5E8',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            {cruise.cruiseLine}
          </div>

          <h1
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 700,
              letterSpacing: '0.08em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            {cruise.ship}
          </h1>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', color: '#DCE5E8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              📍 {cruise.destination}
            </span>
            <span style={{ color: '#526f7d' }}>•</span>
            <span style={{ fontSize: '14px', color: '#DCE5E8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              🌙 {cruise.nights} Nights
            </span>
            <span style={{ color: '#526f7d' }}>•</span>
            <span style={{ fontSize: '14px', color: '#FFFFFF', fontWeight: 600 }}>
              From {formatINRCompact(cruise.adultFare)} / adult
            </span>
          </div>
        </div>
      </section>

      {/* Horizontal Voyage Stats Bar */}
      <section
        style={{
          backgroundColor: '#0D2633',
          borderTop: '1px solid rgba(220, 229, 232, 0.1)',
          borderBottom: '1px solid rgba(220, 229, 232, 0.1)',
          padding: '24px 32px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '24px',
            textAlign: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              DURATION
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
              {cruise.nights} NIGHTS
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              REGION
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
              {cruise.destination}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              BASE ADULT FARE
            </div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
              {formatINRCompact(cruise.adultFare)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#526f7d', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              AVAILABILITY
            </div>
            <div style={{ marginTop: '4px' }}>
              {isSoldOut ? (
                <span className="luxury-badge luxury-badge-sold-out">SOLD OUT</span>
              ) : isLowCapacity ? (
                <span className="luxury-badge luxury-badge-low">ONLY {cruise.capacityLeft} SEATS LEFT</span>
              ) : (
                <span className="luxury-badge luxury-badge-available">{cruise.capacityLeft} SEATS AVAILABLE</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>
        {isSoldOut ? (
          <div
            className="luxury-card"
            style={{
              padding: '64px 32px',
              textAlign: 'center',
              backgroundColor: '#0D2633',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚓</div>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '24px',
                fontWeight: 700,
                color: '#f87171',
                letterSpacing: '0.08em',
                marginBottom: '12px',
              }}
            >
              VOYAGE SOLD OUT
            </h2>
            <p style={{ color: '#DCE5E8', fontSize: '14px', marginBottom: '28px', opacity: 0.8 }}>
              All passenger capacity has been claimed for this departure. Explore alternative departures.
            </p>
            <button onClick={() => navigate('/#featured-cruises')} className="btn-luxury-primary">
              Browse Other Voyages
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Form Sections */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* 1. Passenger Selection */}
              <div
                className="luxury-card"
                style={{
                  padding: '32px',
                  backgroundColor: '#0D2633',
                }}
              >
                <PassengerForm ages={ages} onAgesChange={setAges} />
              </div>

              {/* 2. Optional Services */}
              <div
                className="luxury-card"
                style={{
                  padding: '32px',
                  backgroundColor: '#0D2633',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  ENHANCE YOUR JOURNEY
                </h3>
                <p style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8, marginBottom: '20px' }}>
                  Select curated amenities to elevate your time on board and ashore.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <ServiceCard
                    id="service-insurance"
                    icon="🛡️"
                    title="Travel Insurance"
                    description="Comprehensive medical and cancellation coverage"
                    price="₹6,700 / passenger"
                    checked={services.insurance}
                    onChange={(v) => setServices((s) => ({ ...s, insurance: v }))}
                  />
                  <ServiceCard
                    id="service-wifi"
                    icon="📶"
                    title="Satellite Wi-Fi"
                    description="Continuous high-speed sea connectivity"
                    price={`₹1,260 / passenger / night`}
                    checked={services.wifi}
                    onChange={(v) => setServices((s) => ({ ...s, wifi: v }))}
                  />
                  <ServiceCard
                    id="service-shore"
                    icon="🏔️"
                    title="Shore Excursions"
                    description="Private guided port tours & cultural excursions"
                    price="₹10,000 / passenger"
                    checked={services.shoreExcursion}
                    onChange={(v) => setServices((s) => ({ ...s, shoreExcursion: v }))}
                  />
                </div>
              </div>

              {/* 3. Promo Code */}
              <div
                className="luxury-card"
                style={{
                  padding: '32px',
                  backgroundColor: '#0D2633',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  PROMOTIONAL PRIVILEGE
                </h3>
                <p style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8, marginBottom: '20px' }}>
                  Have an exclusive invitation code or seasonal privilege?
                </p>

                <PromoCode
                  cruiseId={cruise._id}
                  ages={ages.filter((a) => a !== '')}
                  services={services}
                  onPromoApplied={setAppliedPromo}
                />
              </div>

              {/* 4. Customer Contact Information */}
              <div
                className="luxury-card"
                style={{
                  padding: '32px',
                  backgroundColor: '#0D2633',
                }}
              >
                <h3
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  LEAD TRAVELER DETAILS
                </h3>
                <p style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8, marginBottom: '24px' }}>
                  Your official voyage confirmation and unique reference will be issued to this email.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: '#526f7d',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      FULL NAME
                    </label>
                    <input
                      id="customer-name"
                      type="text"
                      placeholder="e.g. Captain Alexander Vance"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="luxury-input"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: '#526f7d',
                        textTransform: 'uppercase',
                        marginBottom: '6px',
                      }}
                    >
                      EMAIL ADDRESS
                    </label>
                    <input
                      id="customer-email"
                      type="email"
                      placeholder="e.g. alexander@vance.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="luxury-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Summary & Confirmation */}
            <div style={{ position: 'sticky', top: '100px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <PriceBreakdown quote={quote} loading={quoteLoading} />

              {bookingError && (
                <div
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}
                >
                  ⚠️ {bookingError}
                </div>
              )}

              <button
                id="confirm-booking-btn"
                onClick={handleConfirmBooking}
                disabled={bookingLoading || !quote || !customerName.trim() || !customerEmail.trim()}
                className="btn-luxury-gold"
                style={{ width: '100%', padding: '16px 24px', fontSize: '14px' }}
              >
                {bookingLoading ? '⏳ Securing Voyage...' : '✓ Confirm Voyage Booking'}
              </button>

              <div
                style={{
                  fontSize: '11px',
                  color: '#526f7d',
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                🔒 Guaranteed Locked-In Pricing. Upon confirmation, a permanent booking reference
                will be generated.
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CruiseDetailPage;

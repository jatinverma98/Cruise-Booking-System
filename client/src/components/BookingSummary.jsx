import { formatINR } from '../utils/currency';

const BookingSummary = ({ booking }) => {
  if (!booking) return null;

  const {
    reference,
    customerId: customer,
    cruiseId: cruise,
    passengers,
    services,
    pricing,
    pricingSnapshot,
    createdAt,
  } = booking;

  const fmt = (n) => formatINR(n);

  const bookingDate = new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Reference Banner Card */}
      <div
        className="luxury-card"
        style={{
          padding: '48px 32px',
          textAlign: 'center',
          backgroundColor: '#0D2633',
          border: '1px solid rgba(226, 185, 127, 0.3)',
          background: 'linear-gradient(180deg, rgba(13,38,51,0.9) 0%, rgba(7,25,35,0.95) 100%)',
          borderRadius: '12px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <span
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.35em',
            color: '#e2b97f',
            textTransform: 'uppercase',
            display: 'block',
            marginBottom: '12px',
          }}
        >
          CONFIRMED VOYAGE RESERVATION
        </span>

        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            letterSpacing: '0.12em',
            color: '#FFFFFF',
            marginBottom: '8px',
          }}
        >
          {reference}
        </h2>

        <div style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8 }}>
          Issued on {bookingDate}
        </div>
      </div>

      {/* Voyage & Ship Details */}
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
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#38bdf8',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          VOYAGE SPECIFICATIONS
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              CRUISE LINE
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
              {cruise?.cruiseLine}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              VESSEL
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
              {cruise?.ship}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              DESTINATION
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
              {cruise?.destination}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              DURATION
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#FFFFFF', marginTop: '4px' }}>
              {cruise?.nights} Nights
            </div>
          </div>
        </div>
      </div>

      {/* Passengers */}
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
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#38bdf8',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          PASSENGER MANIFEST
        </h3>

        {customer && (
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'rgba(7, 25, 35, 0.65)',
              borderRadius: '6px',
              marginBottom: '16px',
              border: '1px solid rgba(220, 229, 232, 0.1)',
            }}
          >
            <div style={{ fontSize: '10px', color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              LEAD PASSENGER
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
              {customer.name}
            </div>
            <div style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8, marginTop: '2px' }}>
              {customer.email}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {passengers?.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 18px',
                backgroundColor: 'rgba(7, 25, 35, 0.45)',
                borderRadius: '4px',
                border: '1px solid rgba(220, 229, 232, 0.06)',
              }}
            >
              <div style={{ fontSize: '13px', color: '#FFFFFF' }}>
                Passenger {i + 1} — Age {p.age}
                <span
                  style={{
                    marginLeft: '8px',
                    fontSize: '10px',
                    letterSpacing: '0.1em',
                    color: p.fareType === 'free' ? '#4ade80' : p.fareType === 'child' ? '#38bdf8' : '#e2b97f',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                >
                  [{p.fareType}]
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                {p.fareType === 'free' ? 'Free' : fmt(p.fareAmount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Services */}
      {(services?.insurance || services?.wifi || services?.shoreExcursion) && (
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
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.14em',
              color: '#38bdf8',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            SELECTED AMENITIES
          </h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {services.insurance && (
              <span className="luxury-badge luxury-badge-available">🛡️ Travel Insurance Included</span>
            )}
            {services.wifi && (
              <span className="luxury-badge luxury-badge-available">📶 Satellite Wi-Fi Package</span>
            )}
            {services.shoreExcursion && (
              <span className="luxury-badge luxury-badge-available">🏔️ Guided Shore Excursion</span>
            )}
          </div>
        </div>
      )}

      {/* Price Summary */}
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
            fontSize: '14px',
            fontWeight: 700,
            letterSpacing: '0.14em',
            color: '#38bdf8',
            textTransform: 'uppercase',
            marginBottom: '20px',
          }}
        >
          FINAL CHARGED BREAKDOWN
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
            <span style={{ color: '#DCE5E8' }}>Cruise Fare Subtotal</span>
            <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{fmt(pricing.cruiseFare)}</span>
          </div>

          {pricing.groupDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#4ade80' }}>Group Privilege Discount</span>
              <span style={{ fontWeight: 600, color: '#4ade80' }}>-{fmt(pricing.groupDiscount)}</span>
            </div>
          )}

          {pricing.services?.insurance > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#DCE5E8' }}>Travel Insurance</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{fmt(pricing.services.insurance)}</span>
            </div>
          )}

          {pricing.services?.wifi > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#DCE5E8' }}>Satellite Wi-Fi</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{fmt(pricing.services.wifi)}</span>
            </div>
          )}

          {pricing.services?.shoreExcursion > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#DCE5E8' }}>Shore Excursion</span>
              <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{fmt(pricing.services.shoreExcursion)}</span>
            </div>
          )}

          {pricing.promotionalDiscount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: '#4ade80' }}>Promo Discount ({booking.promoCodeUsed})</span>
              <span style={{ fontWeight: 600, color: '#4ade80' }}>-{fmt(pricing.promotionalDiscount)}</span>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '13px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(220, 229, 232, 0.08)',
            }}
          >
            <span style={{ color: '#526f7d' }}>Tax (12% GST)</span>
            <span style={{ fontWeight: 600, color: '#DCE5E8' }}>{fmt(pricing.tax)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              paddingTop: '16px',
              borderTop: '1px solid rgba(220, 229, 232, 0.15)',
              marginTop: '8px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#526f7d', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              TOTAL PAID
            </span>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '28px',
                fontWeight: 800,
                color: '#FFFFFF',
              }}
            >
              {fmt(pricing.total)}
            </span>
          </div>
        </div>

        {/* Snapshot Note */}
        <div
          style={{
            marginTop: '20px',
            fontSize: '11px',
            color: '#526f7d',
            lineHeight: 1.5,
            borderTop: '1px solid rgba(220, 229, 232, 0.06)',
            paddingTop: '12px',
          }}
        >
          🔒 Historical Snapshot Locked. Rates and rules from booking date are permanently preserved.
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;

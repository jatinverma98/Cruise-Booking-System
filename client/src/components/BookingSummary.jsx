import { formatINR } from '../utils/currency';
const fmt = (n) => formatINR(n);

const BookingSummary = ({ booking }) => {
  if (!booking) return null;

  const { reference, customerId: customer, cruiseId: cruise, passengers, services, pricing, pricingSnapshot, createdAt } = booking;

  const bookingDate = new Date(createdAt).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Reference Banner */}
      <div
        className="glass-card"
        style={{
          padding: '32px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(8,145,178,0.15), rgba(3,105,161,0.1))',
          border: '1px solid rgba(8,145,178,0.3)',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎉</div>
        <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '8px' }}>
          BOOKING CONFIRMED
        </div>
        <div style={{ fontSize: '32px', fontWeight: 900, color: '#f1f5f9', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {reference}
        </div>
        <div style={{ fontSize: '13px', color: '#64748b' }}>Booked on {bookingDate}</div>
      </div>

      {/* Cruise Info */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', marginBottom: '16px' }}>
          CRUISE DETAILS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Cruise Line', value: cruise?.cruiseLine },
            { label: 'Ship', value: cruise?.ship },
            { label: 'Destination', value: cruise?.destination },
            { label: 'Duration', value: `${cruise?.nights} nights` },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>{label}</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Info */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', marginBottom: '16px' }}>
          PASSENGER DETAILS
        </h3>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600, marginBottom: '4px' }}>Lead Passenger</div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9' }}>{customer?.name}</div>
          <div style={{ fontSize: '13px', color: '#64748b' }}>{customer?.email}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {passengers?.map((p, i) => (
            <div
              key={i}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div style={{ fontSize: '14px', color: '#cbd5e1' }}>
                Passenger {i + 1} — Age {p.age}
                <span style={{
                  marginLeft: '8px', fontSize: '11px', fontWeight: 600,
                  color: p.fareType === 'free' ? '#4ade80' : p.fareType === 'child' ? '#06b6d4' : '#94a3b8',
                  textTransform: 'uppercase',
                }}>
                  {p.fareType}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>
                {p.fareType === 'free' ? 'Free' : fmt(p.fareAmount)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      {(services?.insurance || services?.wifi || services?.shoreExcursion) && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', marginBottom: '16px' }}>
            OPTIONAL SERVICES
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {services.insurance && <span className="badge badge-teal">🛡️ Travel Insurance</span>}
            {services.wifi && <span className="badge badge-teal">📶 Wi-Fi</span>}
            {services.shoreExcursion && <span className="badge badge-teal">🏔️ Shore Excursion</span>}
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#64748b', letterSpacing: '0.06em', marginBottom: '16px' }}>
          PRICE SUMMARY
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Cruise Fare Subtotal', value: fmt(pricing.cruiseFare) },
            pricing.groupDiscount > 0 && { label: 'Group Discount', value: `-${fmt(pricing.groupDiscount)}`, color: '#4ade80' },
            pricing.services?.insurance > 0 && { label: 'Travel Insurance', value: fmt(pricing.services.insurance) },
            pricing.services?.wifi > 0 && { label: 'Wi-Fi Package', value: fmt(pricing.services.wifi) },
            pricing.services?.shoreExcursion > 0 && { label: 'Shore Excursion', value: fmt(pricing.services.shoreExcursion) },
            pricing.promotionalDiscount > 0 && {
              label: `Promo (${booking.promoCodeUsed})`,
              value: `-${fmt(pricing.promotionalDiscount)}`,
              color: '#4ade80',
            },
            { label: 'Tax (12%)', value: fmt(pricing.tax) },
          ].filter(Boolean).map(({ label, value, color }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#94a3b8' }}>{label}</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: color || '#f1f5f9' }}>{value}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(3,105,161,0.15))',
          borderRadius: '12px',
          border: '1px solid rgba(8,145,178,0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>TOTAL PAID</div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#06b6d4' }}>{fmt(pricing.total)}</div>
        </div>

        {/* Snapshot note */}
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
          ℹ️ Prices are locked at booking time. This booking will always show the original fare of{' '}
          <strong style={{ color: '#64748b' }}>₹{(pricingSnapshot?.adultFare || 0).toLocaleString('en-IN')}/adult</strong> regardless of future changes.
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;

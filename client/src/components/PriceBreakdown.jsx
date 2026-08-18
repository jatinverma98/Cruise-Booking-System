import { formatINR } from '../utils/currency';
const fmt = (n) => formatINR(n);

const PriceBreakdown = ({ quote, loading }) => {
  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '24px' }}>
        <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '20px' }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div className="skeleton" style={{ height: '14px', width: '40%' }} />
            <div className="skeleton" style={{ height: '14px', width: '20%' }} />
          </div>
        ))}
        <div className="skeleton" style={{ height: '40px', marginTop: '16px', borderRadius: '10px' }} />
      </div>
    );
  }

  if (!quote) return null;

  const { pricing, passengers, services } = quote;
  const passengerCount = passengers?.length || 0;
  const groupDiscountPct = passengerCount >= 5 ? 10 : passengerCount >= 3 ? 5 : 0;

  const Row = ({ label, value, sub, color, bold }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '7px 0' }}>
      <div>
        <span style={{ fontSize: bold ? '15px' : '13.5px', color: color || '#94a3b8', fontWeight: bold ? 600 : 400 }}>
          {label}
        </span>
        {sub && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{sub}</div>}
      </div>
      <span style={{ fontSize: bold ? '15px' : '13.5px', fontWeight: bold ? 700 : 500, color: color || '#f1f5f9' }}>
        {value}
      </span>
    </div>
  );

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f1f5f9', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        💰 Price Breakdown
      </h3>

      {/* Per-passenger breakdown */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
          PASSENGER FARES
        </div>
        {passengers && passengers.map((p, i) => (
          <Row
            key={i}
            label={`Passenger ${i + 1} (Age ${p.age})`}
            sub={p.fareType === 'free' ? 'Infant (0%)' : p.fareType === 'child' ? (p.age <= 11 ? 'Child 50% fare' : 'Youth 75% fare') : 'Adult 100% fare'}
            value={p.fareType === 'free' ? 'Free' : fmt(p.fareAmount)}
            color={p.fareType === 'free' ? '#4ade80' : undefined}
          />
        ))}
      </div>

      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '10px 0' }} />

      {/* Cruise Fare Subtotal */}
      <Row label="Cruise Fare Subtotal" value={fmt(pricing.cruiseFare)} bold />

      {/* Group Discount (Cruise fare only) */}
      {pricing.groupDiscount > 0 && (
        <Row
          label={`Group Discount (${groupDiscountPct}%)`}
          sub="Applied only to cruise fare"
          value={`-${fmt(pricing.groupDiscount)}`}
          color="#4ade80"
        />
      )}

      {/* Optional Services Itemized Breakdown */}
      {pricing.servicesTotal > 0 && (
        <>
          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '10px 0' }} />
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '6px' }}>
            OPTIONAL SERVICES
          </div>
          {services?.insurance && (
            <Row
              label="Travel Insurance"
              sub={`₹6,700 × ${passengerCount} passenger${passengerCount !== 1 ? 's' : ''}`}
              value={fmt(pricing.services?.insurance ?? (6700 * passengerCount))}
            />
          )}
          {services?.wifi && (
            <Row
              label="Wi-Fi Package"
              sub={`₹1,260 × ${passengerCount} passenger${passengerCount !== 1 ? 's' : ''} × ${quote.cruise?.nights || 7} nights`}
              value={fmt(pricing.services?.wifi)}
            />
          )}
          {services?.shoreExcursion && (
            <Row
              label="Shore Excursion"
              sub={`₹10,000 × ${passengerCount} passenger${passengerCount !== 1 ? 's' : ''}`}
              value={fmt(pricing.services?.shoreExcursion ?? (10000 * passengerCount))}
            />
          )}
        </>
      )}

      {/* Promotional Discount */}
      {pricing.promotionalDiscount > 0 && (
        <>
          <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '10px 0' }} />
          <Row
            label="Promotional Discount"
            value={`-${fmt(pricing.promotionalDiscount)}`}
            color="#4ade80"
            bold
          />
        </>
      )}

      <div style={{ borderTop: '1px dashed rgba(255,255,255,0.08)', margin: '10px 0' }} />

      <Row label="Taxable Subtotal" value={fmt(pricing.subtotal)} />
      <Row label="Tax (12% GST)" value={fmt(pricing.tax)} />

      {/* Final Total */}
      <div style={{
        marginTop: '16px',
        padding: '16px',
        background: 'linear-gradient(135deg, rgba(8,145,178,0.2), rgba(3,105,161,0.2))',
        borderRadius: '12px',
        border: '1px solid rgba(8,145,178,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>FINAL TOTAL</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>All taxes & fees included</div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: 900, color: '#06b6d4' }}>
          {fmt(pricing.total)}
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;

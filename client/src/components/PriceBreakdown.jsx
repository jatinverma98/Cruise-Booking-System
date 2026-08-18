import { formatINR } from '../utils/currency';

const PriceBreakdown = ({ quote, loading }) => {
  if (loading) {
    return (
      <div
        className="luxury-card"
        style={{
          padding: '32px 24px',
          backgroundColor: '#0D2633',
          border: '1px solid rgba(220, 229, 232, 0.12)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#DCE5E8',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌊</div>
        <div style={{ fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Calculating Authoritative Rates...
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div
        className="luxury-card"
        style={{
          padding: '32px 24px',
          backgroundColor: '#0D2633',
          border: '1px solid rgba(220, 229, 232, 0.12)',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#526f7d',
        }}
      >
        <div style={{ fontSize: '12px', letterSpacing: '0.08em' }}>
          Select passengers to view price breakdown.
        </div>
      </div>
    );
  }

  const { pricing } = quote;
  const fmt = (n) => formatINR(n);

  return (
    <div
      className="luxury-card"
      style={{
        padding: '32px 24px',
        backgroundColor: '#0D2633',
        border: '1px solid rgba(220, 229, 232, 0.15)',
        borderRadius: '8px',
      }}
    >
      <h3
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '14px',
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: '#FFFFFF',
          textTransform: 'uppercase',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(220, 229, 232, 0.1)',
        }}
      >
        YOUR JOURNEY SUMMARY
      </h3>

      {/* Breakdown Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
          <span style={{ color: '#DCE5E8' }}>Cruise Fare</span>
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
            <span style={{ color: '#4ade80' }}>Promotional Discount</span>
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
      </div>

      {/* Grand Total */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(220, 229, 232, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#526f7d', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            TOTAL FARE
          </div>
          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
            All taxes & port fees included
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '28px',
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          {fmt(pricing.total)}
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;

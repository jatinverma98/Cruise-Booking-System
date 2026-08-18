const ServiceCard = ({ id, icon, title, description, price, checked, onChange }) => {
  return (
    <div
      id={id}
      onClick={() => onChange(!checked)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        backgroundColor: checked ? 'rgba(13, 38, 51, 0.95)' : 'rgba(7, 25, 35, 0.65)',
        border: checked ? '1px solid #38bdf8' : '1px solid rgba(220, 229, 232, 0.12)',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 300ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: checked ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '6px',
            backgroundColor: checked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(220, 229, 232, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            border: checked ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(220, 229, 232, 0.1)',
          }}
        >
          {icon}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '14px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: '13px', color: '#DCE5E8', opacity: 0.8 }}>
            {description}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>
            {price}
          </div>
        </div>
        <div
          style={{
            width: '22px',
            height: '22px',
            borderRadius: '4px',
            border: checked ? '1px solid #38bdf8' : '1px solid rgba(220, 229, 232, 0.3)',
            backgroundColor: checked ? '#38bdf8' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#071923',
            fontSize: '12px',
            fontWeight: 800,
            transition: 'all 200ms',
          }}
        >
          {checked ? '✓' : ''}
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;

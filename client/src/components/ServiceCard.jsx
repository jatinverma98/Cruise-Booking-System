const ServiceCard = ({ id, icon, title, description, price, checked, onChange }) => (
  <label
    htmlFor={id}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      padding: '14px 16px',
      background: checked ? 'rgba(8,145,178,0.1)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${checked ? 'rgba(8,145,178,0.4)' : 'rgba(255,255,255,0.07)'}`,
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      style={{ display: 'none' }}
    />

    {/* Custom checkbox */}
    <div
      style={{
        width: '22px', height: '22px',
        borderRadius: '6px',
        border: `2px solid ${checked ? '#0891b2' : 'rgba(255,255,255,0.2)'}`,
        background: checked ? '#0891b2' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'all 0.2s',
      }}
    >
      {checked && <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>✓</span>}
    </div>

    {/* Icon */}
    <div style={{ fontSize: '28px', flexShrink: 0 }}>{icon}</div>

    {/* Text */}
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '15px', fontWeight: 600, color: '#f1f5f9', marginBottom: '2px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>{description}</div>
    </div>

    {/* Price */}
    <div style={{ textAlign: 'right', flexShrink: 0 }}>
      <div style={{ fontSize: '15px', fontWeight: 700, color: checked ? '#06b6d4' : '#94a3b8' }}>
        {price}
      </div>
    </div>
  </label>
);

export default ServiceCard;

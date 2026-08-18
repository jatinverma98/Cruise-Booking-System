const PILLARS = [
  {
    icon: '⚓',
    title: 'Guaranteed Locked-In Rates',
    desc: 'Historical pricing snapshots guarantee your fare never fluctuates after booking confirmation.',
  },
  {
    icon: '🧭',
    title: 'Curated Flagship Fleet',
    desc: 'Selectively partnered with the world’s premier cruise lines and modern vessels.',
  },
  {
    icon: '👨‍👩‍👧‍👦',
    title: 'Family & Group Privileges',
    desc: 'Automatic tier discounts up to 10% and tailored child fare rates from 0–17 years.',
  },
  {
    icon: '🛡️',
    title: 'Comprehensive Protection',
    desc: 'Optional voyage insurance, continuous satellite Wi-Fi, and guided shore excursions.',
  },
];

const WhyChooseSection = () => {
  return (
    <section
      id="about"
      style={{
        padding: '120px 24px',
        backgroundColor: '#0D2633',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
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
            THE ODYSSEUS PROMISE
          </span>
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(2rem, 3.8vw, 3rem)',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#FFFFFF',
              textTransform: 'uppercase',
            }}
          >
            WHY VOYAGE WITH US
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '32px',
          }}
        >
          {PILLARS.map((p) => (
            <div
              key={p.title}
              style={{
                padding: '32px 24px',
                background: 'rgba(7, 25, 35, 0.6)',
                border: '1px solid rgba(220, 229, 232, 0.1)',
                borderRadius: '8px',
                textAlign: 'center',
                transition: 'border-color 300ms',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>{p.icon}</div>
              <h3
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                }}
              >
                {p.title}
              </h3>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  color: '#DCE5E8',
                  opacity: 0.85,
                }}
              >
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;

import { useState } from 'react';
import CruiseCard from './CruiseCard';

const DESTINATIONS = ['All', 'Caribbean', 'Mediterranean', 'Alaska', 'Northern Europe', 'Bahamas'];

const FeaturedVoyages = ({ cruises, loading, error }) => {
  const [selectedDest, setSelectedDest] = useState('All');

  const filteredCruises = cruises.filter((c) => {
    if (selectedDest === 'All') return true;
    return c.destination === selectedDest;
  });

  const featuredCruise = filteredCruises.length > 0 ? filteredCruises[0] : null;
  const secondaryCruises = filteredCruises.slice(1);

  return (
    <section
      id="featured-cruises"
      style={{
        padding: '100px 24px',
        backgroundColor: '#071923',
        maxWidth: '1280px',
        margin: '0 auto',
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
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
          CURATED ITINERARIES
        </span>
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          FEATURED VOYAGES
        </h2>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.2rem',
            color: '#DCE5E8',
            maxWidth: '540px',
            margin: '0 auto',
            opacity: 0.85,
          }}
        >
          Every voyage is carefully orchestrated to offer immersive destinations,
          exceptional accommodations, and locked-in transparent rates.
        </p>

        {/* Destination Filter Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginTop: '36px',
          }}
        >
          {DESTINATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDest(d)}
              style={{
                background: selectedDest === d ? 'rgba(220, 229, 232, 0.15)' : 'transparent',
                border: selectedDest === d ? '1px solid #FFFFFF' : '1px solid rgba(220, 229, 232, 0.15)',
                color: selectedDest === d ? '#FFFFFF' : '#526f7d',
                padding: '8px 18px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 200ms ease',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#DCE5E8' }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🌊</div>
          <div style={{ letterSpacing: '0.1em', fontSize: '13px', textTransform: 'uppercase' }}>
            Loading Curated Itineraries...
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
            color: '#f87171',
            textAlign: 'center',
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && filteredCruises.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#526f7d' }}>
          No cruises found matching the selected destination.
        </div>
      )}

      {!loading && !error && filteredCruises.length > 0 && (
        <div>
          {/* Asymmetric Flagship Card (Top) */}
          {featuredCruise && <CruiseCard cruise={featuredCruise} isFeatured={true} />}

          {/* Secondary Editorial Grid */}
          {secondaryCruises.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
              }}
            >
              {secondaryCruises.map((cruise) => (
                <CruiseCard key={cruise._id} cruise={cruise} isFeatured={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FeaturedVoyages;

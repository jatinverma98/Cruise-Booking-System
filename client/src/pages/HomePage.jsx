import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import FilterBar from '../components/FilterBar';
import CruiseGrid from '../components/CruiseGrid';
import ErrorMessage from '../components/ErrorMessage';
import { fetchCruises } from '../services/api';

const HomePage = () => {
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const loadCruises = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCruises(params);
      setCruises(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cruises. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCruises(filters);
  }, []);

  const handleFilter = (newFilters) => {
    const cleaned = Object.fromEntries(Object.entries(newFilters).filter(([, v]) => v !== undefined && v !== ''));
    setFilters(cleaned);
    loadCruises(cleaned);
  };

  return (
    <>
      {/* SEO */}
      <title>Odysseus Cruises — Browse & Book World-Class Cruises</title>

      <Hero />

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 className="section-heading">Available Cruises</h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
              {!loading && `${cruises.length} cruise${cruises.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
        </div>

        <FilterBar onFilter={handleFilter} />

        {error ? (
          <ErrorMessage message={error} onRetry={() => loadCruises(filters)} />
        ) : (
          <CruiseGrid cruises={cruises} loading={loading} />
        )}
      </main>
    </>
  );
};

export default HomePage;

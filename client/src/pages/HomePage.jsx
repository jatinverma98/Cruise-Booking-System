import { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import Introduction from '../components/Introduction';
import FeaturedVoyages from '../components/FeaturedVoyages';
import DestinationsSection from '../components/DestinationsSection';
import ExperienceSection from '../components/ExperienceSection';
import WhyChooseSection from '../components/WhyChooseSection';
import BookingCTA from '../components/BookingCTA';
import Footer from '../components/Footer';
import { fetchCruises } from '../services/api';

const HomePage = () => {
  const [cruises, setCruises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCruises = async () => {
      setLoading(true);
      try {
        const data = await fetchCruises();
        setCruises(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load cruises. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadCruises();
  }, []);

  return (
    <main style={{ backgroundColor: '#071923', minHeight: '100vh' }}>
      <title>ODYSSEUS — Voyages Beyond the Ordinary</title>

      {/* 1. Cinematic Hero */}
      <Hero />

      {/* 2. Editorial Philosophy & Overview */}
      <Introduction />

      {/* 3. Featured Voyages with Flagship Layout & Filters */}
      <FeaturedVoyages cruises={cruises} loading={loading} error={error} />

      {/* 4. Full-Width Destination Cards */}
      <DestinationsSection />

      {/* 5. The Odysseus Experience Pillars */}
      <ExperienceSection />

      {/* 6. Why Voyage with Odysseus */}
      <WhyChooseSection />

      {/* 7. Call To Action Banner */}
      <BookingCTA />

      {/* 8. Dark Luxury Footer */}
      <Footer />
    </main>
  );
};

export default HomePage;

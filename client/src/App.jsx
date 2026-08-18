import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToAnchor from './components/ScrollToAnchor';
import HomePage from './pages/HomePage';
import CruiseDetailPage from './pages/CruiseDetailPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';

const App = () => (
  <BrowserRouter>
    <ScrollToAnchor />
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/cruises/:id" element={<CruiseDetailPage />} />
      <Route path="/booking/:reference" element={<BookingConfirmationPage />} />
      <Route path="/booking" element={<BookingConfirmationPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;

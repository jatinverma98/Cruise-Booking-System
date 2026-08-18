import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

// ── Cruise APIs ──────────────────────────────────────────────────────────────

export const fetchCruises = (params = {}) =>
  api.get('/cruises', { params }).then((r) => r.data.data);

export const fetchCruiseById = (id) =>
  api.get(`/cruises/${id}`).then((r) => r.data.data);

// ── Pricing API ──────────────────────────────────────────────────────────────

export const getQuote = (payload) =>
  api.post('/pricing/quote', payload).then((r) => r.data.data);

// ── Promo API ────────────────────────────────────────────────────────────────

export const validatePromo = (payload) =>
  api.post('/promos/validate', payload).then((r) => r.data.data || r.data);

export const validatePromoCode = validatePromo;

// ── Booking APIs ─────────────────────────────────────────────────────────────

export const createBooking = (payload) =>
  api.post('/bookings', payload).then((r) => r.data.data || r.data);

export const fetchBookingByReference = (reference) =>
  api.get(`/bookings/${reference}`).then((r) => r.data.data);

// ── Services API ─────────────────────────────────────────────────────────────

export const fetchServices = () =>
  api.get('/services').then((r) => r.data.data);

export default api;

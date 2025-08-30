import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Auth
export async function authSignIn({ phone, password, role }) {
  const payload = { phone, password };
  if (role) payload.role = role;
  const { data } = await api.post('/auth/signin', payload);
  return data; // { token, user }
}

export async function authSignUp({ phone, name, email, password, role, adminSecret }) {
  const payload = { phone, name, email, password };
  if (role) payload.role = role;
  if (adminSecret) payload.adminSecret = adminSecret;
  const { data } = await api.post('/auth/signup', payload);
  return data; // { token, user }
}

// Workshops
export const fetchWorkshopsByDistance = async ({ lat, lng, radiusKm, service }) => {
  const params = { lat, lng, radiusKm, service };
  const { data } = await api.get('/workshops', { params });
  return data.data;
};

export const fetchWorkshops = async () => {
  const { data } = await api.get('/workshops');
  return data.data;
};

export const getWorkshopById = async (id) => {
  const { data } = await api.get(`/workshops/${id}`);
  return data.data;
};

// Service Requests
export async function getRequests({ userId, workshopId, status } = {}) {
  const params = {};
  if (userId) params.userId = userId;
  if (workshopId) params.workshopId = workshopId;
  if (status && status !== 'all') params.status = status;
  const { data } = await api.get('/requests', { params });
  return data.data;
}

export async function getRequestById(id) {
  const { data } = await api.get(`/requests/${id}`);
  return data.data;
}

export async function createRequest(body) {
  const { data } = await api.post('/requests', body);
  return data.data;
}

// Admin
export async function getAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data.data;
}

export default api;

// Worker APIs
export async function getMyWorkshop() {
  const { data } = await api.get('/workers/me/workshop');
  return data.data; // may be null if no assignment
}

export async function updateRequestStatus(id, status) {
  const { data } = await api.patch(`/requests/${id}/status`, { status });
  return data.data; // updated request
}

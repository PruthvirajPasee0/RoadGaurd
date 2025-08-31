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

export const getWorkshopReviews = async (id) => {
  const { data } = await api.get(`/workshops/${id}/reviews`);
  return data.data;
};

// Service Requests
export async function getRequests({ userId, workshopId, status, assignedWorkerId } = {}) {
  const params = {};
  if (userId) params.userId = userId;
  if (workshopId) params.workshopId = workshopId;
  if (assignedWorkerId) params.assignedWorkerId = assignedWorkerId;
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

// --- Admin: Users ---
export async function adminGetUsers() {
  const { data } = await api.get('/admin/users');
  return data.data;
}

export async function adminUpdateUser(id, payload) {
  const { data } = await api.patch(`/admin/users/${id}`, payload);
  return data.data;
}

export async function adminDeleteUser(id) {
  const { data } = await api.delete(`/admin/users/${id}`);
  return data;
}

// --- Admin: Workshops ---
export async function adminCreateWorkshop(payload) {
  const { data } = await api.post('/admin/workshops', payload);
  return data.data;
}

export async function adminUpdateWorkshop(id, payload) {
  const { data } = await api.patch(`/admin/workshops/${id}`, payload);
  return data.data;
}

export async function adminDeleteWorkshop(id) {
  const { data } = await api.delete(`/admin/workshops/${id}`);
  return data;
}

export async function adminAssignWorkerToWorkshop(workshopId, { userId, isPrimary }) {
  const { data } = await api.post(`/admin/workshops/${workshopId}/assign-worker`, { userId, isPrimary });
  return data;
}

export async function adminGetWorkshopWorkers(workshopId) {
  const { data } = await api.get(`/admin/workshops/${workshopId}/workers`);
  return data.data; // [{ id, name, phone, email, isPrimary }]
}

// --- Admin: Requests ---
export async function adminApproveRequest(id) {
  const { data } = await api.patch(`/admin/requests/${id}/approve`);
  return data.data;
}

export async function adminAssignRequest(id, { workshopId, workerId }) {
  const { data } = await api.post(`/admin/requests/${id}/assign`, { workshopId, workerId });
  return data.data;
}

// --- Reviews ---
export async function submitReview(workshopId, { requestId, rating, comment }) {
  const payload = { requestId, rating, comment };
  const { data } = await api.post(`/workshops/${workshopId}/reviews`, payload);
  return data.data;
}

// --- Invoice PDF ---
export async function downloadInvoice(requestId) {
  const res = await api.get(`/requests/${requestId}/invoice.pdf`, { responseType: 'blob' });
  return res.data; // Blob
}

// --- Notifications ---
export async function getNotifications({ status = 'all', userId } = {}) {
  const params = {};
  if (status) params.status = status;
  if (userId) params.userId = userId; // only respected for admin on backend
  const { data } = await api.get('/notifications', { params });
  return data.data; // [{ id, userId, title, body, is_read, read_at, created_at }]
}

export async function createNotification({ title, body, userId } = {}) {
  const payload = { title, body };
  if (userId) payload.userId = userId; // admin can target any user
  const { data } = await api.post('/notifications', payload);
  return data.data;
}

export async function markNotificationRead(id) {
  const { data } = await api.post(`/notifications/${id}/read`);
  return data.data;
}

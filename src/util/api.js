import axios from 'axios';
import {API_BASE_URL , AGENT_BASE_URL}  from '../services/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});



export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

// ── Category API ──
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

export const createCategory = async (data) => {
  const response = await api.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

// ── Jury API ──
export const getJuries = async () => {
  const response = await api.get('/juries');
  return response.data;
};

export const createJury = async (data) => {
  const response = await api.post('/juries', data);
  return response.data;
};

export const updateJury = async (id, data) => {
  const response = await api.put(`/juries/${id}`, data);
  return response.data;
};

export const assignJuryCategory = async (id, category) => {
  const response = await api.patch(`/juries/${id}/assign-category`, { category });
  return response.data;
};

export const deleteJury = async (id) => {
  const response = await api.delete(`/juries/${id}`);
  return response.data;
};

export { API_BASE_URL, AGENT_BASE_URL };
export default api;

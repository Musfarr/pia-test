import axios from 'axios';
import { API_BASE_URL } from '../services/constants';

// Separate axios instance for public voting — completely isolated from admin/jury api.
// Uses voterToken localStorage key so admin and public sessions never collide.
const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

publicApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('voterToken');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('voterToken');
      localStorage.removeItem('voter');
      if (window.location.pathname.startsWith('/vote') && !window.location.pathname.includes('/vote/login') && !window.location.pathname.includes('/vote/register')) {
        window.location.href = '/vote/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──
export const requestOtp = async (data) => {
  const res = await publicApi.post('/public/request-otp', data);
  return res.data;
};

export const voterVerifyOtp = async (data) => {
  const res = await publicApi.post('/public/verify-otp', data);
  return res.data;
};

// ── Categories ──
export const getPublicCategories = async () => {
  const res = await publicApi.get('/public/categories');
  return res.data;
};

// ── Category Shortlist ──
export const getPublicShortlist = async (categoryId) => {
  const res = await publicApi.get(`/public/categories/${categoryId}/shortlist`);
  return res.data;
};

// ── Cast Vote ──
export const castVote = async (data) => {
  const res = await publicApi.post('/public/vote', data);
  return res.data;
};

// ── My Votes ──
export const getMyVotes = async () => {
  const res = await publicApi.get('/public/my-votes');
  return res.data;
};

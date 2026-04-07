import axios from 'axios';
import {API_BASE_URL , AGENT_BASE_URL}  from '../services/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});



export const login = async (email, password) => {
  const response = await api.post('auth/login', { email, password });
  return response.data;
};


// Dashboard Analytics
export const getDashboardAnalytics = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  params.company_name = "Telenor"
  const response = await api.get('dashboard/analytics/stats', { params });
  return response.data;
};

// Call Volume
export const getCallVolume = async (days = 15) => {

  const params = { days, company_name: 'Telenor' };
  const response = await api.get('dashboard/analytics/call-volume', { params });
  return response.data;
};

// Hourly Analytics
export const getHourlyAnalytics = async () => {
  const response = await api.get('dashboard/analytics/hourly', { params: { company_name: 'Telenor' } });
  return response.data;
};

// Filters
export const getFilters = async ({ company_name = 'Telenor' } = {}) => {
  const response = await api.get('dashboard/filters', { params: { company_name } });
  return response.data;
};

// Lead Data Table
export const getLeads = async ({ status, industry_type, organization, limit = 10000, skip = 0 } = {}) => {
  const params = { limit, skip };
  if (status) params.status = status;
  if (industry_type) params.industry_type = industry_type;
  if (organization) params.organization = organization;
  const response = await api.get('dashboard/leads', { params });
  return response.data;
};

// Issues Data Table
export const getIssues = async ({ status, industry_type, organization, limit = 10000, skip = 0 } = {}) => {
  const params = { limit, skip };
  if (status) params.status = status;
  if (industry_type) params.industry_type = industry_type;
  if (organization) params.organization = organization;
  const response = await api.get('dashboard/issues', { params });
  return response.data;
};

// User Queries
export const getUserQueries = async ({ status, city_name, limit = 10000, skip = 0 } = {}) => {
  const params = {
    limit,
    skip,
  };
  if (status) params.status = status;
  if (city_name) params.city_name = city_name;

  const response = await api.get('dashboard/queries', { params });
  return response.data;
};


export const getCallerOpinions = async () => {
  const response = await api.get('dashboard/caller-opinions');
  return response.data;
};

export const getSentimentDaywise = async () => {
  const response = await api.get('dashboard/sentiment-daywise');
  return response.data;
};

export const getTopKeywords = async () => {
  const response = await api.get('dashboard/keywords');
  return response.data;
};



// LiveKit Session
export const createSession = async () => {
  const response = await api.post(`${AGENT_BASE_URL}sessions/create`);
  return response.data;
};

export { API_BASE_URL, AGENT_BASE_URL };
export default api;

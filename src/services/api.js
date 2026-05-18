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


// Dashboard Analytics (old - commented out)
// export const getDashboardAnalytics = async (startDate, endDate) => {
//   const params = {};
//   if (startDate) params.start_date = startDate;
//   if (endDate) params.end_date = endDate;
//   params.company_name = "Telenor";
//   const response = await api.get('dashboard/analytics/stats', { params });
//   return response.data;
// };

// Dashboard Stats (New Dashboard Design)
export const getDashboardStats = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/stats', { params });
  return response.data;
};

// Resolution Rate (New Dashboard Design)
export const getResolutionRate = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/resolution-rate', { params });
  return response.data;
};

// Top Intents (New Dashboard Design)
export const getTopIntents = async (startDate, endDate, limit = 8) => {
  const params = { limit };
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/top-intents', { params });
  return response.data;
};

// Sentiment Analytics (New Dashboard Design)
export const getSentimentAnalytics = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/sentiment-analytics', { params });
  return response.data;
};

// AI Performance (New Dashboard Design)
export const getAIPerformance = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/ai-performance', { params });
  return response.data;
};

// Channel Distribution (New Dashboard Design)
export const getChannelDistribution = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/channel-distribution', { params });
  return response.data;
};

// Conversations Trend (New Dashboard Design)
export const getConversationsTrend = async (startDate, endDate) => {
  const params = {};
  if (startDate) params.start_date = startDate;
  if (endDate) params.end_date = endDate;
  const response = await api.get('v2/dashboard/conversations-trend', { params });
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

// Conversations (New Dashboard Design)
export const getConversations = async ({ start_date, end_date, channel = '', search = '', page = 1, limit = 10 } = {}) => {
  const params = { page, limit };
  if (start_date) params.start_date = start_date;
  if (end_date) params.end_date = end_date;
  if (channel) params.channel = channel;
  if (search) params.search = search;
  const response = await api.get('v2/dashboard/conversations', { params });
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

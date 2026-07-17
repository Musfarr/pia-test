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

// ── Media Upload (Convex media server) ──
const MEDIA_BASE_URL = 'https://mediaupload.convexinteractive.com';
const UPLOAD_API_URL = `${MEDIA_BASE_URL}/api/upload`;

/**
 * Uploads a file (Blob/File) to the Convex media server.
 * Returns { url, fileName } where url is the full publicly-accessible URL.
 */
export async function uploadFile(file, fileName) {
  const formData = new FormData();
  formData.append('file', file, fileName || file.name || 'upload.png');

  const response = await axios.post(UPLOAD_API_URL, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (response.status === 200 && response.data?.url) {
    return {
      url: MEDIA_BASE_URL + response.data.url,
      fileName: response.data.name || fileName,
    };
  }
  throw new Error('File upload failed');
}



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

export const updateCategoryStage = async (id, stage) => {
  const response = await api.patch(`/categories/${id}/stage`, { stage });
  return response.data;
};

// ── Settings / Global Stage API ──
export const getSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};

export const updateGlobalStage = async (currentStage) => {
  const response = await api.patch('/settings/stage', { currentStage });
  return response.data;
};

// ── Category Admin users ──
export const getCategoryAdmins = async () => {
  const response = await api.get('/category-admins');
  return response.data;
};

export const createCategoryAdmin = async (data) => {
  const response = await api.post('/category-admins', data);
  return response.data;
};

export const deleteCategoryAdmin = async (id) => {
  const response = await api.delete(`/category-admins/${id}`);
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

// ── Nominee API ──
export const getNominees = async () => {
  const response = await api.get('/nominees');
  return response.data;
};

export const getNominee = async (id) => {
  const response = await api.get(`/nominees/${id}`);
  return response.data;
};

export const createNominee = async (data) => {
  const response = await api.post('/nominees', data);
  return response.data;
};

export const updateNominee = async (id, data) => {
  const response = await api.put(`/nominees/${id}`, data);
  return response.data;
};

export const deleteNominee = async (id) => {
  const response = await api.delete(`/nominees/${id}`);
  return response.data;
};

// ── Nominee Platform Data API ──
export const getNomineeData = async (id) => {
  const response = await api.get(`/nominees/${id}/data`);
  return response.data;
};

export const upsertPlatformData = async (nomineeId, platform, data) => {
  const response = await api.put(`/nominees/${nomineeId}/platforms/${platform}`, data);
  return response.data;
};

// ── Jury Scoring API ──
export const getMyNominees = async () => {
  const response = await api.get('/jury/my-nominees');
  return response.data;
};

export const getMyScore = async (nomineeId) => {
  const response = await api.get(`/jury-scores/mine/${nomineeId}`);
  return response.data;
};

export const saveJuryScore = async (data) => {
  const response = await api.post('/jury-scores', data);
  return response.data;
};

export { API_BASE_URL, AGENT_BASE_URL };
export default api;

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// API methods
export const uploadAPI = {
  uploadPDFs: (formData, onUploadProgress) => {
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
  },

  getBatches: (params) => api.get('/batches', { params }),

  getBatchStatus: (batchId) => api.get(`/batches/${batchId}/status`),

  getBatchDetails: (batchId) => api.get(`/batches/${batchId}`),

  downloadExcel: (batchId) => {
    const url = `${API_BASE_URL}/batches/${batchId}/download`;
    window.open(url, '_blank');
  },

  deleteBatch: (batchId) => api.delete(`/batches/${batchId}`),
};

export const templateAPI = {
  getTemplates: () => api.get('/templates'),

  getTemplate: (templateId) => api.get(`/templates/${templateId}`),

  createTemplate: (data) => api.post('/templates', data),

  updateTemplate: (templateId, data) => api.put(`/templates/${templateId}`, data),

  deleteTemplate: (templateId) => api.delete(`/templates/${templateId}`),

  getCustomFields: () => api.get('/custom-fields'),

  createCustomField: (data) => api.post('/custom-fields', data),

  updateCustomField: (fieldId, data) => api.put(`/custom-fields/${fieldId}`, data),

  deleteCustomField: (fieldId) => api.delete(`/custom-fields/${fieldId}`),
};

export default api;

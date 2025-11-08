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

  downloadCSV: (batchId) => {
    const url = `${API_BASE_URL}/batches/${batchId}/download/csv`;
    window.open(url, '_blank');
  },

  downloadJSON: (batchId) => {
    const url = `${API_BASE_URL}/batches/${batchId}/download/json`;
    window.open(url, '_blank');
  },

  downloadErrorReport: (batchId) => {
    const url = `${API_BASE_URL}/batches/${batchId}/download/errors`;
    window.open(url, '_blank');
  },

  deleteBatch: (batchId) => api.delete(`/batches/${batchId}`),

  bulkDeleteBatches: (batchIds) => api.post('/batches/bulk-delete', { batchIds }),

  retryBatch: (batchId, options = {}) => api.post(`/batches/${batchId}/retry`, options),

  retrySingleFile: (batchId, fileId, options = {}) => api.post(`/batches/${batchId}/files/${fileId}/retry`, options),
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

  exportTemplate: (templateId) => {
    const url = `${API_BASE_URL}/templates/${templateId}/export`;
    window.open(url, '_blank');
  },

  importTemplate: (templateData) => api.post('/templates/import', { templateData }),
};

// ===== NEW FEATURE APIs =====

// Validation API
export const validationAPI = {
  getBatchValidation: (batchId) => api.get(`/validation/batches/${batchId}/validation`),
  getValidationSummary: (batchId) => api.get(`/validation/batches/${batchId}/validation/summary`),
  checkDuplicates: (invoiceNumber, relationshipNumber, excludePdfRecordId) =>
    api.post('/validation/check-duplicates', { invoiceNumber, relationshipNumber, excludePdfRecordId }),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getCostAnalytics: (filters) => api.get('/analytics/costs', { params: filters }),
  getCircuitBreakdown: (filters) => api.get('/analytics/circuits', { params: filters }),
  getVendorComparison: () => api.get('/analytics/vendors'),
  getMonthlyTrends: (months = 12) => api.get('/analytics/trends', { params: { months } }),
  getCostByBandwidth: () => api.get('/analytics/bandwidth'),
  getTopSpending: (limit = 10) => api.get('/analytics/top-spending', { params: { limit } }),
  getPaymentDue: (days = 7) => api.get('/analytics/payment-due', { params: { days } }),
};

// Search API
export const searchAPI = {
  search: (filters, pagination) => api.post('/search', { filters, pagination }),
  fullTextSearch: (query, limit = 100) => api.get('/search/fulltext', { params: { q: query, limit } }),
  searchByCircuit: (circuitId) => api.get(`/search/circuit/${circuitId}`),
  searchByRelationship: (number) => api.get(`/search/relationship/${number}`),
  getFilterOptions: () => api.get('/search/filters'),
  getRecentInvoices: (limit = 20) => api.get('/search/recent', { params: { limit } }),
  searchByAmount: (min, max) => api.get('/search/amount', { params: { min, max } }),
  searchByDueDate: (startDate, endDate) => api.get('/search/due-date', { params: { startDate, endDate } }),
};

// Comparison API
export const comparisonAPI = {
  compareInvoice: (invoiceId) => api.get(`/compare/invoice/${invoiceId}`),
  getCircuitHistory: (circuitId, limit = 12) => api.get(`/compare/circuit/${circuitId}/history`, { params: { limit } }),
  getSignificantChanges: (threshold = 15) => api.get('/compare/significant-changes', { params: { threshold } }),
  compareCircuits: (circuitIds) => api.post('/compare/circuits', { circuitIds }),
};

// Alerts API
export const alertsAPI = {
  getBatchAlerts: (batchId) => api.get(`/alerts/batch/${batchId}`),
  generateAlerts: (batchId) => api.post(`/alerts/batch/${batchId}/generate`),
  getUnreadAlerts: (limit = 50) => api.get('/alerts/unread', { params: { limit } }),
  getCriticalAlerts: () => api.get('/alerts/critical'),
  getAlertStats: () => api.get('/alerts/stats'),
  markAsRead: (alertId) => api.put(`/alerts/${alertId}/read`),
  dismissAlert: (alertId) => api.put(`/alerts/${alertId}/dismiss`),
  cleanupAlerts: (days = 90) => api.delete('/alerts/cleanup', { params: { days } }),
};

// Export API
export const exportAPI = {
  exportToExcel: (batchId) => {
    const url = `${API_BASE_URL}/export/excel/${batchId}`;
    window.open(url, '_blank');
  },
  exportToCSV: (batchId) => {
    const url = `${API_BASE_URL}/export/csv/${batchId}`;
    window.open(url, '_blank');
  },
  exportToJSON: (batchId) => {
    const url = `${API_BASE_URL}/export/json/${batchId}`;
    window.open(url, '_blank');
  },
  getExportHistory: (batchId) => api.get(`/export/history/${batchId}`),
};

// Corrections API
export const correctionsAPI = {
  getInvoiceForCorrection: (invoiceId) => api.get(`/corrections/invoice/${invoiceId}`),
  saveCorrection: (data) => api.post('/corrections/save', data),
  applyCorrections: (invoiceId, corrections) => api.post('/corrections/apply', { invoiceId, corrections }),
  getBatchCorrections: (batchId) => api.get(`/corrections/batch/${batchId}`),
  approveCorrection: (correctionId, approvedBy) => api.put(`/corrections/${correctionId}/approve`, { approvedBy }),
  getCorrectionStats: (batchId) => api.get('/corrections/stats', { params: { batchId } }),
  getFrequentFields: (limit = 10) => api.get('/corrections/frequent-fields', { params: { limit } }),
};

// Scheduler API
export const schedulerAPI = {
  createJob: (jobData) => api.post('/scheduler/jobs', jobData),
  getAllJobs: () => api.get('/scheduler/jobs'),
  getJob: (jobId) => api.get(`/scheduler/jobs/${jobId}`),
  pauseJob: (jobId) => api.put(`/scheduler/jobs/${jobId}/pause`),
  resumeJob: (jobId) => api.put(`/scheduler/jobs/${jobId}/resume`),
  deleteJob: (jobId) => api.delete(`/scheduler/jobs/${jobId}`),
};

// Cloud Storage API
export const cloudAPI = {
  uploadToCloud: (filePath, provider, config) => api.post('/cloud/upload', { file_path: filePath, provider, config }),
  syncBatch: (batchId, provider, config) => api.post(`/cloud/sync-batch/${batchId}`, { provider, config }),
  downloadFromCloud: (cloudPath, localPath, provider) => api.post('/cloud/download', { cloud_path: cloudPath, local_path: localPath, provider }),
  listCloudFiles: (provider, config) => api.get('/cloud/list', { params: { provider, ...config } }),
  getConfigGuide: () => api.get('/cloud/config-guide'),
};

export default api;

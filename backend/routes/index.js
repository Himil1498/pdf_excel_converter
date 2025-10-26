const express = require('express');
const UploadController = require('../controllers/uploadController');
const TemplateController = require('../controllers/templateController');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// ===== UPLOAD ROUTES =====

// Upload PDFs and start processing
router.post('/upload',
  UploadController.uploadMiddleware,
  UploadController.uploadPDFs
);

// Get all batches
router.get('/batches', UploadController.getAllBatches);

// Get batch status
router.get('/batches/:batchId/status', UploadController.getBatchStatus);

// Get batch details
router.get('/batches/:batchId', UploadController.getBatchDetails);

// Download Excel file
router.get('/batches/:batchId/download', UploadController.downloadExcel);

// Download CSV file
router.get('/batches/:batchId/download/csv', UploadController.downloadCSV);

// Download JSON file
router.get('/batches/:batchId/download/json', UploadController.downloadJSON);

// Download error report
router.get('/batches/:batchId/download/errors', UploadController.downloadErrorReport);

// Delete batch
router.delete('/batches/:batchId', UploadController.deleteBatch);

// Bulk delete batches
router.post('/batches/bulk-delete', UploadController.bulkDeleteBatches);

// Retry failed files in batch
router.post('/batches/:batchId/retry', UploadController.retryBatch);

// Retry single failed file
router.post('/batches/:batchId/files/:fileId/retry', UploadController.retrySingleFile);

// ===== TEMPLATE ROUTES =====

// Get all templates
router.get('/templates', TemplateController.getAllTemplates);

// Get template by ID
router.get('/templates/:templateId', TemplateController.getTemplateById);

// Create new template
router.post('/templates', TemplateController.createTemplate);

// Update template
router.put('/templates/:templateId', TemplateController.updateTemplate);

// Delete template
router.delete('/templates/:templateId', TemplateController.deleteTemplate);

// ===== CUSTOM FIELDS ROUTES =====

// Get custom fields
router.get('/custom-fields', TemplateController.getCustomFields);

// Create custom field
router.post('/custom-fields', TemplateController.createCustomField);

// Update custom field
router.put('/custom-fields/:fieldId', TemplateController.updateCustomField);

// Delete custom field
router.delete('/custom-fields/:fieldId', TemplateController.deleteCustomField);

// ===== TEMPLATE IMPORT/EXPORT ROUTES =====

// Export template
router.get('/templates/:templateId/export', TemplateController.exportTemplate);

// Import template
router.post('/templates/import', TemplateController.importTemplate);

module.exports = router;

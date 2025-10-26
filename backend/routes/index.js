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

// Delete batch
router.delete('/batches/:batchId', UploadController.deleteBatch);

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

module.exports = router;

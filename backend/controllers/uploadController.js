const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const batchProcessor = require('../services/batchProcessor');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'pdfs');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}_${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    files: parseInt(process.env.MAX_FILES_PER_BATCH) || 1000
  }
});

class UploadController {
  /**
   * Upload middleware
   */
  static uploadMiddleware = upload.array('pdfs', parseInt(process.env.MAX_FILES_PER_BATCH) || 1000);

  /**
   * Upload and process PDFs
   */
  static async uploadPDFs(req, res) {
    try {
      const files = req.files;
      const {
        batchName = `Batch_${Date.now()}`,
        useAI = true,
        templateId = null
      } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      // Create batch record
      const batchResult = await db.query(
        'INSERT INTO upload_batches (batch_name, total_files, status) VALUES (?, ?, ?)',
        [batchName, files.length, 'pending']
      );

      const batchId = batchResult.insertId;

      // Create PDF records
      const pdfRecords = [];
      for (const file of files) {
        const result = await db.query(
          'INSERT INTO pdf_records (batch_id, filename, file_path, status) VALUES (?, ?, ?, ?)',
          [batchId, file.originalname, file.path, 'pending']
        );

        pdfRecords.push({
          id: result.insertId,
          filename: file.originalname,
          file_path: file.path
        });
      }

      // Start processing asynchronously
      UploadController.processAsync(batchId, pdfRecords, {
        useAI: useAI === 'true' || useAI === true,
        templateId: templateId ? parseInt(templateId) : null
      });

      res.status(202).json({
        success: true,
        message: 'Files uploaded successfully. Processing started.',
        batchId,
        totalFiles: files.length
      });

    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: error.message
      });
    }
  }

  /**
   * Process batch asynchronously
   */
  static async processAsync(batchId, files, options) {
    try {
      await batchProcessor.processBatch(batchId, files, options);
    } catch (error) {
      console.error(`Batch ${batchId} processing failed:`, error);
      await db.query(
        'UPDATE upload_batches SET status = ? WHERE id = ?',
        ['failed', batchId]
      );
    }
  }

  /**
   * Get batch status
   */
  static async getBatchStatus(req, res) {
    try {
      const { batchId } = req.params;

      const status = await batchProcessor.getBatchStatus(batchId);

      if (!status) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      console.error('Get batch status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get batch status',
        error: error.message
      });
    }
  }

  /**
   * Get all batches
   */
  static async getAllBatches(req, res) {
    try {
      const { limit = 50, offset = 0 } = req.query;

      // Ensure limit and offset are valid integers
      const limitInt = Math.max(1, Math.min(parseInt(limit) || 50, 1000));
      const offsetInt = Math.max(0, parseInt(offset) || 0);

      // Use direct SQL instead of prepared statement for LIMIT/OFFSET
      const sql = `SELECT * FROM upload_batches
         ORDER BY created_at DESC
         LIMIT ${limitInt} OFFSET ${offsetInt}`;

      const batches = await db.query(sql);

      const total = await db.query('SELECT COUNT(*) as count FROM upload_batches');

      res.json({
        success: true,
        data: batches,
        pagination: {
          total: total[0].count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });

    } catch (error) {
      console.error('Get batches error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get batches',
        error: error.message
      });
    }
  }

  /**
   * Download Excel file
   */
  static async downloadExcel(req, res) {
    try {
      const { batchId } = req.params;

      const batches = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const batch = batches[0];

      if (!batch.excel_file_path) {
        return res.status(404).json({
          success: false,
          message: 'Excel file not yet generated'
        });
      }

      const filename = path.basename(batch.excel_file_path);
      res.download(batch.excel_file_path, filename);

    } catch (error) {
      console.error('Download Excel error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download Excel file',
        error: error.message
      });
    }
  }

  /**
   * Get batch details with all PDF records
   */
  static async getBatchDetails(req, res) {
    try {
      const { batchId } = req.params;

      const batches = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      const pdfRecords = await db.query(
        'SELECT * FROM pdf_records WHERE batch_id = ? ORDER BY created_at ASC',
        [batchId]
      );

      const logs = await db.query(
        'SELECT * FROM processing_logs WHERE batch_id = ? ORDER BY created_at DESC LIMIT 100',
        [batchId]
      );

      res.json({
        success: true,
        data: {
          batch: batches[0],
          pdfRecords,
          logs
        }
      });

    } catch (error) {
      console.error('Get batch details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get batch details',
        error: error.message
      });
    }
  }

  /**
   * Delete batch
   */
  static async deleteBatch(req, res) {
    try {
      const { batchId } = req.params;

      // Get batch info to delete files
      const batches = await db.query(
        'SELECT * FROM upload_batches WHERE id = ?',
        [batchId]
      );

      if (batches.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Get PDF records to delete files
      const pdfRecords = await db.query(
        'SELECT file_path FROM pdf_records WHERE batch_id = ?',
        [batchId]
      );

      // Delete PDF files
      for (const record of pdfRecords) {
        try {
          await fs.unlink(record.file_path);
        } catch (err) {
          console.warn(`Failed to delete file: ${record.file_path}`);
        }
      }

      // Delete Excel file if exists
      const batch = batches[0];
      if (batch.excel_file_path) {
        try {
          await fs.unlink(batch.excel_file_path);
        } catch (err) {
          console.warn(`Failed to delete Excel file: ${batch.excel_file_path}`);
        }
      }

      // Delete batch (cascades to pdf_records and invoice_data)
      await db.query('DELETE FROM upload_batches WHERE id = ?', [batchId]);

      res.json({
        success: true,
        message: 'Batch deleted successfully'
      });

    } catch (error) {
      console.error('Delete batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete batch',
        error: error.message
      });
    }
  }
}

module.exports = UploadController;

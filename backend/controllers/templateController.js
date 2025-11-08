const db = require('../config/database');

class TemplateController {
  /**
   * Get all field templates
   */
  static async getAllTemplates(req, res) {
    try {
      const templates = await db.query(
        'SELECT * FROM field_templates ORDER BY created_at DESC'
      );

      res.json({
        success: true,
        data: templates
      });

    } catch (error) {
      console.error('Get templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get templates',
        error: error.message
      });
    }
  }

  /**
   * Get template by ID
   */
  static async getTemplateById(req, res) {
    try {
      const { templateId } = req.params;

      const templates = await db.query(
        'SELECT * FROM field_templates WHERE id = ?',
        [templateId]
      );

      if (templates.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        data: templates[0]
      });

    } catch (error) {
      console.error('Get template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get template',
        error: error.message
      });
    }
  }

  /**
   * Create new template
   */
  static async createTemplate(req, res) {
    try {
      const {
        templateName,
        vendorName,
        fieldMappings,
        isDefault = false
      } = req.body;

      if (!templateName || !fieldMappings) {
        return res.status(400).json({
          success: false,
          message: 'Template name and field mappings are required'
        });
      }

      // If setting as default, unset other defaults for same vendor
      if (isDefault && vendorName) {
        await db.query(
          'UPDATE field_templates SET is_default = FALSE WHERE vendor_name = ?',
          [vendorName]
        );
      }

      const result = await db.query(
        `INSERT INTO field_templates (template_name, vendor_name, field_mappings, is_default)
         VALUES (?, ?, ?, ?)`,
        [
          templateName,
          vendorName || null,
          JSON.stringify(fieldMappings),
          isDefault
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Template created successfully',
        templateId: result.insertId
      });

    } catch (error) {
      console.error('Create template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create template',
        error: error.message
      });
    }
  }

  /**
   * Update template
   */
  static async updateTemplate(req, res) {
    try {
      const { templateId } = req.params;
      const {
        templateName,
        vendorName,
        fieldMappings,
        isDefault
      } = req.body;

      // Check if template exists
      const existing = await db.query(
        'SELECT * FROM field_templates WHERE id = ?',
        [templateId]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      // If setting as default, unset other defaults for same vendor
      if (isDefault && vendorName) {
        await db.query(
          'UPDATE field_templates SET is_default = FALSE WHERE vendor_name = ? AND id != ?',
          [vendorName, templateId]
        );
      }

      await db.query(
        `UPDATE field_templates
         SET template_name = ?,
             vendor_name = ?,
             field_mappings = ?,
             is_default = ?
         WHERE id = ?`,
        [
          templateName || existing[0].template_name,
          vendorName !== undefined ? vendorName : existing[0].vendor_name,
          fieldMappings ? JSON.stringify(fieldMappings) : existing[0].field_mappings,
          isDefault !== undefined ? isDefault : existing[0].is_default,
          templateId
        ]
      );

      res.json({
        success: true,
        message: 'Template updated successfully'
      });

    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update template',
        error: error.message
      });
    }
  }

  /**
   * Delete template
   */
  static async deleteTemplate(req, res) {
    try {
      const { templateId } = req.params;

      if (!templateId || templateId === 'undefined' || templateId === 'null') {
        return res.status(400).json({
          success: false,
          message: 'Invalid template ID'
        });
      }

      const result = await db.query(
        'DELETE FROM field_templates WHERE id = ?',
        [templateId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      res.json({
        success: true,
        message: 'Template deleted successfully'
      });

    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete template',
        error: error.message
      });
    }
  }

  /**
   * Get custom fields configuration
   */
  static async getCustomFields(req, res) {
    try {
      const fields = await db.query(
        'SELECT * FROM custom_fields WHERE is_active = TRUE ORDER BY display_order ASC'
      );

      res.json({
        success: true,
        data: fields
      });

    } catch (error) {
      console.error('Get custom fields error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get custom fields',
        error: error.message
      });
    }
  }

  /**
   * Create custom field
   */
  static async createCustomField(req, res) {
    try {
      const {
        fieldName,
        fieldType,
        excelColumnName,
        extractionPattern,
        displayOrder = 0
      } = req.body;

      if (!fieldName || !fieldType || !excelColumnName) {
        return res.status(400).json({
          success: false,
          message: 'Field name, type, and Excel column name are required'
        });
      }

      const result = await db.query(
        `INSERT INTO custom_fields (field_name, field_type, excel_column_name, extraction_pattern, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [fieldName, fieldType, excelColumnName, extractionPattern || null, displayOrder]
      );

      res.status(201).json({
        success: true,
        message: 'Custom field created successfully',
        fieldId: result.insertId
      });

    } catch (error) {
      console.error('Create custom field error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create custom field',
        error: error.message
      });
    }
  }

  /**
   * Update custom field
   */
  static async updateCustomField(req, res) {
    try {
      const { fieldId } = req.params;
      const updates = req.body;

      const allowedFields = [
        'field_name', 'field_type', 'excel_column_name',
        'extraction_pattern', 'is_active', 'display_order'
      ];

      const setClauses = [];
      const values = [];

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = ?`);
          values.push(value);
        }
      }

      if (setClauses.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(fieldId);

      await db.query(
        `UPDATE custom_fields SET ${setClauses.join(', ')} WHERE id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Custom field updated successfully'
      });

    } catch (error) {
      console.error('Update custom field error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update custom field',
        error: error.message
      });
    }
  }

  /**
   * Delete custom field
   */
  static async deleteCustomField(req, res) {
    try {
      const { fieldId } = req.params;

      if (!fieldId || fieldId === 'undefined' || fieldId === 'null') {
        return res.status(400).json({
          success: false,
          message: 'Invalid field ID'
        });
      }

      const result = await db.query(
        'DELETE FROM custom_fields WHERE id = ?',
        [fieldId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Custom field not found'
        });
      }

      res.json({
        success: true,
        message: 'Custom field deleted successfully'
      });

    } catch (error) {
      console.error('Delete custom field error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete custom field',
        error: error.message
      });
    }
  }

  /**
   * Export template as JSON
   */
  static async exportTemplate(req, res) {
    try {
      const { templateId } = req.params;

      const templates = await db.query(
        'SELECT * FROM field_templates WHERE id = ?',
        [templateId]
      );

      if (templates.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Template not found'
        });
      }

      const template = templates[0];

      // Parse field mappings if it's a string
      const exportData = {
        templateName: template.template_name,
        vendorName: template.vendor_name,
        fieldMappings: typeof template.field_mappings === 'string'
          ? JSON.parse(template.field_mappings)
          : template.field_mappings,
        isDefault: template.is_default,
        version: '1.0',
        exportedAt: new Date().toISOString()
      };

      const json = JSON.stringify(exportData, null, 2);
      const filename = `template_${template.template_name.replace(/[^a-zA-Z0-9]/g, '_')}.json`;

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(json);

    } catch (error) {
      console.error('Export template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export template',
        error: error.message
      });
    }
  }

  /**
   * Import template from JSON
   */
  static async importTemplate(req, res) {
    try {
      const { templateData } = req.body;

      if (!templateData) {
        return res.status(400).json({
          success: false,
          message: 'No template data provided'
        });
      }

      // Validate template data
      if (!templateData.templateName || !templateData.fieldMappings) {
        return res.status(400).json({
          success: false,
          message: 'Invalid template format'
        });
      }

      // Check if template name already exists
      const existing = await db.query(
        'SELECT id FROM field_templates WHERE template_name = ?',
        [templateData.templateName]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Template with this name already exists'
        });
      }

      // Insert template
      const result = await db.query(
        `INSERT INTO field_templates (template_name, vendor_name, field_mappings, is_default)
         VALUES (?, ?, ?, ?)`,
        [
          templateData.templateName,
          templateData.vendorName || null,
          JSON.stringify(templateData.fieldMappings),
          templateData.isDefault || false
        ]
      );

      res.json({
        success: true,
        message: 'Template imported successfully',
        templateId: result.insertId
      });

    } catch (error) {
      console.error('Import template error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to import template',
        error: error.message
      });
    }
  }
}

module.exports = TemplateController;

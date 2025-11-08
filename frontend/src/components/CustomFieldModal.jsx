import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const CustomFieldModal = ({ isOpen, onClose, onSave, field }) => {
  const [formData, setFormData] = useState({
    fieldName: '',
    fieldType: 'text',
    excelColumnName: '',
    extractionPattern: '',
    isActive: true,
    displayOrder: 0
  });

  useEffect(() => {
    if (field) {
      setFormData({
        fieldName: field.field_name || '',
        fieldType: field.field_type || 'text',
        excelColumnName: field.excel_column_name || '',
        extractionPattern: field.extraction_pattern || '',
        isActive: field.is_active !== undefined ? field.is_active : true,
        displayOrder: field.display_order || 0
      });
    } else {
      // Reset for new field
      setFormData({
        fieldName: '',
        fieldType: 'text',
        excelColumnName: '',
        extractionPattern: '',
        isActive: true,
        displayOrder: 0
      });
    }
  }, [field, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (!formData.fieldName.trim()) {
      alert('Please enter a field name');
      return;
    }
    if (!formData.excelColumnName.trim()) {
      alert('Please enter an Excel column name');
      return;
    }

    const submitData = {
      fieldName: formData.fieldName,
      fieldType: formData.fieldType,
      excelColumnName: formData.excelColumnName,
      extractionPattern: formData.extractionPattern || null,
      isActive: formData.isActive,
      displayOrder: parseInt(formData.displayOrder) || 0
    };

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {field ? 'Edit Custom Field' : 'Create New Custom Field'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Name *
              </label>
              <input
                type="text"
                name="fieldName"
                value={formData.fieldName}
                onChange={handleInputChange}
                placeholder="e.g., Customer Reference"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Internal name for this field
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Type *
              </label>
              <select
                name="fieldType"
                value={formData.fieldType}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option key="text" value="text">Text</option>
                <option key="number" value="number">Number</option>
                <option key="date" value="date">Date</option>
                <option key="currency" value="currency">Currency</option>
              </select>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Data type for validation
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excel Column Name *
            </label>
            <input
              type="text"
              name="excelColumnName"
              value={formData.excelColumnName}
              onChange={handleInputChange}
              placeholder="e.g., Customer Reference Number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be the column header in the exported Excel file
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extraction Pattern (Optional)
            </label>
            <input
              type="text"
              name="extractionPattern"
              value={formData.extractionPattern}
              onChange={handleInputChange}
              placeholder="e.g., Customer\\s*Ref[:\.]\\s*([A-Z0-9]+)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Regex pattern to extract this field from PDFs. Leave empty to rely on AI extraction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                name="displayOrder"
                value={formData.displayOrder}
                onChange={handleInputChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Order in which field appears (0 = first)
              </p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                  Active
                </span>
              </label>
              <p className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                (Only active fields are used in extraction)
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">Custom Field Tips</h5>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Custom fields are added to the Excel output automatically</li>
              <li>• If no extraction pattern is provided, AI will attempt to find the value</li>
              <li>• Field type affects how the value is formatted in Excel</li>
              <li>• Display order controls the column position in Excel (from left to right)</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {field ? 'Update Field' : 'Create Field'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomFieldModal;

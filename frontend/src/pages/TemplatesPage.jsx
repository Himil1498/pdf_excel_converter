import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { templateAPI } from '../services/api';
import TemplateModal from '../components/TemplateModal';
import CustomFieldModal from '../components/CustomFieldModal';

const TemplatesPage = () => {
  const [templates, setTemplates] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editingField, setEditingField] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesRes, fieldsRes] = await Promise.all([
        templateAPI.getTemplates(),
        templateAPI.getCustomFields(),
      ]);

      if (templatesRes.success) setTemplates(templatesRes.data);
      if (fieldsRes.success) setCustomFields(fieldsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      if (editingTemplate) {
        await templateAPI.updateTemplate(editingTemplate.id, templateData);
        toast.success('Template updated successfully');
      } else {
        await templateAPI.createTemplate(templateData);
        toast.success('Template created successfully');
      }
      setShowTemplateModal(false);
      setEditingTemplate(null);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save template');
    }
  };

  const handleSaveField = async (fieldData) => {
    try {
      if (editingField) {
        await templateAPI.updateCustomField(editingField.id, fieldData);
        toast.success('Field updated successfully');
      } else {
        await templateAPI.createCustomField(fieldData);
        toast.success('Field created successfully');
      }
      setShowFieldModal(false);
      setEditingField(null);
      loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to save field');
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (!confirm(`Delete template "${templateName}"?`)) return;

    try {
      await templateAPI.deleteTemplate(templateId);
      toast.success('Template deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleDeleteField = async (fieldId, fieldName) => {
    if (!confirm(`Delete field "${fieldName}"?`)) return;

    try {
      await templateAPI.deleteCustomField(fieldId);
      toast.success('Field deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Templates & Fields</h2>
        <p className="mt-2 text-gray-600">
          Manage extraction templates and custom field configurations
        </p>
      </div>

      {/* Templates Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Extraction Templates</h3>
          <button
            onClick={() => {
              setEditingTemplate(null);
              setShowTemplateModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg
                     hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Template
          </button>
        </div>

        <div className="p-6">
          {templates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No templates found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {template.template_name}
                        {template.is_default && (
                          <span className="ml-2 text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                            Default
                          </span>
                        )}
                      </h4>
                      {template.vendor_name && (
                        <p className="text-sm text-gray-600 mt-1">
                          Vendor: {template.vendor_name}
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateModal(true);
                        }}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id, template.template_name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Custom Fields Section */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Custom Fields</h3>
          <button
            onClick={() => {
              setEditingField(null);
              setShowFieldModal(true);
            }}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg
                     hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Field
          </button>
        </div>

        <div className="overflow-x-auto">
          {customFields.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No custom fields defined</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Field Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Excel Column
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customFields.map((field) => (
                  <tr key={field.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {field.field_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {field.field_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {field.excel_column_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          field.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {field.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingField(field);
                            setShowFieldModal(true);
                          }}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteField(field.id, field.field_name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Template Configuration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">About Templates</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Templates define extraction patterns for different PDF formats</li>
          <li>• Set a default template for your most common vendor</li>
          <li>• Use regex patterns to extract specific fields from PDFs</li>
          <li>• AI extraction can work without templates for better accuracy</li>
        </ul>
      </div>

      {/* Modals */}
      <TemplateModal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false);
          setEditingTemplate(null);
        }}
        onSave={handleSaveTemplate}
        template={editingTemplate}
      />

      <CustomFieldModal
        isOpen={showFieldModal}
        onClose={() => {
          setShowFieldModal(false);
          setEditingField(null);
        }}
        onSave={handleSaveField}
        field={editingField}
      />
    </div>
  );
};

export default TemplatesPage;

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

const TemplateModal = ({ isOpen, onClose, onSave, template }) => {
  const [formData, setFormData] = useState({
    templateName: "",
    vendorName: "",
    isDefault: false,
    fieldMappings: {}
  });

  const [mappingFields, setMappingFields] = useState([
    { key: "invoice_number", pattern: "", required: true },
    { key: "bill_date", pattern: "", required: true, format: "DD.MM.YY" },
    { key: "due_date", pattern: "", required: true, format: "DD.MM.YYYY" },
    { key: "relationship_number", pattern: "", required: false },
    { key: "total_payable", pattern: "", required: true },
    { key: "company_name", pattern: "", required: true },
    { key: "gstin", pattern: "", required: false },
    { key: "circuit_id", pattern: "", required: false },
    { key: "bandwidth", pattern: "", required: false }
  ]);

  useEffect(() => {
    if (template) {
      setFormData({
        templateName: template.template_name || "",
        vendorName: template.vendor_name || "",
        isDefault: template.is_default || false,
        fieldMappings:
          typeof template.field_mappings === "string"
            ? JSON.parse(template.field_mappings)
            : template.field_mappings || {}
      });

      // Load existing mappings
      const existingMappings =
        typeof template.field_mappings === "string"
          ? JSON.parse(template.field_mappings)
          : template.field_mappings || {};

      const updatedFields = mappingFields.map((field) => ({
        ...field,
        pattern: existingMappings[field.key]?.pattern || "",
        required:
          existingMappings[field.key]?.required !== undefined
            ? existingMappings[field.key].required
            : field.required
      }));
      setMappingFields(updatedFields);
    } else {
      // Reset for new template
      setFormData({
        templateName: "",
        vendorName: "",
        isDefault: false,
        fieldMappings: {}
      });
    }
  }, [template]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleMappingChange = (index, value) => {
    const updatedFields = [...mappingFields];
    updatedFields[index].pattern = value;
    setMappingFields(updatedFields);
  };

  const handleRequiredToggle = (index) => {
    const updatedFields = [...mappingFields];
    updatedFields[index].required = !updatedFields[index].required;
    setMappingFields(updatedFields);
  };

  const handleAddCustomField = () => {
    setMappingFields([
      ...mappingFields,
      { key: "", pattern: "", required: false }
    ]);
  };

  const handleRemoveField = (index) => {
    setMappingFields(mappingFields.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (!formData.templateName.trim()) {
      alert("Please enter a template name");
      return;
    }

    // Build field mappings object
    const fieldMappings = {};
    mappingFields.forEach((field) => {
      if (field.key && field.pattern) {
        fieldMappings[field.key] = {
          pattern: field.pattern,
          required: field.required
        };
        if (field.format) {
          fieldMappings[field.key].format = field.format;
        }
      }
    });

    const submitData = {
      templateName: formData.templateName,
      vendorName: formData.vendorName || null,
      isDefault: formData.isDefault,
      fieldMappings
    };

    onSave(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {template ? "Edit Template" : "Create New Template"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Template Name *
              </label>
              <input
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleInputChange}
                placeholder="e.g., Vodafone Template"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleInputChange}
                placeholder="e.g., Vodafone Idea"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Set as default template for this vendor
              </span>
            </label>
          </div>

          {/* Field Mappings */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Field Extraction Patterns
              </h4>
              <button
                type="button"
                onClick={handleAddCustomField}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                + Add Custom Field
              </button>
            </div>

            <div className="space-y-3">
              {mappingFields.map((field, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Field Name
                    </label>
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) => {
                        const updatedFields = [...mappingFields];
                        updatedFields[index].key = e.target.value;
                        setMappingFields(updatedFields);
                      }}
                      placeholder="e.g., invoice_number"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="flex-[2]">
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Regex Pattern
                    </label>
                    <input
                      type="text"
                      value={field.pattern}
                      onChange={(e) =>
                        handleMappingChange(index, e.target.value)
                      }
                      placeholder="e.g., Invoice\\s*No[:\.]\\s*([A-Z0-9]+)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono dark:bg-gray-600 dark:text-white dark:placeholder-gray-400"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={() => handleRequiredToggle(index)}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">
                        Required
                      </span>
                    </label>

                    {index >= 9 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Regex Pattern Tips
            </h5>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>
                • Use parentheses () to capture the value you want to extract
              </li>
              <li>
                • Use \\s for whitespace, \\d for digits, [A-Z0-9]+ for
                alphanumeric
              </li>
              <li>
                • Example:{" "}
                <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">
                  Invoice\\s*No[:\.]\\s*([A-Z0-9]+)
                </code>
              </li>
              <li>
                • Test your patterns with online regex testers before saving
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="h-5 w-5 mr-2" />
              {template ? "Update Template" : "Create Template"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateModal;

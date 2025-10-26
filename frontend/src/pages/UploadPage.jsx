import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import { Upload, X, FileText, Settings, Sparkles } from 'lucide-react';
import { uploadAPI, templateAPI } from '../services/api';

const UploadPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [batchName, setBatchName] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [templateId, setTemplateId] = useState('');
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await templateAPI.getTemplates();
      if (response.success) {
        setTemplates(response.data);
        // Set default template if available
        const defaultTemplate = response.data.find(t => t.is_default);
        if (defaultTemplate) {
          setTemplateId(defaultTemplate.id.toString());
        }
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length !== acceptedFiles.length) {
      toast.error('Only PDF files are allowed');
    }

    if (pdfFiles.length + files.length > 1000) {
      toast.error('Maximum 1000 files allowed per batch');
      return;
    }

    // Check for duplicates
    const existingNames = new Set(files.map(f => f.name));
    const duplicates = pdfFiles.filter(file => existingNames.has(file.name));
    const newFiles = pdfFiles.filter(file => !existingNames.has(file.name));

    if (duplicates.length > 0) {
      toast.error(`${duplicates.length} duplicate file(s) skipped`);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} file(s) added`);
    }
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    toast.success('File removed');
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select at least one PDF file');
      return;
    }

    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }

    if (batchName.length < 3) {
      toast.error('Batch name must be at least 3 characters');
      return;
    }

    if (batchName.length > 100) {
      toast.error('Batch name must be less than 100 characters');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('pdfs', file);
      });
      formData.append('batchName', batchName);
      formData.append('useAI', useAI);
      if (templateId) {
        formData.append('templateId', templateId);
      }

      const response = await uploadAPI.uploadPDFs(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setUploadProgress(percentCompleted);
      });

      if (response.success) {
        toast.success(`${files.length} files uploaded successfully. Processing started.`);

        // Clear files and reset form
        setFiles([]);
        setBatchName('');
        setUploadProgress(0);

        // Navigate to batch details
        setTimeout(() => {
          navigate(`/batches/${response.batchId}`);
        }, 1500);
      }
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Upload PDFs</h2>
        <p className="mt-2 text-gray-600">
          Upload up to 1000 PDF files for batch conversion to Excel
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-5 w-5 text-gray-700 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Batch Settings</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Batch Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch Name *
            </label>
            <input
              type="text"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
              placeholder="e.g., Vodafone Invoices - January 2025"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extraction Template
            </label>
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Auto-detect (AI)</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.template_name}
                  {template.is_default && ' (Default)'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* AI Toggle */}
        <div className="mt-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="ml-3 flex items-center text-sm font-medium text-gray-700">
              <Sparkles className="h-4 w-4 mr-1 text-primary-600" />
              Use AI-powered extraction for better accuracy
            </span>
          </label>
          <p className="mt-2 ml-8 text-sm text-gray-500">
            AI extraction works with multiple vendor formats and provides higher accuracy
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary-600 font-medium">Drop the files here...</p>
          ) : (
            <>
              <p className="text-lg text-gray-700 font-medium mb-2">
                Drag & drop PDF files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Maximum 1000 files per batch | Up to 10MB per file
              </p>
            </>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">
                Selected Files ({files.length})
              </h4>
              <button
                onClick={() => setFiles([])}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-4 p-1 hover:bg-red-100 rounded-full transition-colors"
                  >
                    <X className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {uploading && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading || !batchName.trim()}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg font-medium
                     hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                     transition-colors flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 mr-2" />
                Upload and Process {files.length} File(s)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;

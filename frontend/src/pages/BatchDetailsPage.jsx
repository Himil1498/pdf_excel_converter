import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, RefreshCw, CheckCircle, XCircle, Clock, RotateCcw, FileText, FileJson, AlertCircle, Edit, Shield } from 'lucide-react';
import { uploadAPI } from '../services/api';
import { format } from 'date-fns';
import ConfirmDialog from '../components/ConfirmDialog';

const BatchDetailsPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [pdfRecords, setPdfRecords] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadBatchDetails();
  }, [batchId]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (batch?.status === 'processing' || batch?.status === 'pending') {
        loadBatchDetails();
      }
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [batch, autoRefresh]);

  const loadBatchDetails = async () => {
    try {
      const response = await uploadAPI.getBatchDetails(batchId);
      if (response.success) {
        setBatch(response.data.batch);
        setPdfRecords(response.data.pdfRecords);
        setLogs(response.data.logs);
      }
    } catch (error) {
      toast.error('Failed to load batch details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    uploadAPI.downloadExcel(batchId);
    toast.success('Download started');
  };

  const handleRetryBatch = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Retry Batch',
      message: 'Are you sure you want to retry all failed files in this batch?',
      onConfirm: async () => {
        try {
          const response = await uploadAPI.retryBatch(batchId, { useAI: true });
          if (response.success) {
            toast.success(response.message);
            loadBatchDetails();
          }
        } catch (error) {
          toast.error('Failed to retry batch');
        }
      }
    });
  };

  const handleRetrySingleFile = (fileId, filename) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Retry File',
      message: `Are you sure you want to retry processing for "${filename}"?`,
      onConfirm: async () => {
        try {
          const response = await uploadAPI.retrySingleFile(batchId, fileId, { useAI: true });
          if (response.success) {
            toast.success(`Retrying ${filename}`);
            loadBatchDetails();
          }
        } catch (error) {
          toast.error('Failed to retry file');
        }
      }
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-5 w-5 text-amber-600 text-warning-500" />,
      processing: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-info-500" />,
      completed: <CheckCircle className="h-5 w-5 text-green-600 text-success-500" />,
      failed: <XCircle className="h-5 w-5 text-red-600 text-error-500" />,
    };
    return icons[status] || icons.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 dark:text-gray-400">Batch not found</p>
        <button
          onClick={() => navigate('/batches')}
          className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Back to Batches
        </button>
      </div>
    );
  }

  const progressPercentage = batch.total_files > 0
    ? Math.round(((batch.processed_files + batch.failed_files) / batch.total_files) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/batches')}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{batch.batch_name}</h2>
            <p className="mt-1 text-gray-600 dark:text-gray-300">Batch ID: {batch.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          {batch.failed_files > 0 && (
            <button
              onClick={handleRetryBatch}
              className="flex items-center px-6 py-2 bg-orange-600 text-white rounded-lg
                       hover:bg-orange-700 transition-colors"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Retry Failed ({batch.failed_files})
            </button>
          )}
          <button
            onClick={() => navigate(`/batches/${batchId}/validation`)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 transition-colors"
            title="View validation results"
          >
            <Shield className="h-4 w-4 mr-1" />
            Validation
          </button>
          <button
            onClick={() => navigate(`/batches/${batchId}/corrections`)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg
                     hover:bg-purple-700 transition-colors"
            title="Manual data correction"
          >
            <Edit className="h-4 w-4 mr-1" />
            Corrections
          </button>
          {batch.excel_file_path && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg
                         hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-1" />
                Excel
              </button>
              <button
                onClick={() => {
                  uploadAPI.downloadCSV(batchId);
                  toast.success('CSV download started');
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg
                         hover:bg-blue-700 transition-colors"
              >
                <FileText className="h-4 w-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => {
                  uploadAPI.downloadJSON(batchId);
                  toast.success('JSON download started');
                }}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg
                         hover:bg-purple-700 transition-colors"
              >
                <FileJson className="h-4 w-4 mr-1" />
                JSON
              </button>
            </>
          )}
          {batch.failed_files > 0 && (
            <button
              onClick={() => {
                uploadAPI.downloadErrorReport(batchId);
                toast.success('Error report download started');
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg
                       hover:bg-red-700 transition-colors"
            >
              <AlertCircle className="h-4 w-4 mr-1" />
              Errors
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Total Files</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{batch.total_files}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Processed</p>
              <p className="text-2xl font-bold text-success-600">{batch.processed_files}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Failed</p>
              <p className="text-2xl font-bold text-error-600">{batch.failed_files}</p>
            </div>
            <XCircle className="h-8 w-8 text-error-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">Progress</p>
              <p className="text-2xl font-bold text-primary-600">{progressPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Processing Status</span>
          <span className="text-sm text-gray-500 capitalize">{batch.status}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-primary-600 h-4 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* PDF Records */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">PDF Files</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Filename
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Processing Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Error
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
              {pdfRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {record.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-2 text-sm capitalize">{record.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {record.processing_time_ms
                      ? `${(record.processing_time_ms / 1000).toFixed(2)}s`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-error-600">
                    {record.error_message || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {record.status === 'failed' && (
                      <button
                        onClick={() => handleRetrySingleFile(record.id, record.filename)}
                        className="text-warning-600 hover:text-warning-700 font-medium text-sm"
                        title="Retry this file"
                      >
                        <RotateCcw className="h-4 w-4 inline mr-1" />
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Logs */}
      {logs.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Logs</h3>
          </div>
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`mb-2 p-3 rounded-lg text-sm ${
                  log.log_level === 'error'
                    ? 'bg-error-50 text-error-800'
                    : log.log_level === 'warning'
                    ? 'bg-warning-50 text-warning-800'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{log.log_level}</span>
                  <span className="text-xs">
                    {format(new Date(log.created_at), 'HH:mm:ss')}
                  </span>
                </div>
                <p className="mt-1">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmButtonClass="bg-primary-600 hover:bg-primary-700"
      />
    </div>
  );
};

export default BatchDetailsPage;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Download, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { uploadAPI } from '../services/api';
import { format } from 'date-fns';

const BatchDetailsPage = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [pdfRecords, setPdfRecords] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-5 w-5 text-yellow-500" />,
      processing: <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />,
      completed: <CheckCircle className="h-5 w-5 text-green-500" />,
      failed: <XCircle className="h-5 w-5 text-red-500" />,
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
        <p className="text-gray-500">Batch not found</p>
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
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{batch.batch_name}</h2>
            <p className="mt-1 text-gray-600">Batch ID: {batch.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              autoRefresh
                ? 'bg-primary-50 border-primary-300 text-primary-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
          </button>
          {batch.excel_file_path && (
            <button
              onClick={handleDownload}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg
                       hover:bg-green-700 transition-colors"
            >
              <Download className="h-5 w-5 mr-2" />
              Download Excel
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{batch.total_files}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processed</p>
              <p className="text-2xl font-bold text-green-600">{batch.processed_files}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{batch.failed_files}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-primary-600">{progressPercentage}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Processing Status</span>
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">PDF Files</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pdfRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.filename}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(record.status)}
                      <span className="ml-2 text-sm capitalize">{record.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.processing_time_ms
                      ? `${(record.processing_time_ms / 1000).toFixed(2)}s`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    {record.error_message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Processing Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Processing Logs</h3>
          </div>
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`mb-2 p-3 rounded-lg text-sm ${
                  log.log_level === 'error'
                    ? 'bg-red-50 text-red-800'
                    : log.log_level === 'warning'
                    ? 'bg-yellow-50 text-yellow-800'
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
    </div>
  );
};

export default BatchDetailsPage;

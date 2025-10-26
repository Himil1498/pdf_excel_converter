import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, Download, Trash2, RefreshCw, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';
import { uploadAPI } from '../services/api';
import { format } from 'date-fns';

const BatchesPage = () => {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const response = await uploadAPI.getBatches({ limit: 50, offset: 0 });
      if (response.success) {
        setBatches(response.data);
      }
    } catch (error) {
      toast.error('Failed to load batches');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBatches();
    setRefreshing(false);
    toast.success('Batches refreshed');
  };

  const handleDelete = async (batchId, batchName) => {
    if (!confirm(`Are you sure you want to delete "${batchName}"?`)) {
      return;
    }

    try {
      await uploadAPI.deleteBatch(batchId);
      toast.success('Batch deleted successfully');
      loadBatches();
    } catch (error) {
      toast.error('Failed to delete batch');
    }
  };

  const handleDownload = (batchId) => {
    uploadAPI.downloadExcel(batchId);
    toast.success('Download started');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending', className: 'bg-yellow-100 text-yellow-800' },
      processing: { icon: Loader, text: 'Processing', className: 'bg-blue-100 text-blue-800' },
      completed: { icon: CheckCircle, text: 'Completed', className: 'bg-green-100 text-green-800' },
      failed: { icon: XCircle, text: 'Failed', className: 'bg-red-100 text-red-800' },
    };

    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.className}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getProgressPercentage = (batch) => {
    if (batch.total_files === 0) return 0;
    return Math.round(((batch.processed_files + batch.failed_files) / batch.total_files) * 100);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Processing Batches</h2>
          <p className="mt-2 text-gray-600">
            View and manage your PDF processing batches
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg
                   hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Batches List */}
      {batches.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No batches found</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload PDFs to create your first batch
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg
                     hover:bg-primary-700 transition-colors"
          >
            Upload PDFs
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {batch.batch_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {batch.id}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(batch.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Total: {batch.total_files}
                    </div>
                    <div className="text-xs text-gray-500">
                      ✓ {batch.processed_files} | ✗ {batch.failed_files}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${getProgressPercentage(batch)}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700">
                        {getProgressPercentage(batch)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(batch.created_at), 'MMM dd, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/batches/${batch.id}`)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      {batch.excel_file_path && (
                        <button
                          onClick={() => handleDownload(batch.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Download Excel"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(batch.id, batch.batch_name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Batch"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BatchesPage;

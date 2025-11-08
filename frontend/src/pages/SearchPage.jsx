import { useState, useEffect } from 'react';
import { searchAPI } from '../services/api';
import { Search, Filter, X, Download, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOptions, setFilterOptions] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 20 });
  const [totalResults, setTotalResults] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    vendor: '',
    circuitId: '',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    city: '',
    state: '',
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchRecentInvoices();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const options = await searchAPI.getFilterOptions();
      setFilterOptions(options);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const fetchRecentInvoices = async () => {
    try {
      setLoading(true);
      const recent = await searchAPI.getRecentInvoices(20);
      setResults(recent);
      setTotalResults(recent.length);
    } catch (error) {
      console.error('Error fetching recent invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      if (searchTerm.trim()) {
        // Full-text search
        const searchResults = await searchAPI.fullTextSearch(searchTerm);
        setResults(searchResults);
        setTotalResults(searchResults.length);
      } else {
        // Advanced search with filters
        const searchData = await searchAPI.search(filters, pagination);
        setResults(searchData.data);
        setTotalResults(searchData.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      vendor: '',
      circuitId: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      city: '',
      state: '',
    });
    setSearchTerm('');
  };

  const viewInvoiceDetails = (invoice) => {
    navigate(`/batches/${invoice.batch_id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Search Invoices
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Search and filter through all processed invoices</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by invoice number, circuit ID, company name..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Search
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2 ${
                showFilters ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Vendor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Vendor</label>
                  <select
                    value={filters.vendor}
                    onChange={(e) => handleFilterChange('vendor', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option key="all-vendors" value="">All Vendors</option>
                    {filterOptions?.vendors.map((vendor, index) => (
                      <option key={index} value={vendor}>{vendor}</option>
                    ))}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">City</label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All Cities</option>
                    {filterOptions?.cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">State</label>
                  <select
                    value={filters.state}
                    onChange={(e) => handleFilterChange('state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">All States</option>
                    {filterOptions?.states.map((state, index) => (
                      <option key={index} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Circuit ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Circuit ID</label>
                  <input
                    type="text"
                    value={filters.circuitId}
                    onChange={(e) => handleFilterChange('circuitId', e.target.value)}
                    placeholder="Enter circuit ID"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Amount Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Min Amount</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    placeholder="Min ₹"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Max Amount</label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    placeholder="Max ₹"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50">
          {/* Results Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Search Results ({totalResults})
              </h2>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 dark:text-gray-300">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <p>No invoices found</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-900">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-200">Invoice No</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-200">Date</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-200">Company</th>
                    <th className="text-left py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-200">Circuit ID</th>
                    <th className="text-right py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-200">Amount</th>
                    <th className="text-center py-3 px-6 text-sm font-medium text-gray-700 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 dark:divide-gray-700">
                  {results.map((invoice, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-900">
                      <td className="py-4 px-6 text-sm">{invoice.bill_number}</td>
                      <td className="py-4 px-6 text-sm">
                        {invoice.bill_date ? new Date(invoice.bill_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-6 text-sm">{invoice.company_name || '-'}</td>
                      <td className="py-4 px-6 text-sm font-mono text-xs">{invoice.circuit_id || '-'}</td>
                      <td className="py-4 px-6 text-sm text-right font-medium text-green-600">
                        ₹{parseFloat(invoice.total || 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => viewInvoiceDetails(invoice)}
                          className="text-primary-600 hover:text-primary-700 hover:bg-primary-50 p-2 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

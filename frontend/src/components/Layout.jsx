import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Upload, List, FileText } from 'lucide-react';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-primary-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                PDF to Excel Converter
              </h1>
            </div>
            <nav className="flex space-x-4">
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Upload className="h-5 w-5 mr-2" />
                Upload
              </NavLink>
              <NavLink
                to="/batches"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <List className="h-5 w-5 mr-2" />
                Batches
              </NavLink>
              <NavLink
                to="/templates"
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <FileText className="h-5 w-5 mr-2" />
                Templates
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            PDF to Excel Converter - Bulk process 500-1000 PDFs with AI-powered extraction
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

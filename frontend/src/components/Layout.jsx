import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Upload, List, FileText, BarChart3, Search, GitCompare, Clock } from 'lucide-react';
import AlertsNotification from './AlertsNotification';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/50 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <h1 className="ml-3 text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                PDF to Excel Converter
              </h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex space-x-2">
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Upload className="h-5 w-5 mr-2 text-indigo-600" />
                Upload
              </NavLink>
              <NavLink
                to="/batches"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <List className="h-5 w-5 mr-2 text-blue-600" />
                Batches
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
                Analytics
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Search className="h-5 w-5 mr-2 text-purple-600" />
                Search
              </NavLink>
              <NavLink
                to="/templates"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <FileText className="h-5 w-5 mr-2 text-cyan-600" />
                Templates
              </NavLink>
              <NavLink
                to="/comparison"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <GitCompare className="h-5 w-5 mr-2 text-orange-600" />
                Compare
              </NavLink>
              <NavLink
                to="/scheduler"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Clock className="h-5 w-5 mr-2 text-amber-600" />
                Scheduler
              </NavLink>
            </nav>

            {/* Theme Toggle & Alerts */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <AlertsNotification />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden pb-4">
            <nav className="flex flex-wrap gap-2">
              <NavLink
                to="/upload"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Upload className="h-4 w-4 mr-1 text-indigo-600" />
                Upload
              </NavLink>
              <NavLink
                to="/batches"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <List className="h-4 w-4 mr-1 text-blue-600" />
                Batches
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <BarChart3 className="h-4 w-4 mr-1 text-green-600" />
                Analytics
              </NavLink>
              <NavLink
                to="/search"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Search className="h-4 w-4 mr-1 text-purple-600" />
                Search
              </NavLink>
              <NavLink
                to="/templates"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <FileText className="h-4 w-4 mr-1 text-cyan-600" />
                Templates
              </NavLink>
              <NavLink
                to="/comparison"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <GitCompare className="h-4 w-4 mr-1 text-orange-600" />
                Compare
              </NavLink>
              <NavLink
                to="/scheduler"
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:bg-gray-700'
                  }`
                }
              >
                <Clock className="h-4 w-4 mr-1 text-amber-600" />
                Scheduler
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
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            PDF to Excel Converter - Bulk process 500-1000 PDFs with AI-powered extraction
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

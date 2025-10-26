import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import UploadPage from './pages/UploadPage';
import BatchesPage from './pages/BatchesPage';
import BatchDetailsPage from './pages/BatchDetailsPage';
import TemplatesPage from './pages/TemplatesPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/upload" replace />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="batches" element={<BatchesPage />} />
          <Route path="batches/:batchId" element={<BatchDetailsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

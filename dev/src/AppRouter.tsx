import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg mb-2">Loading...</div>
            <p className="text-gray-500">Please wait while the app initializes</p>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* Fallback for all other routes */}
          <Route path="*" element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                <p className="text-gray-500 mb-6">
                  The page you're looking for doesn't exist.
                </p>
                <a 
                  href="/"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Return to Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
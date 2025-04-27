import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Button } from './components/ui/button';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ThemeToggle from './components/ThemeToggle';
import { LoginArea } from './components/auth/LoginArea';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
                Kep
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link to="/">
                  <Button variant="ghost">Home</Button>
                </Link>
                <Link to="/admin">
                  <Button variant="ghost">Admin</Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <LoginArea />
            </div>
          </div>
        </nav>
        
        {/* Content */}
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Kep - Built with Nostr for distributed teams
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default AppRouter;
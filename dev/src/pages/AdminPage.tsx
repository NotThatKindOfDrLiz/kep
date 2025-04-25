/**
 * Admin page component
 */

import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Header } from '@/components/Header';
import { useIsAdmin } from '@/hooks/useAgenda';

export default function AdminPage() {
  const { isAdmin, isLoading } = useIsAdmin();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg mb-2">Loading...</div>
            <p className="text-gray-500">Checking admin permissions</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">Access Denied</div>
            <p className="text-gray-500 mb-6">
              You don't have admin permissions for this application.
            </p>
            <a 
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Return to Home
            </a>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <AdminDashboard />
      </main>
      
      <footer className="border-t py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <div className="container">
          <p>
            Kep Admin - Built on Nostr - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
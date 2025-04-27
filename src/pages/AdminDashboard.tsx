import React from 'react';
import RelayConfig from '../components/RelayConfig';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Kep Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage agenda items, settings, and more.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="col-span-1">
          <RelayConfig />
        </div>
        
        <div className="col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
            <p className="text-gray-600 dark:text-gray-400">
              This is a placeholder for future admin functionality. Future versions will include:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Agenda item moderation</li>
              <li>Team management</li>
              <li>Export functionality</li>
              <li>KYD (Know Your Document) verification setup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
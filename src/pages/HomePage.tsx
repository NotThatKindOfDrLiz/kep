import React from 'react';
import { useNostrClient } from '../hooks/useNostrClient';
import SubmitForm from '../components/SubmitForm';
import WeeklyThread from '../components/WeeklyThread';

const HomePage: React.FC = () => {
  const { items, publishEvent } = useNostrClient();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Kep</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Collaborative agenda management for distributed teams
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <SubmitForm onSubmit={publishEvent} />
        </div>

        <div className="md:col-span-2">
          <WeeklyThread items={items} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

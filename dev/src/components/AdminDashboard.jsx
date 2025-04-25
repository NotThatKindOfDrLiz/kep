import React, { useState } from 'react';

export default function AdminDashboard() {
  const adminPubKey = 'your_hardcoded_pubkey';
  const items = [
    { id: 1, content: 'Agenda item 1', date: '2022-01-01' },
    { id: 2, content: 'Agenda item 2', date: '2022-01-02' },
    { id: 3, content: 'Agenda item 3', date: '2022-01-03' }
  ];

  // Step1: Initially, no items are starred.
  const [starredItems, setStarredItems] = useState([]);

  const handleStarToggle = (item) => {
    if (starredItems.includes(item)) {
      setStarredItems(starredItems.filter(starredItem => starredItem !== item));
    } else {
      setStarredItems([...starredItems, item]);
    }
  };

  const handleExportAsMarkdown = () => {
    // Export starred items as Markdown
    starredItems.forEach(item => {
      console.log(`- ${item.content}`);
    });
  };

  const handleExportAsJSON = () => {
    // Export starred items as JSON
    console.log(JSON.stringify(starredItems, null, 2));
  };

  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>Admin Dashboard</h1>
      <ul>
        {items.map(item => (
          <li key={item.id} className='list-disc list-inside'>
            {item.content} <button onClick={() => handleStarToggle(item)}>{starredItems.includes(item) ? 'Unstar' : 'Star'}</button>
          </li>
        ))}
      </ul>
      <div className='my-4'>
        <button onClick={handleExportAsMarkdown} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>Export as Markdown</button>
        <button onClick={handleExportAsJSON} className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-4'>Export as JSON</button>
      </div>
    </div>
  );
}
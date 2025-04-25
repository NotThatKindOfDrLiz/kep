import React from 'react';

export default function HomePage() {
  const agendaItems = [
    { id: 1, content: 'Agenda item 1', date: '2022-01-01' },
    { id: 2, content: 'Agenda item 2', date: '2022-01-02' },
    { id: 3, content: 'Agenda item 3', date: '2022-01-03' }
  ];

  return (
   <div className='container mx-auto px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>This Week's Agenda</h1>
      <ul>
        {agendaItems.map(item => (
          <li key={item.id} className='list-disc list-inside'>
            {item.content}
          </li>
        ))}
      </ul>
   </div>
  );
}
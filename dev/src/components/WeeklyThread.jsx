import React from 'react';

export default function WeeklyThread({ items }) {
  // Get the current week of the year
  const currentWeek = new Date().getWeek();

  // Filter items for the current week
  const currentItems = items.filter(item => new Date(item.date).getWeek() === currentWeek);

  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>This Week's Items</h1>
      <ul>
        {currentItems.map(item => (
          <li key={item.id} className='list-disc list-inside'>
            {item.content}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Source: https://stackoverflow.com/a/6117889/10456718
Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  return Math.ceil((((this - onejan) / 86400000) + onejan.getDay()+1)/7);
}
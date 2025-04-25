import React, { useState } from 'react';

export default function SubmitForm() {
  const [agendaItem, setAgendaItem] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Note: Here is where we would normally send a Nostr event.
    console.log('Submitting the following data:');
    console.log(`Agenda Item: ${agendaItem}`);
    console.log(`Display Name: ${anonymous ? 'Anonymous' : displayName}`);

    // Clear the form.
    setAgendaItem('');
    setDisplayName('');
    setAnonymous(false);
  };

  return (
    <form onSubmit={handleSubmit} className='container mx-auto px-4'>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Agenda Item:</label>
        <input type='text' value={agendaItem} onChange={event => setAgendaItem(event.target.value)} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' />
      </div>
      <div className='mb-4'>
        <label className='block text-gray-700 text-sm font-bold mb-2'>Display Name (optional):</label>
        <input type='text' value={displayName} onChange={event => setDisplayName(event.target.value)} className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' />
      </div>
      <div className='mb-4'>
        <input type='checkbox' checked={anonymous} onChange={event => setAnonymous(event.target.checked)} /> Submit anonymously
      </div>
      <input type='submit' value='Submit' className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' />
    </form>
  );
}
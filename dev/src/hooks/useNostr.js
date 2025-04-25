import { useState } from 'react';

export default function useNostr() {
  const [eventLogs, setEventLogs] = useState([]);

  const postData = (itemId, username, anonymous) => {
    // Normally, this is where we would post a new event to the Nostr network.
    console.log(`Posting the following event:`);
    console.log(`Item ID: ${itemId}`);
    console.log(`Username: ${username}`);
    console.log(`Anonymous: ${anonymous}`);

    setEventLogs([...eventLogs, { itemId, username, anonymous }]);
  };

  const fetchData = () => {
    // Normally, this is where we would fetch data from the Nostr network.
    console.log(`Fetching data...`);
  };

  return { postData, fetchData, events: eventLogs };
}
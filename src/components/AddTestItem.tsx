import React from 'react';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/hooks/useAuth';

const AddTestItem = () => {
  const { user } = useAuth();

  const addItem = async () => {
    if (!user) return;

    const ref = doc(db, 'continueWatching', user.uid);
    await setDoc(ref, {
      items: [
        {
          id: 'test123',
          media_type: 'movie',
          media_id: 123,
          title: 'Test Movie',
          backdrop_path: '/test.jpg',
          created_at: Timestamp.now(),
          watch_position: 1200,
          duration: 5400,
          season: null,
          episode: null
        },
      ],
    });

    console.log('Test item added');
  };

  return (
    <button onClick={addItem} className="p-2 bg-blue-600 text-white rounded">
      Add Test Item
    </button>
  );
};

export default AddTestItem;

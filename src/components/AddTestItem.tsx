// src/components/debug/AddTestItem.tsx

import React from 'react';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/firebase';
import { Button } from '@/components/ui/button';

const AddTestItem = () => {
  const { user } = useAuth();

  const handleAdd = async () => {
    alert('Button clicked');

    if (!user) {
      alert('User not authenticated');
      return;
    }

    try {
      const timestamp = Date.now(); // Use client timestamp instead

      const newItem = {
        id: 'test123',
        media_type: 'movie',
        media_id: 123,
        title: 'Test Movie',
        backdrop_path: '/xDMIl84Qo5Tsu62c9DGWhmPI67A.jpg',
        created_at: timestamp,
        watch_position: 1200,
        duration: 5400,
      };

      const docRef = doc(db, 'continueWatching', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const updatedItems = [newItem, ...(data.items || [])];
        await updateDoc(docRef, { items: updatedItems });
      } else {
        await setDoc(docRef, { items: [newItem] });
      }

      alert('Test item added successfully!');
    } catch (err) {
      alert('Error adding test item: ' + err.message);
    }
  };

  return (
    <div className="px-4 py-2">
      <Button onClick={handleAdd}>Add Test Continue Watching Item</Button>
    </div>
  );
};

export default AddTestItem;

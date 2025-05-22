import { db } from '@/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';

import { WatchHistoryItem } from '@/contexts/types/watch-history';

export const saveContinueWatching = async (
  userId: string,
  item: WatchHistoryItem
) => {
  const id = item.id; // assuming this is unique
  const ref = doc(db, 'users', userId, 'continueWatching', id);
  await setDoc(ref, item);
};

export const getContinueWatching = async (
  userId: string
): Promise<WatchHistoryItem[]> => {
  const colRef = collection(db, 'users', userId, 'continueWatching');
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data() as WatchHistoryItem);
};

export const deleteContinueWatching = async (userId: string, id: string) => {
  const ref = doc(db, 'users', userId, 'continueWatching', id);
  await deleteDoc(ref);
};

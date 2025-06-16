import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { getApp } from 'firebase/app';
import { WatchHistoryItem } from '@/contexts/types/watch-history';

const app = getApp();
const db = getFirestore(app);

export const getContinueWatching = async (userId: string, maxItems = 20): Promise<WatchHistoryItem[]> => {
  const ref = collection(db, 'continueWatching');
  const q = query(ref, where('user_id', '==', userId), orderBy('updated_at', 'desc'), limit(maxItems));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as WatchHistoryItem[];
};

export const setContinueWatching = async (userId: string, item: WatchHistoryItem) => {
  const ref = doc(db, 'continueWatching', item.id);
  await setDoc(ref, { ...item, user_id: userId, updated_at: new Date().toISOString() });
};

export const removeContinueWatching = async (userId: string, id: string) => {
  const ref = doc(db, 'continueWatching', id);
  await deleteDoc(ref);
};

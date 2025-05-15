import { useState, useEffect } from 'react';

const END_THRESHOLD_SECONDS = 30;

const ContinueWatching = () => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    try {
      console.log("ContinueWatching mounted");
      const raw = localStorage.getItem('vidLinkProgress') || '{}';
      console.log("Raw vidLinkProgress:", raw);
      const parsed = JSON.parse(raw);

      // Remove finished items
      let changed = false;
      Object.entries(parsed).forEach(([id, entry]: any) => {
        const watched = entry?.progress?.watched ?? 0;
        const duration = entry?.progress?.duration ?? 0;
        if (watched >= duration - END_THRESHOLD_SECONDS) {
          delete parsed[id];
          changed = true;
        }
      });

      if (changed) {
        localStorage.setItem('vidLinkProgress', JSON.stringify(parsed));
        console.log("Cleaned finished items from localStorage");
      }

      const filteredItems = Object.values(parsed);
      console.log("Filtered items to show:", filteredItems);

      setItems(filteredItems);
    } catch (e) {
      console.error("Error parsing vidLinkProgress:", e);
      setItems([]);
    }
  }, []);

  if (items.length === 0) return <div style={{color: "white", padding: "1rem"}}>No Continue Watching items found.</div>;

  return (
    <div style={{color: "white", padding: "1rem"}}>
      <h2>Continue Watching (Test)</h2>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.title} - Watched {Math.round(item.progress?.watched ?? 0)} / {Math.round(item.progress?.duration ?? 0)} sec
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContinueWatching;

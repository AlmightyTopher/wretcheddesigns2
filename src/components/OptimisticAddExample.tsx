import React, { useState } from 'react';

interface Item {
  id: string;
  name: string;
}

const OptimisticAddExample: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    setLoading(true);
    setError(null);

    const newItem: Item = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      name: newItemName,
    };

    // Optimistically add the new item to the list
    setItems(prevItems => [...prevItems, newItem]);
    setNewItemName('');

    try {
      // Simulate API call
      const response = await fetch('/api/add-item', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem.name }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item on server');
      }

      const result = await response.json();
      // If successful, replace the temporary item with the actual item from the server
      setItems(prevItems =>
        prevItems.map(item => (item.id === newItem.id ? result.item : item))
      );
    } catch (err: any) {
      // If API call fails, roll back the optimistic update
      setItems(prevItems => prevItems.filter(item => item.id !== newItem.id));
      setError(err.message || 'An error occurred while adding the item.');
      setNewItemName(newItem.name); // Restore input value
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Optimistic Add Example</h2>
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="New item name"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Item'}
        </button>
      </form>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <ul>
        {items.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default OptimisticAddExample;
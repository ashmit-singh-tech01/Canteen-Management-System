import { useEffect, useState } from 'react';

export default function Admin() {
  const [menu, setMenu] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', price: '' });
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');

  const fetchMenu = () => {
    fetch('http://127.0.0.1:8000/api/menu')
      .then(res => res.json())
      .then(data => setMenu(data));
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return;
    
    await fetch('http://127.0.0.1:8000/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    setNewItem({ name: '', price: '' });
    fetchMenu();
  };

  const updateItem = async (id) => {
    await fetch(`http://127.0.0.1:8000/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, price: editPrice })
    });
    setEditingId(null);
    fetchMenu();
  };

  const deleteItem = async (id) => {
    if (confirm('Delete this item?')) {
      await fetch(`http://127.0.0.1:8000/api/menu/${id}`, {
        method: 'DELETE'
      });
      fetchMenu();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🔧 Admin Panel - Manage Menu</h1>

      {/* ADD FORM */}
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '30px' }}>
        <h2>Add New Item</h2>
        <input 
          type="text" 
          placeholder="Item Name" 
          value={newItem.name}
          onChange={(e) => setNewItem({...newItem, name: e.target.value})}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input 
          type="number" 
          placeholder="Price" 
          value={newItem.price}
          onChange={(e) => setNewItem({...newItem, price: e.target.value})}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button onClick={addItem} style={{ background: 'blue', color: 'white', padding: '5px 15px', border: 'none', cursor: 'pointer' }}>
          Add
        </button>
      </div>

      {/* MENU LIST */}
      <h2>Current Menu</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>ID</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Name</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Price</th>
            <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.map(item => (
            <tr key={item.id}>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.id}</td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {editingId === item.id ? (
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                ) : (
                  item.name
                )}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {editingId === item.id ? (
                  <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                ) : (
                  `₹${item.price}`
                )}
              </td>
              <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                {editingId === item.id ? (
                  <button onClick={() => updateItem(item.id)} style={{ marginRight: '5px', cursor: 'pointer' }}>Save</button>
                ) : (
                  <button onClick={() => {
                    setEditingId(item.id);
                    setEditName(item.name);
                    setEditPrice(item.price);
                  }} style={{ marginRight: '5px', cursor: 'pointer' }}>Edit</button>
                )}
                <button onClick={() => deleteItem(item.id)} style={{ background: 'red', color: 'white', border: 'none', padding: '3px 8px', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
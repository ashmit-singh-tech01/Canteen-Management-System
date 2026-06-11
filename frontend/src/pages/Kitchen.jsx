import { useEffect, useState } from 'react';

export default function Kitchen() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = () => {
    fetch('http://127.0.0.1:8000/api/orders')
      .then(res => res.json())
      .then(data => setOrders(data));
  };

  useEffect(() => {
    fetchOrders();
    setInterval(fetchOrders, 3000);
  }, []);

  const updateStatus = async (id, newStatus) => {
    await fetch(`http://127.0.0.1:8000/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders();
  };

  const pending = orders.filter(o => o.status === 'pending');
  const cooking = orders.filter(o => o.status === 'cooking');
  const ready = orders.filter(o => o.status === 'ready');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>👨‍🍳 Kitchen Dashboard</h1>

      {/* PENDING */}
      <div style={{ marginBottom: '30px' }}>
        <h2>📋 Pending ({pending.length})</h2>
        {pending.map(order => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <strong>Order #{order.id}</strong> - {order.customer_name}
            <ul>
              {order.items?.map(item => (
                <li key={item.id}>{item.menu_item?.name} x {item.quantity}</li>
              ))}
            </ul>
            <button onClick={() => updateStatus(order.id, 'cooking')} style={{ background: 'blue', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
              Start Cooking
            </button>
          </div>
        ))}
      </div>

      {/* COOKING */}
      <div style={{ marginBottom: '30px' }}>
        <h2>🔥 Cooking ({cooking.length})</h2>
        {cooking.map(order => (
          <div key={order.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <strong>Order #{order.id}</strong> - {order.customer_name}
            <ul>
              {order.items?.map(item => (
                <li key={item.id}>{item.menu_item?.name} x {item.quantity}</li>
              ))}
            </ul>
            <button onClick={() => updateStatus(order.id, 'ready')} style={{ background: 'green', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
              Done
            </button>
          </div>
        ))}
      </div>

      {/* READY */}
      <div>
        <h2>✅ Ready ({ready.length})</h2>
        {ready.map(order => (
          <div key={order.id} style={{ border: '1px solid green', padding: '10px', marginBottom: '10px', background: '#e8f5e9' }}>
            <strong>Order #{order.id}</strong> - {order.customer_name}
            <ul>
              {order.items?.map(item => (
                <li key={item.id}>{item.menu_item?.name} x {item.quantity}</li>
              ))}
            </ul>
            <span>✅ Ready for pickup</span>
          </div>
        ))}
      </div>
    </div>
  );
}
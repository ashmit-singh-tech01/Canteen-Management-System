import { useEffect, useState } from 'react';

export default function Counter() {
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quickCart, setQuickCart] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);

  // Fetch menu and orders
  useEffect(() => {
    fetchMenu();
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMenu = async () => {
    const res = await fetch('http://127.0.0.1:8000/api/menu');
    const data = await res.json();
    setMenu(data);
  };

  const fetchOrders = async () => {
    const res = await fetch('http://127.0.0.1:8000/api/orders');
    const data = await res.json();
    setOrders(data);
  };

  const updateStatus = async (orderId, newStatus) => {
    await fetch(`http://127.0.0.1:8000/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchOrders();
  };

  // Helper to check if item is quick (instant)
  const isQuickItem = (itemName) => {
    const quickItems = [
      'Tea', 'Coffee', 'Cold Drink', 'Samosa', 'Bread Pakoda', 
      'Maggi', 'Lassi', 'Cold Coffee', 'Masala Chai', 'Lemon Soda',
      'Chips', 'Biscuit', 'Cake', 'Pastry', 'Cookie', 'Brownie',
      'Ice Cream', 'Juice', 'Shake', 'Smoothie', 'Water Bottle',
      'Soft Drink', 'Coke', 'Pepsi', 'Sprite', 'Fanta', 'Noodles',
      'Sandwich', 'Toast', 'Pakora', 'Vada', 'Idli', 'Dosa'
    ];
    return quickItems.some(name => itemName?.toLowerCase().includes(name.toLowerCase()));
  };

  // ========== CASH COUNTER CART ==========
  const addToQuickOrder = (item) => {
    setQuickCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const removeFromQuickOrder = (itemId) => {
    setQuickCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] <= 1) {
        delete newCart[itemId];
      } else {
        newCart[itemId] -= 1;
      }
      return newCart;
    });
  };

  const quickTotal = () => {
    return Object.entries(quickCart).reduce((sum, [id, qty]) => {
      const item = menu.find(i => i.id == id);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  // Process cash order - Quick items skip kitchen flow
  const processQuickOrder = async () => {
    if (Object.keys(quickCart).length === 0) {
      alert('Please add items to order');
      return;
    }

    // Check if ALL items are quick items
    const allItemsAreQuick = Object.keys(quickCart).every(id => {
      const item = menu.find(i => i.id == id);
      return isQuickItem(item?.name);
    });

    // For big items, need name & phone
    const hasBigItems = !allItemsAreQuick;
    
    let finalName = customerName;
    let finalPhone = customerPhone;

    if (hasBigItems) {
      if (!customerName.trim()) {
        alert('Please enter customer name for this order');
        return;
      }
      if (!customerPhone.trim() || customerPhone.length !== 10) {
        alert('Please enter valid 10-digit phone number');
        return;
      }
    } else {
      // All quick items - use defaults
      finalName = customerName.trim() || 'Walk-in Customer';
      finalPhone = customerPhone.trim() || '0000000000';
    }

    // Determine final status
    // Quick items → 'completed' (skip kitchen)
    // Big items → 'pending' (go to kitchen)
    const finalStatus = allItemsAreQuick ? 'completed' : 'pending';

    const orderData = {
      customer_name: finalName,
      phone: finalPhone,
      status: finalStatus,
      items: Object.entries(quickCart).map(([menu_item_id, quantity]) => ({
        menu_item_id: parseInt(menu_item_id),
        quantity: quantity
      }))
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (allItemsAreQuick) {
          alert(`✅ Order #${data.id} completed!\nTotal: ₹${quickTotal()}\nGive food to customer immediately.`);
        } else {
          alert(`✅ Order #${data.id} placed!\nTotal: ₹${quickTotal()}\nGive token to customer. Kitchen will prepare.`);
        }
        
        setQuickCart({});
        setCustomerName('');
        setCustomerPhone('');
        setShowCart(false);
        fetchOrders();
      } else {
        alert('Failed to process order');
      }
    } catch (error) {
      console.error('Quick order error:', error);
      alert('Error processing order');
    }
  };

  // Filter menu based on search and category
  const categories = [...new Set(menu.map(item => item.category || 'meals'))];
  const filteredMenu = menu.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const readyOrders = orders.filter(o => o.status === 'ready');
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  const completedOrders = orders.filter(o => o.status === 'completed');

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      <h1 style={{ color: '#e67e22', marginBottom: '20px' }}>💰 Counter Dashboard</h1>

      {/* ========== CASH COUNTER SECTION - FULL MENU ========== */}
      <div style={{ 
        background: '#fff3e6', 
        padding: '20px', 
        borderRadius: '12px', 
        marginBottom: '30px',
        border: '2px solid #ff9800'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ marginTop: 0, color: '#e67e22' }}>💵 Cash Counter - Create Order</h2>
          {Object.keys(quickCart).length > 0 && (
            <button 
              onClick={() => setShowCart(true)}
              style={{ background: '#ff9800', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              🛒 View Cart ({Object.values(quickCart).reduce((a,b)=>a+b,0)} items)
            </button>
          )}
        </div>
        
        <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
          ⚡ <strong>Quick items</strong> (Tea, Coffee, Samosa, Chips) → No name/phone needed, Give food immediately
          <br />🍽️ <strong>Meals/Biryani</strong> → Customer must provide name & phone, Give token
        </p>

        {/* Customer Details for Big Items */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Customer Name (required for meals/big items)"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
          <input
            type="tel"
            placeholder="Phone Number (required for meals/big items)"
            maxLength="10"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </div>

        {/* Search & Category Filters */}
        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="🔍 Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 2, padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* FULL MENU GRID */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', 
          gap: '12px', 
          marginBottom: '20px',
          maxHeight: '450px',
          overflowY: 'auto',
          padding: '10px'
        }}>
          {filteredMenu.map(item => (
            <div key={item.id} style={{ 
              border: isQuickItem(item.name) ? '2px solid #ff9800' : '1px solid #ddd', 
              padding: '12px', 
              borderRadius: '8px', 
              background: 'white',
              textAlign: 'center',
              position: 'relative',
              cursor: 'pointer'
            }}>
              {isQuickItem(item.name) && (
                <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ff9800', color: 'white', fontSize: '10px', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold' }}>
                  ⚡ Instant
                </span>
              )}
              <div style={{ fontSize: '36px' }}>{isQuickItem(item.name) ? '⚡' : '🍽️'}</div>
              <strong>{item.name}</strong>
              <br />₹{item.price}
              <br />
              <button 
                onClick={() => addToQuickOrder(item)} 
                style={{ 
                  background: isQuickItem(item.name) ? '#ff9800' : '#e67e22', 
                  color: 'white', 
                  border: 'none', 
                  padding: '6px 12px', 
                  borderRadius: '5px', 
                  marginTop: '8px', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                + Add to Bill
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ========== CART MODAL ========== */}
      {showCart && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }} onClick={() => setShowCart(false)}></div>
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: '20px 20px 0 0',
            zIndex: 401,
            maxHeight: '80vh',
            overflow: 'auto',
            padding: '20px',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>🧾 Current Bill</h2>
              <button onClick={() => setShowCart(false)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
            </div>
            
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              {Object.entries(quickCart).map(([id, qty]) => {
                const item = menu.find(i => i.id == id);
                return (
                  <div key={id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '10px', borderBottom: '1px solid #eee' }}>
                    <div>
                      <strong>{item?.name}</strong>
                      {isQuickItem(item?.name) && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#ff9800', color: 'white', padding: '2px 6px', borderRadius: '20px' }}>Instant</span>}
                      <br />x{qty}
                    </div>
                    <div>₹{item?.price * qty}</div>
                    <button onClick={() => removeFromQuickOrder(parseInt(id))} style={{ background: '#ff5722', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                  </div>
                );
              })}
            </div>
            
            <hr />
            <div style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <span>Total:</span>
              <span>₹{quickTotal()}</span>
            </div>
            
            <button 
              onClick={processQuickOrder} 
              style={{ 
                width: '100%',
                background: '#4CAF50', 
                color: 'white', 
                padding: '15px', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              💵 Collect Payment & Complete
            </button>
          </div>
        </>
      )}

      {/* ========== ONLINE ORDERS SECTION ========== */}
      <h2 style={{ marginTop: '30px' }}>📱 Orders Management</h2>
      
      {/* PENDING ORDERS */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#e67e22' }}>⏳ Pending ({pendingOrders.length})</h3>
        {pendingOrders.length === 0 ? <p>No pending orders</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff8e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong>Order #{order.id}</strong> - {order.customer_name}
                    <br /><small>📞 {order.phone}</small>
                  </div>
                  <button onClick={() => updateStatus(order.id, 'cooking')} style={{ background: '#2196F3', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Start Cooking
                  </button>
                </div>
                <div style={{ marginTop: '10px' }}>
                  {order.items?.map(item => (
                    <div key={item.id}>🍽️ {item.menu_item?.name} x {item.quantity}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COOKING ORDERS */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#2196F3' }}>🔥 Cooking ({cookingOrders.length})</h3>
        {cookingOrders.length === 0 ? <p>No orders being cooked</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {cookingOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#e3f2fd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong>Order #{order.id}</strong> - {order.customer_name}
                    <br /><small>📞 {order.phone}</small>
                  </div>
                  <button onClick={() => updateStatus(order.id, 'ready')} style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Done (Ready)
                  </button>
                </div>
                <div style={{ marginTop: '10px' }}>
                  {order.items?.map(item => (
                    <div key={item.id}>🍽️ {item.menu_item?.name} x {item.quantity}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* READY ORDERS */}
      <div style={{ marginBottom: '30px' }}>
        <h3 style={{ color: '#4CAF50' }}>✅ Ready for Pickup ({readyOrders.length})</h3>
        {readyOrders.length === 0 ? <p>No ready orders</p> : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {readyOrders.map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#e8f5e9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <strong>Order #{order.id}</strong> - {order.customer_name}
                    <br /><small>📞 {order.phone}</small>
                  </div>
                  <button onClick={() => updateStatus(order.id, 'completed')} style={{ background: '#9C27B0', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
                    Complete Order
                  </button>
                </div>
                <div style={{ marginTop: '10px' }}>
                  {order.items?.map(item => (
                    <div key={item.id}>🍽️ {item.menu_item?.name} x {item.quantity}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPLETED ORDERS (Recent) */}
      {completedOrders.length > 0 && (
        <div>
          <h3 style={{ color: '#888' }}>✅ Completed Orders ({completedOrders.length})</h3>
          <div style={{ display: 'grid', gap: '10px', maxHeight: '300px', overflow: 'auto' }}>
            {completedOrders.slice(-10).reverse().map(order => (
              <div key={order.id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '8px', background: '#f5f5f5' }}>
                <strong>Order #{order.id}</strong> - {order.customer_name} - ₹{order.total_amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
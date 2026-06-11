import { useEffect, useState } from 'react';

export default function Customer() {
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentCat, setCurrentCat] = useState('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch menu from backend
  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/menu')
      .then(res => res.json())
      .then(data => {
        const itemsWithDetails = data.map(item => ({
          ...item,
          category: getCategory(item.name),
          emoji: getEmoji(item.name),
          description: `${item.name} - Freshly prepared with quality ingredients`,
          isQuickItem: isQuickItem(item.name)
        }));
        setMenu(itemsWithDetails);
      })
      .catch(err => console.error('Error fetching menu:', err));
  }, []);

  // Helper to determine if item is a quick item (instant takeaway)
  const isQuickItem = (name) => {
    const quickItems = ['Tea', 'Coffee', 'Cold Drink', 'Samosa', 'Bread Pakoda', 'Maggi', 'Lassi', 'Cold Coffee', 'Masala Chai'];
    return quickItems.some(item => name.toLowerCase().includes(item.toLowerCase()));
  };

  // Helper to determine category
  const getCategory = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('biryani') || nameLower.includes('dosa') || nameLower.includes('paneer') || nameLower.includes('chole')) return 'meals';
    if (nameLower.includes('samosa') || nameLower.includes('sandwich') || nameLower.includes('maggi') || nameLower.includes('tikki') || nameLower.includes('pakoda')) return 'snacks';
    if (nameLower.includes('chai') || nameLower.includes('coffee') || nameLower.includes('lassi') || nameLower.includes('soda')) return 'beverages';
    if (nameLower.includes('gulab') || nameLower.includes('ice cream') || nameLower.includes('rasgulla')) return 'desserts';
    return 'meals';
  };

  // Helper to get emoji
  const getEmoji = (name) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('biryani')) return '🍛';
    if (nameLower.includes('chicken')) return '🍗';
    if (nameLower.includes('paneer')) return '🧀';
    if (nameLower.includes('dosa')) return '🫓';
    if (nameLower.includes('samosa')) return '🥟';
    if (nameLower.includes('sandwich')) return '🥪';
    if (nameLower.includes('maggi')) return '🍜';
    if (nameLower.includes('chai')) return '☕';
    if (nameLower.includes('coffee')) return '🥤';
    if (nameLower.includes('ice cream')) return '🍦';
    if (nameLower.includes('tea')) return '🍵';
    if (nameLower.includes('cold drink')) return '🥤';
    return '🍽️';
  };

  // Cart functions
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  
  const cartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = menu.find(i => i.id == id);
      return sum + (item?.price || 0) * qty;
    }, 0);
  };

  const addToCart = (itemId) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] <= 1) {
        delete newCart[itemId];
      } else {
        newCart[itemId] -= 1;
      }
      return newCart;
    });
  };

  const updateCart = (itemId, delta) => {
    if (delta > 0) {
      addToCart(itemId);
    } else {
      removeFromCart(itemId);
    }
  };

  // Filter menu
  const filteredMenu = menu.filter(item => {
    const catMatch = currentCat === 'all' || item.category === currentCat;
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && searchMatch;
  });

  const quickItems = menu.filter(item => item.isQuickItem);

  // Place order
  const placeOrder = async () => {
    if (!customerName.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length !== 10 || !/^[6-9]/.test(customerPhone)) {
      alert('Please enter a valid 10-digit mobile number starting with 6,7,8,9');
      return;
    }
    if (cartCount() === 0) {
      alert('Your cart is empty');
      return;
    }

    setIsProcessing(true);

    const orderData = {
      customer_name: customerName,
      phone: customerPhone,
      note: customerNote,
      items: Object.entries(cart).map(([menu_item_id, quantity]) => ({
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

      const data = await response.json();

      if (response.ok) {
        setOrderId(data.id);
        setShowSuccess(true);
        setCart({});
        setCustomerName('');
        setCustomerPhone('');
        setCustomerNote('');
        setIsCartOpen(false);
      } else {
        alert('Failed to place order: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Error placing order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const closeModal = () => {
    setShowSuccess(false);
    setOrderId(null);
  };

  const total = cartTotal();
  const gst = total * 0.05;
  const grandTotal = total + gst;

  // Categories for filter buttons
  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'meals', name: 'Meals', icon: '🍛' },
    { id: 'snacks', name: 'Snacks', icon: '🥪' },
    { id: 'beverages', name: 'Beverages', icon: '☕' },
    { id: 'desserts', name: 'Desserts', icon: '🍮' }
  ];

  return (
    <div style={{ fontFamily: 'DM Sans, sans-serif', background: '#faf8f4', minHeight: '100vh' }}>
      {/* HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(250,248,244,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e8e2d8',
        padding: '0 20px'
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', background: '#f4600c', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
              🍽️
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 900 }}>Smart Canteen</div>
              <div style={{ fontSize: '10px', fontWeight: 500, color: '#7a6e5f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Order Food Online</div>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(true)} style={{
            background: '#f4600c',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}>
            🛒 Cart
            <span style={{
              background: 'white',
              color: '#f4600c',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>{cartCount()}</span>
          </button>
        </div>
      </header>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #1a1208 0%, #3d2a0e 60%, #6b3d0f 100%)',
        padding: '52px 20px 48px',
        textAlign: 'center'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(244,96,12,0.2)', border: '1px solid rgba(244,96,12,0.4)', color: '#ffb380', borderRadius: '50px', padding: '6px 14px', fontSize: '12px', fontWeight: 600, marginBottom: '16px' }}>
            🟢 Canteen is Open
          </div>
          <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(32px, 7vw, 56px)', fontWeight: 900, color: 'white', marginBottom: '12px' }}>
            Order Fresh,<br /><span style={{ color: '#f4600c' }}>Skip the Queue</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '360px', margin: '0 auto' }}>Browse our menu, add to cart, and get your token instantly!</p>
        </div>
      </section>

      {/* SEARCH */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#7a6e5f' }}>🔍</span>
          <input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', background: 'white', border: '2px solid #e8e2d8', borderRadius: '18px', padding: '14px 18px 14px 48px', fontSize: '15px', outline: 'none' }}
          />
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCurrentCat(cat.id)}
              style={{
                flexShrink: 0,
                background: currentCat === cat.id ? '#f4600c' : 'white',
                border: `2px solid ${currentCat === cat.id ? '#f4600c' : '#e8e2d8'}`,
                borderRadius: '50px',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                color: currentCat === cat.id ? 'white' : '#7a6e5f',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* MENU GRID */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px 120px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredMenu.map(item => (
            <div key={item.id} style={{ background: 'white', borderRadius: '18px', border: '1px solid #e8e2d8', overflow: 'hidden', transition: 'transform 0.25s' }}>
              <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', background: '#f5f2ec' }}>
                {item.emoji}
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '17px', fontWeight: 700 }}>{item.name}</div>
                  <div style={{ width: '18px', height: '18px', border: `2px solid ${item.veg ? '#2d9e6b' : '#e53e3e'}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '8px', height: '8px', background: item.veg ? '#2d9e6b' : '#e53e3e', borderRadius: '50%' }}></div>
                  </div>
                </div>
                <div style={{ fontSize: '12.5px', color: '#7a6e5f', marginBottom: '14px' }}>₹{item.price}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '20px', fontWeight: 700, color: '#f4600c' }}>₹{item.price}</div>
                  {!item.availability ? (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#e53e3e', background: '#fff0f0', border: '1px solid #ffc5c5', borderRadius: '50px', padding: '4px 10px' }}>Not Available</span>
                  ) : cart[item.id] ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff1ea', border: '2px solid #f4600c', borderRadius: '10px', padding: '4px 8px' }}>
                      <button onClick={() => updateCart(item.id, -1)} style={{ width: '26px', height: '26px', background: '#f4600c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>-</button>
                      <span style={{ fontWeight: 700, color: '#f4600c', minWidth: '20px', textAlign: 'center' }}>{cart[item.id]}</span>
                      <button onClick={() => updateCart(item.id, 1)} style={{ width: '26px', height: '26px', background: '#f4600c', color: 'white', border: 'none', borderRadius: '6px', fontSize: '16px', fontWeight: 700, cursor: 'pointer' }}>+</button>
                    </div>
                  ) : (
                    <button onClick={() => updateCart(item.id, 1)} style={{ background: '#fff1ea', color: '#f4600c', border: '2px solid #f4600c', borderRadius: '10px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>+ Add</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* QUICK BITES SECTION - Instant Takeaway */}
        {quickItems.length > 0 && (
          <div style={{ 
            marginTop: '60px', 
            background: '#fff8f0', 
            borderRadius: '18px', 
            padding: '24px', 
            border: '1px solid #ffe0b3' 
          }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              ⚡ Quick Bites
            </h2>
            <p style={{ color: '#7a6e5f', marginBottom: '20px', fontSize: '13px' }}>
              Instant takeaways - No waiting, pay at counter and take immediately!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
              {quickItems.map(item => (
                <div key={item.id} style={{ 
                  border: '1px solid #ffe0b3', 
                  borderRadius: '12px', 
                  padding: '15px', 
                  textAlign: 'center', 
                  background: 'white',
                  transition: 'transform 0.2s'
                }}>
                  <div style={{ fontSize: '40px' }}>{item.emoji}</div>
                  <div style={{ fontWeight: 'bold', marginTop: '8px' }}>{item.name}</div>
                  <div style={{ color: '#f4600c', fontWeight: 'bold', fontSize: '18px', marginTop: '5px' }}>₹{item.price}</div>
                  <button 
                    onClick={() => updateCart(item.id, 1)}
                    style={{ 
                      background: '#ff9800', 
                      color: 'white', 
                      border: 'none', 
                      padding: '8px 16px', 
                      borderRadius: '8px', 
                      marginTop: '10px', 
                      cursor: 'pointer',
                      width: '100%',
                      fontWeight: 600
                    }}
                  >
                    + Add to Cart
                  </button>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
              🏃 Quick items - Add to cart and pay at counter for instant pickup
            </p>
          </div>
        )}
      </section>

      {/* CART DRAWER */}
      {isCartOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} onClick={() => setIsCartOpen(false)}></div>
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'white',
            borderRadius: '28px 28px 0 0',
            zIndex: 300,
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            <div style={{ width: '40px', height: '4px', background: '#e8e2d8', borderRadius: '2px', margin: '14px auto 0' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #e8e2d8' }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 700 }}>Your Cart 🛒</h2>
              <button onClick={() => setIsCartOpen(false)} style={{ width: '36px', height: '36px', background: '#f5f2ec', border: 'none', borderRadius: '50%', fontSize: '18px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {cartCount() === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
                  <p style={{ color: '#7a6e5f' }}>Your cart is empty.<br />Add something tasty!</p>
                </div>
              ) : (
                Object.entries(cart).map(([id, qty]) => {
                  const item = menu.find(i => i.id == id);
                  return (
                    <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid #e8e2d8' }}>
                      <div style={{ width: '48px', height: '48px', background: '#f5f2ec', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{item?.emoji || '🍽️'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{item?.name}</div>
                        {item?.isQuickItem && (
                          <div style={{ fontSize: '10px', color: '#ff9800', marginTop: '2px' }}>⚡ Instant item</div>
                        )}
                        <div style={{ fontSize: '13px', color: '#f4600c', fontWeight: 600 }}>₹{item?.price * qty}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button onClick={() => updateCart(parseInt(id), -1)} style={{ width: '28px', height: '28px', background: '#f5f2ec', border: '1px solid #e8e2d8', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>-</button>
                        <span style={{ fontWeight: 700, minWidth: '20px', textAlign: 'center' }}>{qty}</span>
                        <button onClick={() => updateCart(parseInt(id), 1)} style={{ width: '28px', height: '28px', background: '#f5f2ec', border: '1px solid #e8e2d8', borderRadius: '8px', fontSize: '16px', cursor: 'pointer' }}>+</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {cartCount() > 0 && (
              <>
                <div style={{ padding: '16px 20px', borderTop: '1px solid #e8e2d8' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>📋 Your Details</div>
                  <input
                    type="text"
                    placeholder="Your Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    style={{ width: '100%', background: '#f5f2ec', border: '2px solid #e8e2d8', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', outline: 'none' }}
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number * (10 digits)"
                    maxLength="10"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    style={{ width: '100%', background: '#f5f2ec', border: '2px solid #e8e2d8', borderRadius: '10px', padding: '12px 14px', marginBottom: '10px', outline: 'none' }}
                  />
                  {customerPhone && customerPhone.length !== 10 && customerPhone.length > 0 && (
                    <p style={{ color: '#e53e3e', fontSize: '11px', marginTop: '-8px', marginBottom: '8px' }}>⚠️ Phone number must be 10 digits</p>
                  )}
                  <textarea
                    rows="2"
                    placeholder="Special instructions (optional)"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    style={{ width: '100%', background: '#f5f2ec', border: '2px solid #e8e2d8', borderRadius: '10px', padding: '12px 14px', outline: 'none', resize: 'none', fontFamily: 'inherit' }}
                  ></textarea>
                </div>

                <div style={{ padding: '12px 20px', background: '#f5f2ec' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7a6e5f', marginBottom: '6px' }}>
                    <span>Subtotal</span><span>₹{total}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#7a6e5f', marginBottom: '6px' }}>
                    <span>GST (5%)</span><span>₹{Math.round(gst)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e8e2d8' }}>
                    <span>Total</span><span>₹{Math.round(grandTotal)}</span>
                  </div>
                </div>

                <div style={{ padding: '16px 20px 24px' }}>
                  <button
                    onClick={placeOrder}
                    disabled={isProcessing}
                    style={{
                      width: '100%',
                      background: '#f4600c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '18px',
                      padding: '16px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: isProcessing ? 'not-allowed' : 'pointer',
                      opacity: isProcessing ? 0.6 : 1
                    }}
                  >
                    {isProcessing ? 'Processing...' : `🚀 Place Order · ₹${Math.round(grandTotal)}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,18,8,0.6)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(6px)' }}>
          <div style={{ background: 'white', borderRadius: '28px', padding: '40px 32px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', background: '#e8f7f1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 20px' }}>✅</div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '26px', fontWeight: 900, marginBottom: '8px' }}>Order Placed!</h2>
            <p style={{ color: '#7a6e5f', fontSize: '14px', marginBottom: '20px' }}>Your order has been received. The kitchen will prepare it shortly.</p>
            <div style={{ background: '#fff1ea', border: '2px dashed #f4600c', borderRadius: '18px', padding: '16px', marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#7a6e5f' }}>Order ID</div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', fontWeight: 900, color: '#f4600c' }}>#{orderId}</div>
              <div style={{ fontSize: '12px', color: '#7a6e5f' }}>Est. wait: ~5 minutes</div>
            </div>
            <button onClick={closeModal} style={{ width: '100%', background: '#f4600c', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>🏠 Back to Menu</button>
          </div>
        </div>
      )}
    </div>
  );
}
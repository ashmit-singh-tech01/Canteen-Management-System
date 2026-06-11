import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Optional: You can add analytics or tracking here
    console.log('Payment successful for order:', orderId);
  }, [orderId]);

  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '100px auto', 
      textAlign: 'center', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #4CAF50',
      borderRadius: '8px',
      backgroundColor: '#f0fff0'
    }}>
      <div style={{ fontSize: '80px' }}>✅</div>
      <h1 style={{ color: '#4CAF50' }}>Payment Successful!</h1>
      <p>Your order #{orderId} has been placed successfully.</p>
      <p>You will receive an SMS when your order is ready for pickup.</p>
      <Link to="/">
        <button style={{ 
          background: '#4CAF50', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px', 
          marginTop: '20px', 
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Continue Ordering
        </button>
      </Link>
    </div>
  );
}
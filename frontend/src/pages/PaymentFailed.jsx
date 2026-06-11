import { Link } from 'react-router-dom';

export default function PaymentFailed() {
  return (
    <div style={{ 
      maxWidth: '500px', 
      margin: '100px auto', 
      textAlign: 'center', 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      border: '1px solid #f44336',
      borderRadius: '8px',
      backgroundColor: '#fff0f0'
    }}>
      <div style={{ fontSize: '80px' }}>❌</div>
      <h1 style={{ color: '#f44336' }}>Payment Failed!</h1>
      <p>Your payment could not be processed. Please try again.</p>
      <p>Possible reasons:</p>
      <ul style={{ textAlign: 'left', display: 'inline-block' }}>
        <li>Insufficient funds</li>
        <li>Invalid card details</li>
        <li>Network issue</li>
      </ul>
      <br />
      <Link to="/">
        <button style={{ 
          background: '#ff9800', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px', 
          marginTop: '20px', 
          marginRight: '10px',
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Try Again
        </button>
      </Link>
      <Link to="/">
        <button style={{ 
          background: '#666', 
          color: 'white', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '4px', 
          marginTop: '20px', 
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          Back to Menu
        </button>
      </Link>
    </div>
  );
}
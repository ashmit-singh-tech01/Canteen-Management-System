const CASHFREE_APP_ID = 'YOUR_CASHFREE_APP_ID'; // Get from Cashfree Dashboard
const CASHFREE_SECRET = 'YOUR_CASHFREE_SECRET'; // Get from Cashfree Dashboard
const MODE = 'sandbox'; // Change to 'production' for live

export const createCashfreeOrder = async (orderData) => {
    const response = await fetch('http://127.0.0.1:8000/api/cashfree/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });
    return response.json();
};

export const verifyPayment = async (orderId) => {
    const response = await fetch('http://127.0.0.1:8000/api/cashfree/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId })
    });
    return response.json();
};
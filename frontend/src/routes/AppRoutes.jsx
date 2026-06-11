import { Routes, Route } from 'react-router-dom';
import Customer from '../pages/Customer';
import Kitchen from '../pages/Kitchen';
import Counter from '../pages/Counter';
import Admin from '../pages/Admin';
import PaymentSuccess from '../pages/PaymentSuccess';
import PaymentFailed from '../pages/PaymentFailed';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Customer />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="/kitchen" element={<Kitchen />} />
      <Route path="/counter" element={<Counter />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />
    </Routes>
  );
}
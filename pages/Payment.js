import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Payment.css';

function Payment() {
  const [form, setForm] = useState({
    name: '',
    address: '',
    pincode: '',
    street: '',
    paymentMethod: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.paymentMethod === "GPay") {
      // Replace with your UPI ID and details
      const upiLink = `upi://pay?pa=your-upi-id@okicici&pn=CraftHub&am=1&cu=INR`;
      window.location.href = upiLink;
      setTimeout(() => navigate('/order-confirmation'), 2000); // Give time for GPay to open
    } else {
      navigate('/order-confirmation');
    }
  };

  return (  
    <div className="payment-container">
      <h2>Checkout</h2>
      <form className="payment-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>
          Address
          <textarea name="address" value={form.address} onChange={handleChange} required />
        </label>
        <label>
          Pincode
          <input name="pincode" value={form.pincode} onChange={handleChange} required maxLength={6} />
        </label>
        <label>
          Street
          <input name="street" value={form.street} onChange={handleChange} required />
        </label>
        <label>
          Payment Method
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="Paytm">Paytm</option>
            <option value="GPay">GPay</option>
            <option value="Cash on Delivery">Cash on Delivery</option>
          </select>
        </label>
        <button type="submit" className="place-order-btn">Place Order</button>
      </form>
    </div>
  );
}

export default Payment;
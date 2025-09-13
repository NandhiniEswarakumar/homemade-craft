import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';

const Cart = ({ cartItems, onUpdateQuantity, onRemoveItem, onBuyNow, onAddToCart }) => {
  const navigate = useNavigate();

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map(item => (
            <div className="cart-item" key={item.id}>
              <img
                src={item.image}
                alt={item.name || item.title}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div className="cart-item__info">
                <h3>{item.title || item.name}</h3>
                <p>₹{item.price.toFixed(2)}</p>
                <div className="cart-item__controls">
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} disabled={item.quantity === 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
                  <button className="cart-item__remove" onClick={() => onRemoveItem(item.id)}>Remove</button>
                </div>
              </div>
            </div>
          ))}
          <div className="cart-total">
            <strong>Total: ₹{getTotal().toFixed(2)}</strong>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
        <button
          className="go-back-btn"
          onClick={() => navigate('/products')}
        >
          Go Back to Products
        </button>
        <button
          className="buy-now-btn"
          onClick={onBuyNow}
          disabled={cartItems.length === 0}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
};

export default Cart;

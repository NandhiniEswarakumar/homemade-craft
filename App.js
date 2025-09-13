import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages';
import { Link } from 'react-router-dom';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Signup from './pages/Signup';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from "./pages/forgetpassword";
import About from './pages/About';
import Contact from './pages/Contact';
import axios from 'axios';
import './App.css';

const USER_STORAGE_KEY = "crafthub_user";
const API_BASE = 'http://localhost:5001';

function App() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);

  // Use the real user ID if logged in, otherwise undefined
  const userId = user?.id; // backend returns `id`

  // Hydrate user from localStorage on app start
  useEffect(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to hydrate user:', e);
    }
  }, []);

  // Save cart to backend whenever it changes and user is logged in
  const saveCartToBackend = async (userId, items) => {
    if (!userId) return;
    try {
      await axios.post(`${API_BASE}/api/cart/save`, { userId, items });
    } catch (err) {
      console.error('Failed to save cart:', err);
    }
  };

  // Load cart from backend on login
  useEffect(() => {
    if (!userId) return;
    const loadCartFromBackend = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/cart/${userId}`);
        setCartItems(res.data.items || []);
      } catch (err) {
        console.error('Failed to load cart:', err);
      }
    };
    loadCartFromBackend();
  }, [userId]);

  // Update cart handlers to only sync if user is logged in
  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item.id === product.id);
      let newCart;
      if (exists) {
        newCart = prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...prev, { ...product, quantity: 1 }];
      }
      saveCartToBackend(userId, newCart);
      return newCart;
    });
  };

  const handleUpdateQuantity = (id, quantity) => {
    setCartItems(prev => {
      const newCart = prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
      );
      saveCartToBackend(userId, newCart);
      return newCart;
    });
  };

  const handleRemoveItem = (id) => {
    setCartItems(prev => {
      const newCart = prev.filter(item => item.id !== id);
      saveCartToBackend(userId, newCart);
      return newCart;
    });
  };

  const handleSetUser = (userObj) => {
    setUser(userObj);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    setCartItems([]);
    localStorage.removeItem(USER_STORAGE_KEY);
  };

  useEffect(() => {
  if (!userId) return;
  const loadCartFromBackend = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/cart/${userId}`);
      setCartItems(res.data.items || []);
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  };
  loadCartFromBackend();
}, [userId]);
  // Save cart to backend on cartItems or user change




  return (
    <Router>
      <div className="homepage">
        {/* Header */}
        <header className="homepage-header">
          <div className="header-container">
            <div className="logo">
              <h1>🎨 CraftHub</h1>
              <p>Handmade with Love</p>
            </div>
            <nav className="nav-menu">
              <Link className="nav-link" to="/">Home</Link>
               <Link className="nav-link" to="/About">About</Link>
              <Link className="nav-link" to="/products">Products</Link>
              <Link className="nav-link" to="/cart">Cart</Link>
              <Link className="nav-link" to="/contact">Contact</Link>
            </nav>
            <div className="auth-buttons">
              {user ? (
                <>
                <span className="welcome-msg">
                Welcome, <span className="username-highlight">{user.username}</span>
                </span>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </>
              ) : (
                <>
                  <Link className="login-btn" to="/login">
                    Login
                  </Link>
                  <Link className="signup-btn" to="/signup">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products onAddToCart={handleAddToCart} />} />
            <Route path="/cart" element={<Cart cartItems={cartItems} onUpdateQuantity={handleUpdateQuantity} onRemoveItem={handleRemoveItem} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login setUser={handleSetUser} />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        {/* Footer */}
        <footer className="homepage-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>🎨 CraftHub</h3>
                <p>Connecting you with the world's finest handmade crafts since 2025.</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><button className="footer-link">About Us</button></li>
                  <li><button className="footer-link">How It Works</button></li>
                  <li><button className="footer-link">Artisan Program</button></li>
                  <li><button className="footer-link">Contact</button></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Categories</h4>
                <ul>
                  <li><button className="footer-link">Pottery</button></li>
                  <li><button className="footer-link">Textiles</button></li>
                  <li><button className="footer-link">Jewelry</button></li>
                  <li><button className="footer-link">Home Decor</button></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <button className="social-link">📘 Facebook</button>
                  <button className="social-link">📷 Instagram</button>
                  <button className="social-link">🐦 Twitter</button>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2025 CraftHub. All rights reserved. Made with ❤️ for artisans worldwide.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;

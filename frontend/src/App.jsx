import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import GameDetail from './pages/GameDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import SteamAccounts from './pages/SteamAccounts';
import SteamAccountDetail from './pages/SteamAccountDetail';
import Cart from './pages/Cart';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "915027856276-41dpec5j8s73178jkiojn5nd15pb5sh5.apps.googleusercontent.com"}>
      <Router>
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-1 w-full">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/games/:id" element={<GameDetail />} />
                  <Route path="/steam-accounts" element={<SteamAccounts />} />
                  <Route path="/steam-accounts/:id" element={<SteamAccountDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/cart" element={<Cart />} />
                </Routes>
              </main>
              <Footer />
              <MobileNav />
              <Toaster />
            </div>
          </CartProvider>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

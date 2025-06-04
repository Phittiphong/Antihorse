import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import Footer from '../components/Footer';
import Header from '../components/Header';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Update favicon
    const favicon = document.querySelector("link[rel='icon']") || document.createElement('link');
    favicon.type = 'image/png';
    favicon.rel = 'icon';
    favicon.href = '/images/antihorse.png';
    document.head.appendChild(favicon);
    
    // Update title
    document.title = 'Antihorse';
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-blue-700/20 backdrop-blur-3xl"></div>
      
      {/* Header */}
      <Header onLogout={handleLogout} />

      {/* Main Content */}
      <main className="relative">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout; 
import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLogout }) => {
  return (
    <header className="relative z-10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
              <img src="/images/antihorse.png" alt="Antihorse" className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-white">Antihorse</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-white/70 hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link to="/contact" className="text-white/70 hover:text-white transition-colors duration-200">
              Contact
            </Link>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;

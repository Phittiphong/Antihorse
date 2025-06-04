import React from 'react';

const Footer = () => {
  return (
    <footer className="relative border-t border-white/10 backdrop-blur-sm py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="ml-2 text-lg font-bold text-white">Whoscall</span>
            </div>
            <p className="text-white/70 text-sm">Protecting your calls, securing your conversations.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-white/70 hover:text-white transition-colors">Home</a></li>
              <li><a href="/about" className="text-white/70 hover:text-white transition-colors">About</a></li>
              <li><a href="/features" className="text-white/70 hover:text-white transition-colors">Features</a></li>
              <li><a href="/contact" className="text-white/70 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="/privacy" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="text-white/70 hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="/cookies" className="text-white/70 hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="text-white/70">support@whoscall.com</li>
              <li className="text-white/70">+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <p className="text-center text-white/70 text-sm">
            © {new Date().getFullYear()} Whoscall. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
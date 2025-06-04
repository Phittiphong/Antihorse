import React from 'react';
import MainLayout from '../layouts/MainLayout';

const Home = () => {
  return (
    <MainLayout>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to Antihorse</h1>
            <p className="text-white/70 text-lg mb-8">
              Your trusted platform for secure and reliable services.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Home; 
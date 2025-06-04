import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Contact from './pages/contact';
import About from './pages/about';
import Home from './pages/home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;


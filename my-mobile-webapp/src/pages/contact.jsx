import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';

const Contact = () => {
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: ''
  });

  const [submitStatus, setSubmitStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create a reference to the contact_us collection in Firebase
      const contactRef = ref(db, 'contact_us');
      
      // Add timestamp to the data
      const dataToSubmit = {
        ...formData,
        timestamp: new Date().toISOString()
      };

      // Push the data to Firebase
      await push(contactRef, dataToSubmit);
      
      setSubmitStatus({
        submitted: true,
        success: true,
        message: 'Thank you for your message! We will get back to you soon.'
      });

      // Clear form
      setFormData({
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus({
        submitted: true,
        success: false,
        message: 'There was an error sending your message. Please try again.'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  return (
    <MainLayout>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white text-center mb-4">Contact Us</h2>
            <p className="text-white/70 text-lg text-center mb-8">
              Got a technical issue? Want to send feedback about a beta feature? Need details about our Business plan? Let us know.
            </p>
            
            {submitStatus.submitted && (
              <div className={`mb-6 p-4 rounded-lg ${submitStatus.success ? 'bg-green-500/10 text-green-100' : 'bg-red-500/10 text-red-100'}`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Your email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 shadow-sm backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 sm:text-sm"
                  placeholder="name@example.com"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 shadow-sm backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 sm:text-sm"
                  placeholder="Let us know how we can help you"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
                  Your message
                </label>
                <textarea
                  id="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 shadow-sm backdrop-blur-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 sm:text-sm"
                  placeholder="Leave a comment..."
                  required
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-lg bg-white/10 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 transition-all duration-300"
                >
                  Send message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Contact;
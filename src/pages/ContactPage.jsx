import React, { useState } from 'react';
import { api } from '../services/api.js';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.sendContact(formData);
      setLoading(false);
      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to send message');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-black">Contact</h1>
        <p className="text-sm text-[#666666]">
          Send a note, inquiry, or feedback directly to the editor.
        </p>
      </div>

      {success ? (
        <div className="p-8 bg-[#F5F5F5] border border-[#E5E5E5] space-y-3">
          <h3 className="text-base font-bold text-black">Message Sent</h3>
          <p className="text-sm text-[#666666]">
            Thank you for writing. Your message has been safely received.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="text-xs uppercase tracking-wider font-semibold text-black underline underline-offset-4 pt-2 cursor-pointer"
          >
            Send another note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="block text-xs font-medium text-[#666666]">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white px-3.5 py-2.5 text-sm border border-[#E5E5E5] focus:border-black focus:outline-hidden"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="block text-xs font-medium text-[#666666]">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white px-3.5 py-2.5 text-sm border border-[#E5E5E5] focus:border-black focus:outline-hidden"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="block text-xs font-medium text-[#666666]">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-white px-3.5 py-2.5 text-sm border border-[#E5E5E5] focus:border-black focus:outline-hidden resize-none"
              placeholder="Write your message..."
            />
          </div>

          {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

          <button
            id="contact-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}

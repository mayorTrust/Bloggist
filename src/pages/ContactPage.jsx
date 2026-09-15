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
    <div className="max-w-xl mx-auto px-6 py-16 space-y-8 text-black dark:text-white transition-colors">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">Contact</h1>
        <p className="text-sm text-[#666666] dark:text-neutral-400">
          Send a note, inquiry, or feedback directly to the editor.
        </p>
      </div>

      {success ? (
        <div className="p-8 bg-neutral-100 dark:bg-black/75 backdrop-blur-md border border-[#E5E5E5] dark:border-neutral-800 space-y-3 rounded-xs">
          <h3 className="text-base font-bold text-black dark:text-white">Message Sent</h3>
          <p className="text-sm text-[#666666] dark:text-neutral-400">
            Thank you for writing. Your message has been safely received.
          </p>
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="text-xs uppercase tracking-wider font-semibold text-black dark:text-white underline underline-offset-4 pt-2 cursor-pointer"
          >
            Send another note
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label htmlFor="contact-name" className="block text-xs font-medium text-[#666666] dark:text-neutral-400">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/85 dark:bg-black/75 backdrop-blur-md px-3.5 py-2.5 text-sm text-black dark:text-white border border-[#E5E5E5]/90 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black focus:outline-hidden transition-colors rounded-xs"
              placeholder="Your name"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-email" className="block text-xs font-medium text-[#666666] dark:text-neutral-400">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/85 dark:bg-black/75 backdrop-blur-md px-3.5 py-2.5 text-sm text-black dark:text-white border border-[#E5E5E5]/90 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black focus:outline-hidden transition-colors rounded-xs"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="contact-message" className="block text-xs font-medium text-[#666666] dark:text-neutral-400">
              Message
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-white/85 dark:bg-black/75 backdrop-blur-md px-3.5 py-2.5 text-sm text-black dark:text-white border border-[#E5E5E5]/90 dark:border-neutral-800 focus:border-black dark:focus:border-white focus:bg-white dark:focus:bg-black focus:outline-hidden resize-none transition-colors rounded-xs"
              placeholder="Write your message..."
            />
          </div>

          {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}

          <button
            id="contact-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold tracking-wider uppercase hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 rounded-xs"
          >
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      )}
    </div>
  );
}

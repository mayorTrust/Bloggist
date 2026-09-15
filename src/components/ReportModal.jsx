import React, { useState } from 'react';
import { api } from '../services/api.js';
import { X } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, articleId, articleTitle }) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a short reason');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.reportArticle(articleId, { reason });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        onClose();
      }, 1400);
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to submit report');
    }
  };

  return (
    <div
      id="report-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 p-6 border border-[#E5E5E5] dark:border-neutral-800 relative space-y-4 rounded-xs text-black dark:text-white">
        <button
          id="close-report-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white focus:outline-hidden cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-black dark:text-white tracking-tight">Report Article</h3>
        <p className="text-xs text-[#666666] dark:text-neutral-400 line-clamp-1">
          {articleTitle || 'Selected Article'}
        </p>

        {success ? (
          <div className="py-6 text-center text-sm font-medium text-black dark:text-white">
            Report received. Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#666666] dark:text-neutral-400 mb-1.5">
                Reason for reporting
              </label>
              <textarea
                id="report-reason-input"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Inappropriate content, copyright infringement, spam..."
                className="w-full p-2.5 text-sm bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden resize-none rounded-xs"
                autoFocus
              />
            </div>

            {error && <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white border border-[#E5E5E5] dark:border-neutral-700 transition-colors cursor-pointer rounded-xs"
              >
                Cancel
              </button>
              <button
                id="submit-report-btn"
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs bg-black dark:bg-white text-white dark:text-black font-semibold hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 rounded-xs"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

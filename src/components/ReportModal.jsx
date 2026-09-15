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
      <div className="w-full max-w-sm bg-white p-6 border border-[#E5E5E5] relative space-y-4">
        <button
          id="close-report-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#666666] hover:text-black focus:outline-hidden cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base font-bold text-black tracking-tight">Report Article</h3>
        <p className="text-xs text-[#666666] line-clamp-1">
          {articleTitle || 'Selected Article'}
        </p>

        {success ? (
          <div className="py-6 text-center text-sm font-medium text-black">
            Report received. Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#666666] mb-1.5">
                Reason for reporting
              </label>
              <textarea
                id="report-reason-input"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Inappropriate content, copyright infringement, spam..."
                className="w-full p-2.5 text-sm border border-[#E5E5E5] focus:border-black focus:outline-hidden resize-none"
                autoFocus
              />
            </div>

            {error && <p className="text-xs text-red-600 font-medium">{error}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-xs text-[#666666] hover:text-black border border-[#E5E5E5] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="submit-report-btn"
                type="submit"
                disabled={loading}
                className="px-4 py-1.5 text-xs bg-black text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
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

import React from 'react';

export default function DeleteModal({ isOpen, onClose, onConfirm, loading, title }) {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm bg-white p-6 border border-[#E5E5E5] space-y-4">
        <h3 className="text-lg font-bold text-black tracking-tight">Delete article?</h3>
        <p className="text-sm text-[#666666]">
          {title ? `"${title}"` : 'This article'} and its comments, reactions, and uploaded images will be permanently removed. This cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-[#666666] hover:text-black border border-[#E5E5E5] hover:bg-[#F5F5F5] transition-colors cursor-pointer focus:outline-hidden"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-black text-white hover:opacity-90 transition-opacity cursor-pointer focus:outline-hidden"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

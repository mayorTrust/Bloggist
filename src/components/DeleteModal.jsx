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
      <div className="w-full max-w-sm bg-white dark:bg-neutral-900 p-6 border border-[#E5E5E5] dark:border-neutral-800 space-y-4 rounded-xs text-black dark:text-white">
        <h3 className="text-lg font-bold text-black dark:text-white tracking-tight">Delete article?</h3>
        <p className="text-sm text-[#666666] dark:text-neutral-400">
          {title ? `"${title}"` : 'This article'} and its comments, reactions, and uploaded images will be permanently removed. This cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white border border-[#E5E5E5] dark:border-neutral-700 hover:bg-[#F5F5F5] dark:hover:bg-neutral-800 transition-colors cursor-pointer focus:outline-hidden rounded-xs"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer focus:outline-hidden rounded-xs font-semibold"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

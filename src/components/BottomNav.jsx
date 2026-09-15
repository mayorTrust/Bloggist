import React from 'react';
import { LayoutGrid, FileText, Plus } from 'lucide-react';

export default function BottomNav({ currentPath, navigate }) {
  const isOverview = currentPath === '/admin';
  const isArticles = currentPath.startsWith('/admin/articles') && currentPath !== '/admin/articles/new';
  const isCreating = currentPath === '/admin/articles/new';

  return (
    <>
      {/* Floating Plus Create Button (shown on /admin and /admin/articles, hidden during active editing) */}
      {!isCreating && !currentPath.includes('/edit/') && (
        <button
          id="admin-floating-create-btn"
          type="button"
          onClick={() => navigate('/admin/articles/new')}
          className="fixed bottom-20 right-6 md:bottom-24 md:right-10 z-30 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md focus:outline-hidden cursor-pointer"
          aria-label="Create Article"
          title="Create New Article"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* Admin Bottom Navigation Bar */}
      <nav
        id="admin-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/85 backdrop-blur-md border-t border-[#E5E5E5]/80 h-16 flex items-center justify-around max-w-md mx-auto px-4 shadow-sm"
      >
        <button
          id="admin-nav-overview-btn"
          type="button"
          onClick={() => navigate('/admin')}
          className={`flex items-center gap-2 py-2 px-4 transition-colors cursor-pointer focus:outline-hidden text-sm font-medium ${
            isOverview ? 'text-black font-semibold' : 'text-[#666666] hover:text-black'
          }`}
        >
          <LayoutGrid className={`w-4 h-4 ${isOverview ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
          <span>Overview</span>
        </button>

        <div className="w-[1px] h-6 bg-[#E5E5E5]" />

        <button
          id="admin-nav-articles-btn"
          type="button"
          onClick={() => navigate('/admin/articles')}
          className={`flex items-center gap-2 py-2 px-4 transition-colors cursor-pointer focus:outline-hidden text-sm font-medium ${
            isArticles ? 'text-black font-semibold' : 'text-[#666666] hover:text-black'
          }`}
        >
          <FileText className={`w-4 h-4 ${isArticles ? 'stroke-[2.2]' : 'stroke-[1.5]'}`} />
          <span>Articles</span>
        </button>
      </nav>
    </>
  );
}

import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { Search, Edit3, Trash2, Eye, Heart, Plus } from 'lucide-react';
import DeleteModal from '../../components/DeleteModal.jsx';
import { formatDate } from '../../utils/date.js';

export default function AdminArticles({ navigate }) {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Delete modal state
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadArticles();
  }, [search]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getArticles({
        status: 'all',
        search: search.trim() || undefined
      });
      setArticles(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.warn('Failed to load admin articles:', err?.message || err);
      setError('Failed to load articles');
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!articleToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteArticle(articleToDelete.id);
      setDeleteLoading(false);
      setArticleToDelete(null);
      loadArticles();
    } catch (err) {
      console.warn('Failed to delete article:', err?.message || err);
      setDeleteLoading(false);
      alert('Failed to delete article: ' + (err?.message || 'Error occurred'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-28 space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
          Articles
        </h1>
        <button
          id="create-article-top-btn"
          type="button"
          onClick={() => navigate('/admin/articles/new')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="search-articles-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs focus:border-black focus:outline-hidden"
        />
      </div>

      {/* Articles List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-[#666666]">
          Loading articles...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-sm text-red-600 space-y-2">
          <p>{error}</p>
          <button onClick={loadArticles} className="underline text-black text-xs">
            Retry
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs space-y-3">
          <p className="text-sm text-[#666666]">
            {search ? 'No articles found matching search.' : 'No articles yet.'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/admin/articles/new')}
              className="text-xs uppercase tracking-wider font-semibold text-black underline underline-offset-4 cursor-pointer"
            >
              Create your first article
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id}
              id={`admin-article-item-${art.id}`}
              className="p-4 sm:p-5 border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-black/50 transition-all"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Banner Thumbnail */}
                {art.banner_image ? (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F5F5] border border-[#E5E5E5] shrink-0 overflow-hidden">
                    <img
                      src={art.banner_image}
                      alt={art.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F5F5] border border-[#E5E5E5] shrink-0 flex items-center justify-center text-xs text-[#666666]">
                    No Image
                  </div>
                )}

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 border ${
                        art.status === 'published'
                          ? 'border-black text-black bg-white'
                          : 'border-[#E5E5E5] text-[#666666] bg-[#F5F5F5]'
                      }`}
                    >
                      {art.status}
                    </span>
                    <span className="text-xs text-[#666666]">
                      {art.author} · {formatDate(art.created_at)}
                    </span>
                  </div>

                  <h3
                    onClick={() => navigate(`/admin/articles/edit/${art.id}`)}
                    className="text-base sm:text-lg font-bold text-black hover:underline cursor-pointer line-clamp-1"
                  >
                    {art.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-[#666666]">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {Number(art.views || 0).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5" />
                      {Number(art.total_reactions || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Icons: Edit, Delete */}
              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                <button
                  id={`edit-article-btn-${art.id}`}
                  type="button"
                  onClick={() => navigate(`/admin/articles/edit/${art.id}`)}
                  className="p-2 text-[#666666] hover:text-black hover:bg-[#F5F5F5] border border-transparent hover:border-[#E5E5E5] transition-colors cursor-pointer"
                  title="Edit article"
                  aria-label="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  id={`delete-article-btn-${art.id}`}
                  type="button"
                  onClick={() => setArticleToDelete(art)}
                  className="p-2 text-[#666666] hover:text-red-600 hover:bg-[#F5F5F5] border border-transparent hover:border-[#E5E5E5] transition-colors cursor-pointer"
                  title="Delete article"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!articleToDelete}
        onClose={() => setArticleToDelete(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title={articleToDelete?.title}
      />
    </div>
  );
}

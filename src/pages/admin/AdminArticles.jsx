import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { Search, Edit3, Trash2, Eye, Heart, Plus, Sparkles, Mic, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import DeleteModal from '../../components/DeleteModal.jsx';
import AiVoiceCreateModal from '../../components/AiVoiceCreateModal.jsx';
import { formatDate } from '../../utils/date.js';

export default function AdminArticles({ navigate }) {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Voice AI modal state
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Bulk SEO optimization state
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);
  const [optimizeMessage, setOptimizeMessage] = useState('');

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

  const handleBulkOptimizeSeo = async () => {
    if (!confirm('Run Gemini SEO & AIO optimization across all articles in the publication? This will analyze titles, content, meta tags, and machine-readable citations.')) {
      return;
    }

    setIsOptimizingAll(true);
    setOptimizeMessage('');
    try {
      const res = await api.optimizeAllArticles();
      setOptimizeMessage(res.message || 'All articles successfully optimized!');
      loadArticles();
      setTimeout(() => setOptimizeMessage(''), 5000);
    } catch (err) {
      console.error('Bulk optimization error:', err);
      alert('Optimization error: ' + (err.message || 'Failed'));
    } finally {
      setIsOptimizingAll(false);
    }
  };

  const handleArticleCreatedViaAi = (newArticle) => {
    if (newArticle && newArticle.id) {
      navigate(`/admin/articles/edit/${newArticle.id}`);
    } else {
      loadArticles();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-28 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
            Articles
          </h1>
          <p className="text-xs text-[#666666]">
            Manage, edit, publish, and AI-optimize publication essays.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Voice Creation Button */}
          <button
            id="ai-voice-article-btn"
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer rounded-sm shadow-xs"
          >
            <Mic className="w-3.5 h-3.5 text-red-400" />
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>AI Voice Create</span>
          </button>

          {/* Bulk SEO Optimization Button */}
          <button
            id="bulk-optimize-seo-btn"
            type="button"
            onClick={handleBulkOptimizeSeo}
            disabled={isOptimizingAll || articles.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#E5E5E5] hover:border-black text-xs font-medium text-[#666666] hover:text-black transition-colors cursor-pointer disabled:opacity-50"
            title="Optimize all articles for SEO & AIO"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isOptimizingAll ? 'animate-spin' : ''}`} />
            <span>{isOptimizingAll ? 'Optimizing...' : 'Optimize All SEO'}</span>
          </button>

          {/* Standard New Article Button */}
          <button
            id="create-article-top-btn"
            type="button"
            onClick={() => navigate('/admin/articles/new')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black text-white text-xs font-semibold hover:bg-neutral-800 transition-colors cursor-pointer rounded-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Article</span>
          </button>
        </div>
      </div>

      {/* Optimization Status Notification */}
      {optimizeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 rounded-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{optimizeMessage}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="search-articles-input"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search articles by title, author, or keyword..."
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
          <button onClick={loadArticles} className="underline text-black text-xs cursor-pointer">
            Retry
          </button>
        </div>
      ) : articles.length === 0 ? (
        <div className="py-20 text-center border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs space-y-4 p-6">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-black">
              {search ? 'No articles found matching search.' : 'No articles yet.'}
            </h3>
            <p className="text-xs text-[#666666] max-w-sm mx-auto">
              You can create an article manually or use the AI Voice feature to have Gemini research online and draft an essay for you.
            </p>
          </div>
          {!search && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mic className="w-3.5 h-3.5 text-red-400" />
                <span>Create with AI Voice</span>
              </button>
              <button
                onClick={() => navigate('/admin/articles/new')}
                className="px-4 py-2 border border-[#E5E5E5] text-xs font-semibold text-neutral-700 hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                Write Manually
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map((art) => (
            <div
              key={art.id}
              id={`admin-article-item-${art.id}`}
              className="p-4 sm:p-5 border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-black/50 transition-all rounded-sm"
            >
              <div className="flex items-start gap-4 min-w-0 flex-1">
                {/* Banner Thumbnail with error fallback */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F5F5F5] border border-[#E5E5E5] shrink-0 overflow-hidden rounded-xs">
                  {art.banner_image ? (
                    <img
                      src={art.banner_image}
                      alt={art.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-[#666666]">
                      No Image
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 border ${
                        art.status === 'published'
                          ? 'border-black text-black bg-white'
                          : 'border-amber-300 text-amber-800 bg-amber-50'
                      }`}
                    >
                      {art.status}
                    </span>

                    {/* SEO Score Badge */}
                    {art.seo_score && (
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-neutral-100 text-neutral-700 border border-neutral-200 rounded-xs">
                        SEO {art.seo_score}/100
                      </span>
                    )}

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
                  className="p-2 text-[#666666] hover:text-black hover:bg-[#F5F5F5] border border-transparent hover:border-[#E5E5E5] transition-colors cursor-pointer rounded-xs"
                  title="Edit article"
                  aria-label="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  id={`delete-article-btn-${art.id}`}
                  type="button"
                  onClick={() => setArticleToDelete(art)}
                  className="p-2 text-[#666666] hover:text-red-600 hover:bg-[#F5F5F5] border border-transparent hover:border-[#E5E5E5] transition-colors cursor-pointer rounded-xs"
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

      {/* Voice AI Article Creation Modal */}
      <AiVoiceCreateModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onArticleCreated={handleArticleCreatedViaAi}
      />

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

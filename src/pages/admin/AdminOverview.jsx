import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { LogOut, ExternalLink, Check, Eye } from 'lucide-react';
import { formatRelativeTime } from '../../utils/date.js';

export default function AdminOverview({ navigate, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAnalytics();
      setAnalytics(data);
      setLoading(false);
    } catch (err) {
      console.warn('Failed to load admin analytics:', err?.message || err);
      setError('Failed to load admin analytics');
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      await api.resolveReport(reportId);
      loadAnalytics();
    } catch (err) {
      console.warn('Failed to resolve report:', err?.message || err);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Number(num).toLocaleString();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <p className="text-sm text-[#666666] dark:text-neutral-400">Loading overview...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-3">
        <p className="text-sm text-red-600 dark:text-red-400">{error || 'An error occurred'}</p>
        <button
          onClick={loadAnalytics}
          className="text-xs underline text-black dark:text-white cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-28 space-y-12 text-black dark:text-white transition-colors">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-black dark:text-white">
            BLOGGIST ADMIN
          </span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors ml-2 focus:outline-hidden cursor-pointer"
            title="View Public Blog"
          >
            <span>View Public</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <button
          id="admin-logout-btn"
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 text-xs text-[#666666] dark:text-neutral-300 hover:text-black dark:hover:text-white border border-[#E5E5E5] dark:border-neutral-800 hover:border-black dark:hover:border-neutral-500 px-3 py-1.5 transition-colors cursor-pointer focus:outline-hidden rounded-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black dark:text-white">
          Overview
        </h1>
      </div>

      {/* Analytics Cards - Side-by-side across all screen sizes */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        <div className="p-3.5 sm:p-6 border border-[#E5E5E5]/90 dark:border-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none rounded-xs space-y-1 sm:space-y-2">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#666666] dark:text-neutral-400 font-semibold truncate">
            Total Views
          </p>
          <p className="text-xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            {formatNumber(analytics.totalViews)}
          </p>
        </div>

        <div className="p-3.5 sm:p-6 border border-[#E5E5E5]/90 dark:border-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none rounded-xs space-y-1 sm:space-y-2">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#666666] dark:text-neutral-400 font-semibold truncate">
            Articles
          </p>
          <p className="text-xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            {analytics.totalArticles}
          </p>
        </div>

        <div className="p-3.5 sm:p-6 border border-[#E5E5E5]/90 dark:border-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none rounded-xs space-y-1 sm:space-y-2">
          <p className="text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest text-[#666666] dark:text-neutral-400 font-semibold truncate">
            Comments
          </p>
          <p className="text-xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
            {analytics.totalComments}
          </p>
        </div>
      </div>

      {/* Most Viewed Articles */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-black dark:text-white">
          Most Viewed
        </h2>
        {analytics.mostViewed && analytics.mostViewed.length > 0 ? (
          <div className="border border-[#E5E5E5]/90 dark:border-neutral-800 divide-y divide-[#E5E5E5]/80 dark:divide-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none rounded-xs">
            {analytics.mostViewed.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/admin/articles/edit/${item.id}`)}
                className="flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="pr-4">
                  <p className="text-sm font-semibold text-black dark:text-white line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#666666] dark:text-neutral-400 pt-0.5">
                    {item.author} · {item.status}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#666666] dark:text-neutral-400 font-medium shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{Number(item.views || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#666666] dark:text-neutral-400 italic">No articles yet.</p>
        )}
      </section>

      {/* Recent Comments */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-black dark:text-white">
          Recent Comments
        </h2>
        {analytics.recentComments && analytics.recentComments.length > 0 ? (
          <div className="border border-[#E5E5E5]/90 dark:border-neutral-800 divide-y divide-[#E5E5E5]/80 dark:divide-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none rounded-xs">
            {analytics.recentComments.map((c) => (
              <div key={c.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black dark:text-white">{c.name}</span>
                  <span className="text-[#666666] dark:text-neutral-400 flex items-center gap-1.5">
                    <span className="line-clamp-1">{c.article_title || 'Article'}</span>
                    {c.created_at && <span className="shrink-0 font-normal">· {formatRelativeTime(c.created_at)}</span>}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#666666] dark:text-neutral-300 line-clamp-2">
                  "{c.content}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#666666] dark:text-neutral-400 italic">No comments yet.</p>
        )}
      </section>

      {/* Reported Articles */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-black dark:text-white">
          Reported Articles
        </h2>
        {analytics.reports && analytics.reports.length > 0 ? (
          <div className="border border-[#E5E5E5]/90 dark:border-neutral-800 divide-y divide-[#E5E5E5]/80 dark:divide-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none rounded-xs">
            {analytics.reports.map((rep) => (
              <div key={rep.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-black dark:text-white">
                    {rep.article_title || `Article #${rep.article_id}`}
                  </p>
                  <p className="text-xs text-[#666666] dark:text-neutral-400">
                    Reason: <span className="text-black dark:text-white">{rep.reason}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveReport(rep.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-[#E5E5E5] dark:border-neutral-700 hover:border-black dark:hover:border-neutral-400 text-[#666666] dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer rounded-xs"
                  title="Mark Resolved"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border border-[#E5E5E5]/90 dark:border-neutral-800 bg-white/85 dark:bg-black/75 backdrop-blur-md shadow-none text-center rounded-xs">
            <p className="text-sm text-[#666666] dark:text-neutral-400">No reported articles</p>
          </div>
        )}
      </section>
    </div>
  );
}

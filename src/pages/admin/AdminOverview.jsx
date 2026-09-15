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
        <p className="text-sm text-[#666666]">Loading overview...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-3">
        <p className="text-sm text-red-600">{error || 'An error occurred'}</p>
        <button
          onClick={loadAnalytics}
          className="text-xs underline text-black cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-6 pb-28 space-y-12">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-black">
            BLOGGIST ADMIN
          </span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hidden sm:inline-flex items-center gap-1 text-xs text-[#666666] hover:text-black transition-colors ml-2 focus:outline-hidden cursor-pointer"
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
          className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-black border border-[#E5E5E5] hover:border-black px-3 py-1.5 transition-colors cursor-pointer focus:outline-hidden"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-black">
          Overview
        </h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
            Total Views
          </p>
          <p className="text-3xl font-bold text-black tracking-tight">
            {formatNumber(analytics.totalViews)}
          </p>
        </div>

        <div className="p-6 border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
            Articles
          </p>
          <p className="text-3xl font-bold text-black tracking-tight">
            {analytics.totalArticles}
          </p>
        </div>

        <div className="p-6 border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs space-y-2">
          <p className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
            Comments
          </p>
          <p className="text-3xl font-bold text-black tracking-tight">
            {analytics.totalComments}
          </p>
        </div>
      </div>

      {/* Most Viewed Articles */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-black">
          Most Viewed
        </h2>
        {analytics.mostViewed && analytics.mostViewed.length > 0 ? (
          <div className="border border-[#E5E5E5]/90 divide-y divide-[#E5E5E5]/80 bg-white/85 backdrop-blur-md shadow-xs">
            {analytics.mostViewed.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/admin/articles/edit/${item.id}`)}
                className="flex items-center justify-between p-4 hover:bg-black/5 transition-colors cursor-pointer"
              >
                <div className="pr-4">
                  <p className="text-sm font-semibold text-black line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#666666] pt-0.5">
                    {item.author} · {item.status}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#666666] font-medium shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{Number(item.views || 0).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#666666] italic">No articles yet.</p>
        )}
      </section>

      {/* Recent Comments */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-black">
          Recent Comments
        </h2>
        {analytics.recentComments && analytics.recentComments.length > 0 ? (
          <div className="border border-[#E5E5E5]/90 divide-y divide-[#E5E5E5]/80 bg-white/85 backdrop-blur-md shadow-xs">
            {analytics.recentComments.map((c) => (
              <div key={c.id} className="p-4 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-black">{c.name}</span>
                  <span className="text-[#666666] flex items-center gap-1.5">
                    <span className="line-clamp-1">{c.article_title || 'Article'}</span>
                    {c.created_at && <span className="shrink-0 font-normal">· {formatRelativeTime(c.created_at)}</span>}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#666666] line-clamp-2">
                  "{c.content}"
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#666666] italic">No comments yet.</p>
        )}
      </section>

      {/* Reported Articles */}
      <section className="space-y-4 pt-4">
        <h2 className="text-lg font-bold tracking-tight text-black">
          Reported Articles
        </h2>
        {analytics.reports && analytics.reports.length > 0 ? (
          <div className="border border-[#E5E5E5]/90 divide-y divide-[#E5E5E5]/80 bg-white/85 backdrop-blur-md shadow-xs">
            {analytics.reports.map((rep) => (
              <div key={rep.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-black">
                    {rep.article_title || `Article #${rep.article_id}`}
                  </p>
                  <p className="text-xs text-[#666666]">
                    Reason: <span className="text-black">{rep.reason}</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveReport(rep.id)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs border border-[#E5E5E5] hover:border-black text-[#666666] hover:text-black transition-colors cursor-pointer"
                  title="Mark Resolved"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Resolve</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 border border-[#E5E5E5]/90 bg-white/85 backdrop-blur-md shadow-xs text-center">
            <p className="text-sm text-[#666666]">No reported articles</p>
          </div>
        )}
      </section>
    </div>
  );
}

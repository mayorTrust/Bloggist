import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { Eye, Heart } from 'lucide-react';

export default function HomePage({ navigate }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    let retryTimer = null;

    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getArticles({ status: 'published' });
        if (mounted) {
          setArticles(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Initial articles load issue:', err?.message || err);
        if (mounted) {
          // Automatic quiet retry after 1.2s to smoothly absorb dev server restarts
          retryTimer = setTimeout(async () => {
            if (!mounted) return;
            try {
              const retryData = await api.getArticles({ status: 'published' });
              if (mounted) {
                setArticles(Array.isArray(retryData) ? retryData : []);
                setError('');
                setLoading(false);
              }
            } catch (retryErr) {
              if (mounted) {
                setError('Unable to load articles right now.');
                setLoading(false);
              }
            }
          }, 1200);
        }
      }
    };

    fetchArticles();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, []);

  const loadArticles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getArticles({ status: 'published' });
      setArticles(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.warn('Manual refresh articles failed:', err?.message || err);
      setError('Unable to load articles. Please check your connection.');
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-[#666666] tracking-wide">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center space-y-4">
        <p className="text-sm text-black">{error}</p>
        <button
          type="button"
          onClick={loadArticles}
          className="text-xs uppercase tracking-wider font-medium text-black underline underline-offset-4 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-28 text-center">
        <p className="text-sm text-[#666666]">No articles yet.</p>
      </div>
    );
  }

  const featured = articles[0];
  const remaining = articles.slice(1);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-20">
      {/* Featured Article */}
      {featured && (
        <article
          id={`featured-article-${featured.id}`}
          onClick={() => navigate(`/blog/${featured.slug}`)}
          className="group cursor-pointer space-y-6 block"
        >
          {featured.banner_image && (
            <div className="w-full aspect-[21/9] sm:aspect-[2/1] overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5]">
              <img
                src={featured.banner_image}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                loading="eager"
              />
            </div>
          )}

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-black group-hover:text-black/80 transition-colors leading-tight">
              {featured.title}
            </h1>

            {featured.excerpt && (
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed line-clamp-2 max-w-3xl">
                {featured.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666] pt-1">
              <span className="font-medium text-black">{featured.author}</span>
              <span>·</span>
              <span>{formatDate(featured.created_at)}</span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {Number(featured.views || 0).toLocaleString()}
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5" />
                {Number(featured.total_reactions || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </article>
      )}

      {/* Latest Articles Grid/List */}
      {remaining.length > 0 && (
        <section className="space-y-10 pt-6 border-t border-[#E5E5E5]">
          <h2 className="text-xs uppercase tracking-widest text-[#666666] font-semibold">
            Latest Articles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {remaining.map((article) => (
              <article
                key={article.id}
                id={`article-card-${article.id}`}
                onClick={() => navigate(`/blog/${article.slug}`)}
                className="group cursor-pointer space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {article.banner_image && (
                    <div className="w-full aspect-[16/9] overflow-hidden bg-[#F5F5F5] border border-[#E5E5E5]">
                      <img
                        src={article.banner_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  <h3 className="text-xl font-bold tracking-tight text-black group-hover:text-black/80 transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="text-sm text-[#666666] leading-relaxed line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-[#666666] pt-2">
                  <span className="font-medium text-black">{article.author}</span>
                  <span>·</span>
                  <span>{formatDate(article.created_at)}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {Number(article.views || 0).toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {Number(article.total_reactions || 0).toLocaleString()}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

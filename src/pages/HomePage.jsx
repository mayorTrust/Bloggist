import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../services/api.js';
import { Eye, Heart, MessageSquare, ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { formatDate } from '../utils/date.js';
import HomeHero from '../components/HomeHero.jsx';

export default function HomePage({ navigate }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');

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

  // Filtered articles based on search query and topic chip
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (art.title && art.title.toLowerCase().includes(q)) ||
        (art.excerpt && art.excerpt.toLowerCase().includes(q)) ||
        (art.author && art.author.toLowerCase().includes(q)) ||
        (art.category && art.category.toLowerCase().includes(q)) ||
        (art.keywords && art.keywords.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (selectedTopic === 'All') return true;

      // Check category match directly
      if (art.category && art.category.toLowerCase() === selectedTopic.toLowerCase()) {
        return true;
      }

      // Keyword / Topic semantic fallback
      const fullText = `${art.category || ''} ${art.title} ${art.excerpt || ''} ${art.keywords || ''}`.toLowerCase();
      if (selectedTopic === 'Technology') {
        return fullText.includes('tech') || fullText.includes('code') || fullText.includes('silicon') || fullText.includes('quantum');
      }
      if (selectedTopic === 'Design') {
        return fullText.includes('design') || fullText.includes('typography') || fullText.includes('architect') || fullText.includes('minimal');
      }
      if (selectedTopic === 'Culture') {
        return fullText.includes('culture') || fullText.includes('human') || fullText.includes('work') || fullText.includes('life');
      }
      if (selectedTopic === 'Essays') {
        return fullText.includes('essay') || fullText.includes('reflection') || true;
      }
      if (selectedTopic === 'AI & Society') {
        return fullText.includes('ai') || fullText.includes('intelligence') || fullText.includes('machine');
      }

      return false;
    });
  }, [articles, searchQuery, selectedTopic]);

  const featuredArticle = articles[0] || null;

  return (
    <div className="w-full relative flex flex-col">
      {/* 1. Full-Screen High-Impact Animated Hero Section */}
      <HomeHero
        featuredArticle={featuredArticle}
        selectedTopic={selectedTopic}
        onTopicSelect={setSelectedTopic}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        navigate={navigate}
      />

      {/* 2. Latest Articles Section Immediately After Hero */}
      <section id="latest-articles" className="w-full max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E5] dark:border-neutral-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white font-sans">
                Latest Articles
              </h2>
              <span className="text-xs font-mono font-medium px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'Article' : 'Articles'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#666666] dark:text-neutral-400">
              {selectedTopic !== 'All' ? `Showing articles in ${selectedTopic}` : 'Fresh stories and articles, published without distraction.'}
            </p>
          </div>

          {(selectedTopic !== 'All' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedTopic('All');
                setSearchQuery('');
              }}
              className="text-xs text-black dark:text-white font-semibold underline underline-offset-4 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-pointer self-start sm:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-24 text-center space-y-3">
            <div className="w-6 h-6 border-2 border-black dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#666666] dark:text-neutral-400 uppercase tracking-widest font-mono">Loading Articles...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-24 text-center space-y-4">
            <p className="text-sm text-black dark:text-white">{error}</p>
            <button
              type="button"
              onClick={loadArticles}
              className="text-xs uppercase tracking-wider font-semibold text-black dark:text-white underline underline-offset-4 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredArticles.length === 0 && (
          <div className="py-24 text-center space-y-4 bg-white/70 dark:bg-black/60 backdrop-blur-md border border-dashed border-neutral-300 dark:border-neutral-800 rounded-lg p-8">
            <Search className="w-8 h-8 text-neutral-400 dark:text-neutral-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-black dark:text-white">No articles match your criteria</h3>
              <p className="text-xs text-[#666666] dark:text-neutral-400 max-w-sm mx-auto">
                Try searching for a different keyword or select another topic from the chips above.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTopic('All');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-sm hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              Show All Articles
            </button>
          </div>
        )}

        {/* Articles Grid (Soft Shadows) */}
        {!loading && !error && filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {filteredArticles.map((article) => {
              // Calculate reading time roughly (~200 wpm)
              const wordCount = (article.content_html || '').replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length;
              const readMinutes = Math.max(1, Math.round(wordCount / 200));

              return (
                <article
                  key={article.id}
                  id={`article-card-${article.id}`}
                  onClick={() => navigate(`/blog/${article.slug}`)}
                  className="group cursor-pointer flex flex-col justify-between bg-white/85 dark:bg-black/75 backdrop-blur-md border border-[#E5E5E5] dark:border-neutral-800/90 hover:border-black dark:hover:border-neutral-600 transition-all p-5 rounded-lg shadow-xs hover:shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Article Banner Image with Error Fallback */}
                    <div className="w-full aspect-[16/10] overflow-hidden bg-[#F5F5F5] dark:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800 rounded-sm relative">
                      <img
                        src={
                          article.banner_image ||
                          'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                      {article.seo_score && article.seo_score >= 90 && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 dark:bg-black/90 text-white backdrop-blur-xs text-[10px] font-bold rounded-full flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                          <span>AIO Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Category & Metadata Pill */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-md">
                          {article.category || 'General'}
                        </span>
                        <span className="text-[11px] text-[#666666] dark:text-neutral-400 font-mono">
                          {readMinutes} min read
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-[#666666] dark:text-neutral-400">
                        <span className="font-semibold text-black dark:text-white">{article.author || 'Trust Agbi'}</span>
                        <span>·</span>
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold tracking-tight text-black dark:text-white group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors leading-snug line-clamp-2">
                      {article.title}
                    </h3>

                    {/* Excerpt */}
                    {article.excerpt && (
                      <p className="text-xs sm:text-sm text-[#666666] dark:text-neutral-300 leading-relaxed line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </div>

                  {/* Footer Metrics */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E5E5E5] dark:border-neutral-800 text-xs text-[#666666] dark:text-neutral-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {Number(article.views || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5" />
                        {Number(article.total_reactions || 0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {Number(article.comments_count || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-black dark:text-white font-semibold group-hover:translate-x-0.5 transition-transform text-xs">
                      <span>Read</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

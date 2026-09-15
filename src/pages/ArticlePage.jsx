import React, { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import DOMPurify from 'dompurify';
import { ArrowLeft, Eye, MoreHorizontal, Sparkles, Share2, Check, Bot } from 'lucide-react';
import ReportModal from '../components/ReportModal.jsx';
import { formatDate, formatRelativeTime } from '../utils/date.js';

const REACTION_EMOJIS = [
  { type: 'love', emoji: '❤️' },
  { type: 'laugh', emoji: '😂' },
  { type: 'fire', emoji: '🔥' },
  { type: 'surprised', emoji: '😮' },
  { type: 'sad', emoji: '😢' },
  { type: 'clap', emoji: '👏' }
];

export default function ArticlePage({ slug, navigate }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Reactions state
  const [reactions, setReactions] = useState({ love: 0, laugh: 0, fire: 0, surprised: 0, sad: 0, clap: 0 });
  const [userReactions, setUserReactions] = useState({});

  // Comments state
  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState('');

  // Report modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Live ticking timer to update relative comment times in real-time
  const [, setLiveTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTick((t) => t + 1);
    }, 15000); // Ticks every 15s to update "just now", "1 minute ago", etc.
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadArticle();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slug]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getArticle(slug);
      setArticle(data);
      setReactions(data.reactions || {});
      setComments(data.comments || []);
      setLoading(false);

      // Dynamic document title & meta tags update for SEO
      if (data.title) {
        document.title = data.meta_title ? `${data.meta_title} | Bloggist` : `${data.title} | Bloggist`;
      }
      const metaDescTag = document.querySelector('meta[name="description"]');
      if (metaDescTag && (data.meta_description || data.excerpt)) {
        metaDescTag.setAttribute('content', data.meta_description || data.excerpt);
      }

      // Inject JSON-LD Schema for BlogPosting
      let scriptTag = document.getElementById('article-jsonld-schema');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = 'article-jsonld-schema';
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      const schemaData = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: data.title,
        description: data.meta_description || data.excerpt,
        image: data.banner_image ? [data.banner_image] : [],
        datePublished: data.created_at,
        dateModified: data.updated_at || data.created_at,
        author: {
          '@type': 'Person',
          name: data.author || 'Trust Agbi'
        },
        publisher: {
          '@type': 'Organization',
          name: 'Bloggist',
          logo: {
            '@type': 'ImageObject',
            url: window.location.origin + '/icon.svg'
          }
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': window.location.href
        }
      };
      scriptTag.textContent = JSON.stringify(schemaData);

      // Load user's local reaction history for this article
      try {
        const stored = localStorage.getItem(`bloggist_reactions_${data.id}`);
        if (stored) {
          setUserReactions(JSON.parse(stored));
        }
      } catch (e) {}

      // Increment view count with debounce/session guard
      handleViewCount(data.id);
    } catch (err) {
      console.warn('Article fetch warning:', err?.message || err);
      setError('Article not found or failed to load');
      setLoading(false);
    }
  };

  const handleViewCount = async (articleId) => {
    const sessionKey = `viewed_art_${articleId}`;
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      try {
        const res = await api.recordView(articleId);
        if (res && res.views !== undefined) {
          setArticle((prev) => (prev ? { ...prev, views: res.views } : prev));
        }
      } catch (err) {
        console.warn('Could not record view:', err);
      }
    }
  };

  const handleReaction = async (type) => {
    if (!article) return;
    const storageKey = `bloggist_reactions_${article.id}`;
    const alreadyReacted = userReactions[type];

    // Optimistic update
    setReactions((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + (alreadyReacted ? -1 : 1)
    }));

    const nextUserReactions = {
      ...userReactions,
      [type]: !alreadyReacted
    };
    setUserReactions(nextUserReactions);
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextUserReactions));
    } catch (e) {}

    try {
      const updated = await api.react(article.id, type);
      if (updated) {
        setReactions(updated);
      }
    } catch (err) {
      console.warn('Failed to register reaction:', err?.message || err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentName.trim()) {
      setCommentError('Please enter your name');
      return;
    }
    if (!commentText.trim()) {
      setCommentError('Please enter your comment');
      return;
    }

    setCommentLoading(true);
    setCommentError('');
    try {
      const newComment = await api.addComment(article.id, {
        name: commentName.trim(),
        content: commentText.trim()
      });
      if (newComment && !newComment.created_at) {
        newComment.created_at = new Date().toISOString();
      }
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      setCommentLoading(false);
    } catch (err) {
      setCommentLoading(false);
      setCommentError(err.message || 'Failed to post comment');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <p className="text-sm text-[#666666] tracking-wide">Loading article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-4 text-black dark:text-white">
        <p className="text-base text-black dark:text-neutral-300">{error || 'Article not found'}</p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-medium text-black dark:text-white underline underline-offset-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-12 text-black dark:text-white transition-colors">
      {/* Back link & Subtle options */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-blog-btn"
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer group focus:outline-hidden"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Blog</span>
        </button>

        {/* Subtle report trigger */}
        <button
          id="article-report-trigger-btn"
          type="button"
          onClick={() => setReportModalOpen(true)}
          className="p-1.5 text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors focus:outline-hidden cursor-pointer"
          title="Report article"
          aria-label="Report article"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Article Header */}
      <header className="space-y-4">
        {article.category && (
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
            {article.category}
          </span>
        )}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-[#666666] dark:text-neutral-400 pt-1">
          <span className="font-semibold text-black dark:text-white">{article.author}</span>
          <span>·</span>
          <span>{formatDate(article.created_at)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {Number(article.views || 0).toLocaleString()} views
          </span>
        </div>
      </header>

      {/* Large Banner Image with fallback */}
      {article.banner_image && (
        <div className="w-full overflow-hidden bg-[#F5F5F5] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-800 aspect-[21/9] sm:aspect-[2/1] rounded-sm">
          <img
            src={article.banner_image}
            alt={article.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      )}

      {/* AIO (Artificial Intelligence Optimization) Key Takeaways & Direct Answer */}
      {article.aio_summary && (
        <div className="p-6 bg-neutral-50/80 dark:bg-black/75 backdrop-blur-md border border-neutral-200 dark:border-neutral-800 rounded-sm space-y-3 shadow-none">
          <div className="flex items-center justify-between text-xs font-bold text-black dark:text-white uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-neutral-800 dark:text-neutral-200" />
              <span>AIO Executive Overview & Key Takeaways</span>
            </span>
            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-200/60 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
              Verified Schema
            </span>
          </div>
          <div className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line font-sans pl-3 border-l-2 border-black dark:border-white">
            {article.aio_summary}
          </div>
        </div>
      )}

      {/* Article Content rendered as clean HTML */}
      <div
        id="article-rendered-content"
        className="prose prose-neutral dark:prose-invert max-w-none text-black dark:text-neutral-100 leading-relaxed space-y-6 text-base sm:text-lg [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2 [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:mt-4 [&>h4]:mb-2 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-1.5 [&_a]:underline [&_a]:underline-offset-4 [&_a]:text-black dark:[&_a]:text-white [&_img]:my-6 [&_img]:border [&_img]:border-[#E5E5E5] dark:[&_img]:border-neutral-800 [&_img]:max-w-full [&_img]:h-auto"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(article.content_html, {
            ADD_ATTR: ['target', 'rel', 'style', 'class', 'onerror']
          })
        }}
      />

      {/* Keywords / SEO Tags */}
      {article.keywords && (
        <div className="flex flex-wrap items-center gap-1.5 pt-2">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mr-1">
            Keywords:
          </span>
          {article.keywords.split(',').map((kw, i) => {
            const cleanKw = kw.trim();
            if (!cleanKw) return null;
            return (
              <span
                key={i}
                className="text-xs px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 rounded-full transition-colors cursor-default"
              >
                #{cleanKw}
              </span>
            );
          })}
        </div>
      )}

      {/* Reactions Section */}
      <section className="pt-8 border-t border-[#E5E5E5] dark:border-neutral-800 space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-[#666666] dark:text-neutral-400 font-semibold">
          Reactions
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {REACTION_EMOJIS.map(({ type, emoji }) => {
            const count = reactions[type] || 0;
            const isSelected = !!userReactions[type];
            return (
              <button
                key={type}
                id={`reaction-btn-${type}`}
                type="button"
                onClick={() => handleReaction(type)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-sm border rounded-full transition-all cursor-pointer focus:outline-hidden ${
                  isSelected
                    ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black shadow-none'
                    : 'border-[#E5E5E5]/90 dark:border-neutral-800 bg-white/80 dark:bg-black/75 backdrop-blur-md text-black dark:text-white hover:border-black dark:hover:border-neutral-500'
                }`}
                title={`React with ${type}`}
              >
                <span>{emoji}</span>
                <span className="font-medium text-xs">{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Comments Section */}
      <section className="pt-8 border-t border-[#E5E5E5]/80 dark:border-neutral-800 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight text-black dark:text-white">
            Comments {comments.length > 0 && `(${comments.length})`}
          </h3>
        </div>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="space-y-3 bg-white/80 dark:bg-black/75 backdrop-blur-md p-5 border border-[#E5E5E5]/90 dark:border-neutral-800 shadow-none rounded-xs">
          <div>
            <input
              id="comment-name-input"
              type="text"
              value={commentName}
              onChange={(e) => setCommentName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="w-full bg-white dark:bg-black/80 px-3.5 py-2 text-sm text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden rounded-xs"
            />
          </div>
          <div>
            <textarea
              id="comment-content-input"
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
              className="w-full bg-white dark:bg-black/80 px-3.5 py-2 text-sm text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden resize-none rounded-xs"
            />
          </div>

          {commentError && (
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{commentError}</p>
          )}

          <div className="flex justify-end">
            <button
              id="post-comment-btn"
              type="submit"
              disabled={commentLoading}
              className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold tracking-wide hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 rounded-xs"
            >
              {commentLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-6 pt-2">
          {comments.length === 0 ? (
            <p className="text-sm text-[#666666] dark:text-neutral-400 italic">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="border-b border-[#E5E5E5] dark:border-neutral-800 pb-5 space-y-1.5 last:border-0">
                <div className="flex items-center justify-between text-xs text-[#666666] dark:text-neutral-400">
                  <span className="font-semibold text-black dark:text-white">{c.name}</span>
                  <span>{formatRelativeTime(c.created_at)}</span>
                </div>
                <p className="text-sm text-black dark:text-neutral-200 whitespace-pre-wrap leading-relaxed">
                  {c.content}
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Recommended Articles */}
      {article.recommended && article.recommended.length > 0 && (
        <section className="pt-12 border-t border-[#E5E5E5] dark:border-neutral-800 space-y-6">
          <h3 className="text-xs uppercase tracking-widest text-[#666666] dark:text-neutral-400 font-semibold">
            Recommended
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {article.recommended.map((rec) => (
              <div
                key={rec.id}
                id={`recommended-article-${rec.id}`}
                onClick={() => navigate(`/blog/${rec.slug}`)}
                className="group cursor-pointer space-y-2.5"
              >
                {rec.banner_image && (
                  <div className="w-full aspect-[16/9] overflow-hidden bg-[#F5F5F5] dark:bg-neutral-900 border border-[#E5E5E5] dark:border-neutral-800 rounded-xs">
                    <img
                      src={rec.banner_image}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <h4 className="text-sm font-bold text-black dark:text-white group-hover:text-[#666666] dark:group-hover:text-neutral-400 transition-colors line-clamp-2 leading-snug">
                  {rec.title}
                </h4>
                <div className="text-[11px] text-[#666666] dark:text-neutral-400 flex items-center gap-1.5">
                  <span>{rec.author}</span>
                  <span>·</span>
                  <span>{formatDate(rec.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        articleId={article.id}
        articleTitle={article.title}
      />
    </div>
  );
}

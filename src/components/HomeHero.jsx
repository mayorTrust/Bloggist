import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Sparkles, Search, Compass, BookOpen, Clock, Eye, ChevronRight, PenTool } from 'lucide-react';
import BloggistLogo from './BloggistLogo.jsx';
import { formatDate } from '../utils/date.js';

const ROTATING_TOPICS = [
  'Humanist Technology',
  'Quiet Computing',
  'Thoughtful Perspectives',
  'Investigative Essays',
  'Architectural Typography',
  'Digital Minimalism'
];

export default function HomeHero({
  featuredArticle,
  onTopicSelect,
  selectedTopic,
  searchQuery,
  onSearchChange,
  navigate
}) {
  const [topicIndex, setTopicIndex] = useState(0);

  // Rotate hero topic phrase every 3.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % ROTATING_TOPICS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const scrollToArticles = () => {
    const el = document.getElementById('latest-articles');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const topics = ['All', 'Technology', 'Design', 'Culture', 'Essays', 'AI & Society'];

  return (
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden px-6 pt-12 pb-8 sm:pb-12 text-black select-none">
      {/* Ambient background aura / subtle light accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-100/30 via-indigo-100/20 to-sky-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Bar / Editorial Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto flex items-center justify-between pt-2 sm:pt-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 border border-black/10 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-neutral-800">
            Bloggist Journal · Independent Editorial
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-neutral-500 font-mono">
          <span>EST. 2026</span>
          <span>·</span>
          <span>CURATED WRITING</span>
        </div>
      </motion.div>

      {/* Hero Center Body */}
      <div className="w-full max-w-5xl mx-auto my-auto py-8 sm:py-12 flex flex-col items-center text-center space-y-8 sm:space-y-10">
        {/* Animated Brand Emblem & Eyebrow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="p-3 bg-white/80 border border-neutral-200/80 rounded-2xl shadow-sm backdrop-blur-md">
            <BloggistLogo size="lg" showWordmark={false} animated={true} />
          </div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-neutral-500">
            The Journal of Intentional Thought
          </span>
        </motion.div>

        {/* Dynamic Animated Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black leading-[1.08] font-sans">
            Words Written With Depth, Precision &{' '}
            <span className="relative inline-block text-black">
              <AnimatePresence mode="wait">
                <motion.span
                  key={topicIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="inline-block underline decoration-black/30 decoration-wavy underline-offset-8"
                >
                  {ROTATING_TOPICS[topicIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed">
            An independent publication championing long-form essays, critical discourse, technology breakthroughs, and philosophical contemplation.
          </p>
        </motion.div>

        {/* Live Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl space-y-4"
        >
          {/* Search Input */}
          <div className="relative flex items-center bg-white/90 backdrop-blur-md border border-neutral-300 shadow-sm rounded-full overflow-hidden hover:border-black transition-colors">
            <Search className="w-4 h-4 text-neutral-400 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search essays, concepts, or authors..."
              className="w-full px-3 py-3 text-sm text-black placeholder:text-neutral-400 focus:outline-hidden bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-xs text-neutral-500 hover:text-black px-3 py-1 mr-2 cursor-pointer font-medium"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={scrollToArticles}
              className="m-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-full hover:bg-neutral-800 transition-colors shrink-0 cursor-pointer shadow-xs"
            >
              Explore
            </button>
          </div>

          {/* Quick Topic Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {topics.map((t) => {
              const active = selectedTopic === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onTopicSelect(t)}
                  className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer font-medium ${
                    active
                      ? 'bg-black text-white shadow-xs scale-105'
                      : 'bg-white/70 text-neutral-600 hover:bg-white hover:text-black border border-neutral-200/80 backdrop-blur-xs'
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Featured Story Quick Highlight Card */}
        {featuredArticle && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => navigate(`/blog/${featuredArticle.slug}`)}
            className="w-full max-w-2xl bg-white/80 backdrop-blur-md border border-neutral-200/90 hover:border-black/50 p-4 sm:p-5 rounded-2xl shadow-md transition-all group cursor-pointer text-left flex flex-col sm:flex-row items-center gap-4 text-neutral-900"
          >
            {featuredArticle.banner_image && (
              <div className="w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                <img
                  src={featuredArticle.banner_image}
                  alt={featuredArticle.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>
            )}

            <div className="flex-1 min-w-0 space-y-1.5 w-full">
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                <span className="text-black font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded">
                  Featured Story
                </span>
                <span>·</span>
                <span>{featuredArticle.author || 'Trust Agbi'}</span>
                <span>·</span>
                <span>{formatDate(featuredArticle.created_at)}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-black tracking-tight group-hover:text-black/80 transition-colors line-clamp-1">
                {featuredArticle.title}
              </h3>

              {featuredArticle.excerpt && (
                <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              )}
            </div>

            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-black group-hover:text-white transition-colors shrink-0">
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom Scroll Prompt */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center pt-4"
      >
        <button
          type="button"
          onClick={scrollToArticles}
          className="group flex flex-col items-center gap-1 text-neutral-500 hover:text-black transition-colors cursor-pointer focus:outline-hidden"
          title="Scroll to latest articles"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest group-hover:translate-y-0.5 transition-transform">
            Scroll to Latest Articles
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-6 h-6 rounded-full border border-neutral-300 flex items-center justify-center group-hover:border-black"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}

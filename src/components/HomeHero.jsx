import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown, Sparkles, Search, Compass, BookOpen, Clock, Eye, ChevronRight, PenTool } from 'lucide-react';
import BloggistLogo from './BloggistLogo.jsx';
import { formatDate } from '../utils/date.js';

const ROTATING_TOPICS = [
  'technology',
  'creative design',
  'artificial intelligence',
  'modern culture',
  'the future',
  'big ideas'
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
    <section className="relative w-full min-h-[100dvh] flex flex-col justify-between overflow-hidden px-6 pt-12 pb-8 sm:pb-12 text-black dark:text-white select-none transition-colors duration-200">
      {/* Ambient background aura / subtle light/dark accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-amber-100/30 via-indigo-100/20 to-sky-100/30 dark:from-indigo-950/15 dark:via-purple-950/10 dark:to-black/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Center Body */}
      <div className="w-full max-w-5xl mx-auto my-auto py-8 sm:py-12 flex flex-col items-center text-center space-y-8 sm:space-y-10">
        {/* Brand Emblem & Eyebrow (Transparent box, no shadow) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center space-y-3"
        >
          <div className="p-1 bg-transparent border-0 shadow-none">
            <BloggistLogo size="lg" showWordmark={false} animated={true} />
          </div>
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
            Ideas & Stories Worth Reading
          </span>
        </motion.div>

        {/* Dynamic Animated Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 max-w-4xl"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-black dark:text-white leading-[1.08] font-sans">
            Explore great stories and fresh ideas about{' '}
            <span className="relative inline-block text-black dark:text-white">
              <AnimatePresence mode="wait">
                <motion.span
                  key={topicIndex}
                  initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -20, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="inline-block underline decoration-black/30 dark:decoration-white/40 decoration-wavy underline-offset-8"
                >
                  {ROTATING_TOPICS[topicIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h1>

          <p className="text-base sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Clear writing, honest opinions, and thoughtful perspectives. Read articles that help you learn, think, and stay curious.
          </p>
        </motion.div>

        {/* Live Search & Filter Bar (No Shadow) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl space-y-4"
        >
          {/* Search Input without box shadow */}
          <div className="relative flex items-center bg-white/90 dark:bg-black/75 backdrop-blur-md border border-neutral-300 dark:border-neutral-800 shadow-none rounded-full overflow-hidden hover:border-black dark:hover:border-neutral-600 transition-colors">
            <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 ml-4 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search articles, topics, or authors..."
              className="w-full px-3 py-3 text-sm text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-hidden bg-transparent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white px-3 py-1 mr-2 cursor-pointer font-medium"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={scrollToArticles}
              className="m-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-full hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer shadow-none"
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
                      ? 'bg-black dark:bg-white text-white dark:text-black shadow-none scale-105'
                      : 'bg-white/70 dark:bg-black/60 text-neutral-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white border border-neutral-200/80 dark:border-neutral-800 backdrop-blur-xs'
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
            className="w-full max-w-2xl bg-white/80 dark:bg-black/75 backdrop-blur-md border border-neutral-200/90 dark:border-neutral-800/90 hover:border-black/50 dark:hover:border-neutral-600 p-4 sm:p-5 rounded-2xl shadow-xs dark:shadow-none transition-all group cursor-pointer text-left flex flex-col sm:flex-row items-center gap-4 text-neutral-900 dark:text-neutral-100"
          >
            {featuredArticle.banner_image && (
              <div className="w-full sm:w-36 h-28 sm:h-24 rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 border border-neutral-200 dark:border-neutral-700">
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
              <div className="flex items-center gap-2 text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                <span className="text-black dark:text-white font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded">
                  {featuredArticle.category || 'Featured'}
                </span>
                <span>·</span>
                <span>{featuredArticle.author || 'Trust Agbi'}</span>
                <span>·</span>
                <span>{formatDate(featuredArticle.created_at)}</span>
              </div>

              <h3 className="text-sm sm:text-base font-bold text-black dark:text-white tracking-tight group-hover:text-black/80 dark:group-hover:text-white/80 transition-colors line-clamp-1">
                {featuredArticle.title}
              </h3>

              {featuredArticle.excerpt && (
                <p className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2 leading-relaxed">
                  {featuredArticle.excerpt}
                </p>
              )}
            </div>

            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors shrink-0">
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
          className="group flex flex-col items-center gap-1 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer focus:outline-hidden"
          title="Scroll to latest articles"
        >
          <span className="text-[11px] font-semibold uppercase tracking-widest group-hover:translate-y-0.5 transition-transform">
            Scroll to Latest Articles
          </span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 flex items-center justify-center group-hover:border-black dark:group-hover:border-white"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </motion.div>
        </button>
      </motion.div>
    </section>
  );
}

import React, { useState } from 'react';
import { Sparkles, Check, AlertCircle, RefreshCw, Bot, Search, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api.js';

export default function SeoAioOptimizationPanel({
  articleId,
  articleData,
  seoData,
  onChange,
  onOptimizationComplete
}) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAiPreview, setShowAiPreview] = useState(true);
  const [tips, setTips] = useState([]);

  const metaTitle = seoData?.meta_title || '';
  const metaDescription = seoData?.meta_description || '';
  const keywords = seoData?.keywords || '';
  const aioSummary = seoData?.aio_summary || '';
  const seoScore = seoData?.seo_score || 88;

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.optimizeArticleForSeo({
        id: articleId,
        title: articleData?.title || metaTitle,
        excerpt: articleData?.excerpt || metaDescription,
        content_html: articleData?.content_html || '',
        author: articleData?.author || 'Trust Agbi'
      });

      const opt = response.optimization;
      if (opt) {
        if (onChange) {
          onChange({
            meta_title: opt.meta_title || metaTitle,
            meta_description: opt.meta_description || metaDescription,
            keywords: opt.keywords || keywords,
            aio_summary: opt.aio_summary || aioSummary,
            seo_score: opt.seo_score || 94
          });
        }
        if (opt.optimization_tips) {
          setTips(opt.optimization_tips);
        }
        if (onOptimizationComplete) {
          onOptimizationComplete(opt);
        }
        setSuccessMessage('Successfully optimized for search engines & AI citations!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('SEO/AIO optimization error:', err);
      setError(err.message || 'Failed to run optimization with Gemini.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60';
    if (score >= 75) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60';
  };

  return (
    <div className="border border-[#E5E5E5] dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/75 backdrop-blur-md p-6 space-y-6 shadow-xs rounded-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5] dark:border-neutral-800">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-black dark:text-white tracking-tight flex items-center gap-1.5">
              <span>SEO & AIO Engine Optimization</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black dark:bg-neutral-800 text-white dark:text-neutral-200 border border-transparent dark:border-neutral-700 rounded-full">
              Google + Perplexity / ChatGPT Ready
            </span>
          </div>
          <p className="text-xs text-[#666666] dark:text-neutral-400">
            Optimize meta tags, keyword density, structured schema, and machine-readable citations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEO Score Badge */}
          <div className={`px-3 py-1.5 rounded border text-xs font-bold flex items-center gap-1.5 ${getScoreColor(seoScore)}`}>
            <span>SEO Score:</span>
            <span className="text-sm">{seoScore}/100</span>
          </div>

          {/* Trigger Gemini AI Optimization */}
          <button
            type="button"
            onClick={handleRunOptimization}
            disabled={isOptimizing}
            className="px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs rounded-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 dark:text-amber-500 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize with Gemini'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 rounded-xs">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 rounded-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live SERP Search Snippet Preview */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          Search Engine Result Preview (SERP)
        </label>
        <div className="p-4 bg-[#F8F9FA] dark:bg-neutral-950/70 border border-[#E5E5E5] dark:border-neutral-800 rounded-xs space-y-1.5 font-sans">
          <div className="text-[11px] text-[#202124] dark:text-neutral-300 flex items-center gap-1.5 truncate">
            <span className="font-medium text-black dark:text-neutral-200">bloggist.pub</span>
            <span>› blog ›</span>
            <span className="text-[#5f6368] dark:text-neutral-400">{articleData?.slug || 'article-url'}</span>
          </div>
          <div className="text-base text-[#1a0dab] dark:text-[#8ab4f8] font-medium hover:underline cursor-pointer truncate">
            {metaTitle || articleData?.title || 'Article Title – Bloggist'}
          </div>
          <p className="text-xs text-[#4d5156] dark:text-neutral-300 line-clamp-2 leading-relaxed">
            {metaDescription || articleData?.excerpt || 'Read this in-depth essay exploring modern perspectives on technology, design, and culture on Bloggist.'}
          </p>
        </div>
      </div>

      {/* Form Fields: Meta Title & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-black dark:text-white">Meta Title (SEO & Social)</label>
            <span className={`text-[11px] ${metaTitle.length > 60 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}>
              {metaTitle.length}/60 chars
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onChange({ ...seoData, meta_title: e.target.value })}
            placeholder="Compelling, keyword-rich title for Google and social cards"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden rounded-xs placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-black dark:text-white">Target Search Keywords</label>
            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">Comma-separated</span>
          </div>
          <input
            type="text"
            value={keywords}
            onChange={(e) => onChange({ ...seoData, keywords: e.target.value })}
            placeholder="e.g. quantum computing, hardware, chips, future tech"
            className="w-full px-3 py-2 text-xs bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden rounded-xs placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-black dark:text-white">Meta Description</label>
          <span className={`text-[11px] ${metaDescription.length > 160 ? 'text-amber-600 dark:text-amber-400 font-bold' : 'text-neutral-400 dark:text-neutral-500'}`}>
            {metaDescription.length}/160 chars
          </span>
        </div>
        <textarea
          rows={2}
          value={metaDescription}
          onChange={(e) => onChange({ ...seoData, meta_description: e.target.value })}
          placeholder="Concise, click-worthy summary for search result snippets and social cards..."
          className="w-full p-2.5 text-xs bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden resize-none leading-relaxed rounded-xs placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />
      </div>

      {/* AIO (Artificial Intelligence Optimization) Direct Answer & Key Takeaways */}
      <div className="space-y-2 pt-4 border-t border-[#E5E5E5] dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-black dark:text-white flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            AIO Knowledge Block (For Perplexity, ChatGPT, Claude & Gemini citations)
          </label>
          <button
            type="button"
            onClick={() => setShowAiPreview(!showAiPreview)}
            className="text-xs text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <span>{showAiPreview ? 'Hide Preview' : 'Show Preview'}</span>
            {showAiPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs text-[#666666] dark:text-neutral-400">
          This structured direct answer and takeaways summary is embedded in the article schema so AI search engines immediately cite this article as the canonical source.
        </p>

        <textarea
          rows={4}
          value={aioSummary}
          onChange={(e) => onChange({ ...seoData, aio_summary: e.target.value })}
          placeholder="### Direct Answer&#10;A 2-sentence definitive answer.&#10;&#10;### Key Takeaways&#10;- Point 1&#10;- Point 2&#10;- Point 3"
          className="w-full p-3 text-xs bg-white dark:bg-neutral-950 text-black dark:text-white border border-[#E5E5E5] dark:border-neutral-800 focus:border-black dark:focus:border-white focus:outline-hidden font-mono leading-relaxed rounded-xs placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />

        {/* AI Citation Preview Box */}
        {showAiPreview && aioSummary && (
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-900 dark:text-indigo-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                How AI Engines (Perplexity / ChatGPT) Cite This Article
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-indigo-200/60 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded">
                Machine-Readable Schema
              </span>
            </div>
            <div className="text-xs text-neutral-800 dark:text-neutral-200 whitespace-pre-line leading-relaxed font-sans pl-2.5 border-l-2 border-indigo-400 dark:border-indigo-500">
              {aioSummary}
            </div>
          </div>
        )}
      </div>

      {/* Actionable Gemini Optimization Tips */}
      {tips.length > 0 && (
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xs space-y-2">
          <div className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Gemini Optimization Recommendations
          </div>
          <ul className="text-xs text-amber-950 dark:text-amber-200 space-y-1 list-disc pl-4">
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

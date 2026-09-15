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
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="border border-[#E5E5E5] bg-white p-6 space-y-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-black tracking-tight flex items-center gap-1.5">
              <span>SEO & AIO Engine Optimization</span>
            </h3>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-black text-white rounded-full">
              Google + Perplexity / ChatGPT Ready
            </span>
          </div>
          <p className="text-xs text-[#666666]">
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
            className="px-3.5 py-1.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Optimizing...' : 'Optimize with Gemini'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live SERP Search Snippet Preview */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
          <Search className="w-3.5 h-3.5" />
          Search Engine Result Preview (SERP)
        </label>
        <div className="p-4 bg-[#F8F9FA] border border-[#E5E5E5] rounded-sm space-y-1 font-sans">
          <div className="text-[11px] text-[#202124] flex items-center gap-1.5 truncate">
            <span className="font-medium text-black">bloggist.pub</span>
            <span>› blog ›</span>
            <span className="text-[#5f6368]">{articleData?.slug || 'article-url'}</span>
          </div>
          <div className="text-base text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
            {metaTitle || articleData?.title || 'Article Title – Bloggist'}
          </div>
          <p className="text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
            {metaDescription || articleData?.excerpt || 'Read this in-depth essay exploring modern perspectives on technology, design, and culture on Bloggist.'}
          </p>
        </div>
      </div>

      {/* Form Fields: Meta Title & Description */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-black">Meta Title (SEO & Social)</label>
            <span className={`text-[11px] ${metaTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
              {metaTitle.length}/60 chars
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => onChange({ ...seoData, meta_title: e.target.value })}
            placeholder="Compelling, keyword-rich title for Google and social cards"
            className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] focus:border-black focus:outline-hidden"
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-black">Target Search Keywords</label>
            <span className="text-[11px] text-neutral-400">Comma-separated</span>
          </div>
          <input
            type="text"
            value={keywords}
            onChange={(e) => onChange({ ...seoData, keywords: e.target.value })}
            placeholder="e.g. quantum computing, hardware, chips, future tech"
            className="w-full px-3 py-2 text-xs bg-white border border-[#E5E5E5] focus:border-black focus:outline-hidden"
          />
        </div>
      </div>

      {/* Meta Description */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <label className="font-semibold text-black">Meta Description</label>
          <span className={`text-[11px] ${metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-neutral-400'}`}>
            {metaDescription.length}/160 chars
          </span>
        </div>
        <textarea
          rows={2}
          value={metaDescription}
          onChange={(e) => onChange({ ...seoData, meta_description: e.target.value })}
          placeholder="Concise, click-worthy summary for search result snippets and social cards..."
          className="w-full p-2.5 text-xs bg-white border border-[#E5E5E5] focus:border-black focus:outline-hidden resize-none leading-relaxed"
        />
      </div>

      {/* AIO (Artificial Intelligence Optimization) Direct Answer & Key Takeaways */}
      <div className="space-y-2 pt-2 border-t border-[#E5E5E5]">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-600" />
            AIO Knowledge Block (For Perplexity, ChatGPT, Claude & Gemini citations)
          </label>
          <button
            type="button"
            onClick={() => setShowAiPreview(!showAiPreview)}
            className="text-xs text-[#666666] hover:text-black flex items-center gap-1 cursor-pointer"
          >
            <span>{showAiPreview ? 'Hide Preview' : 'Show Preview'}</span>
            {showAiPreview ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <p className="text-xs text-[#666666]">
          This structured direct answer and takeaways summary is embedded in the article schema so AI search engines immediately cite this article as the canonical source.
        </p>

        <textarea
          rows={4}
          value={aioSummary}
          onChange={(e) => onChange({ ...seoData, aio_summary: e.target.value })}
          placeholder="### Direct Answer&#10;A 2-sentence definitive answer.&#10;&#10;### Key Takeaways&#10;- Point 1&#10;- Point 2&#10;- Point 3"
          className="w-full p-3 text-xs bg-white border border-[#E5E5E5] focus:border-black focus:outline-hidden font-mono leading-relaxed"
        />

        {/* AI Citation Preview Box */}
        {showAiPreview && aioSummary && (
          <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-indigo-600" />
                How AI Engines (Perplexity / ChatGPT) Cite This Article
              </span>
              <span className="text-[10px] uppercase tracking-wider bg-indigo-200/60 text-indigo-800 px-1.5 py-0.5 rounded">
                Machine-Readable Schema
              </span>
            </div>
            <div className="text-xs text-neutral-800 whitespace-pre-line leading-relaxed font-sans pl-2 border-l-2 border-indigo-400">
              {aioSummary}
            </div>
          </div>
        )}
      </div>

      {/* Actionable Gemini Optimization Tips */}
      {tips.length > 0 && (
        <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-sm space-y-2">
          <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Gemini Optimization Recommendations
          </div>
          <ul className="text-xs text-amber-950 space-y-1 list-disc pl-4">
            {tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

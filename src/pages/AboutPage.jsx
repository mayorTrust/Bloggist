import React, { useEffect } from 'react';

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Bloggist – Editorial Ethos & Modern Publishing';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Learn about the editorial principles, minimalism, and publishing ethos behind Bloggist.'
      );
    }
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', 'About Bloggist – Editorial Ethos & Modern Publishing');
    const canonicalTag = document.querySelector('link[rel="canonical"]');
    if (canonicalTag) canonicalTag.setAttribute('href', window.location.origin + '/about');
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 space-y-12 text-black dark:text-white transition-colors">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black dark:text-white">
          About Bloggist
        </h1>
        <p className="text-xl sm:text-2xl text-[#666666] dark:text-neutral-400 leading-relaxed font-light">
          A simple place for interesting stories, ideas and perspectives.
        </p>
      </div>

      <div className="space-y-6 text-base text-black dark:text-neutral-200 leading-relaxed border-t border-[#E5E5E5] dark:border-neutral-800 pt-10">
        <p>
          Bloggist was founded on a simple principle: digital reading and writing should be calm, distraction-free, and respectful of the reader's attention.
        </p>
        <p>
          We embrace typography, whitespace, and editorial craft over algorithmic feeds, engagement traps, and visual noise.
        </p>
        <p className="text-sm text-[#666666] dark:text-neutral-500 pt-6">
          Published with care.
        </p>
      </div>
    </div>
  );
}

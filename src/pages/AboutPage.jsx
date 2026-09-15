import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20 space-y-12">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">
          About Bloggist
        </h1>
        <p className="text-xl sm:text-2xl text-[#666666] leading-relaxed font-light">
          A simple place for interesting stories, ideas and perspectives.
        </p>
      </div>

      <div className="space-y-6 text-base text-black leading-relaxed border-t border-[#E5E5E5] pt-10">
        <p>
          Bloggist was founded on a simple principle: digital reading and writing should be calm, distraction-free, and respectful of the reader's attention.
        </p>
        <p>
          We embrace typography, whitespace, and editorial craft over algorithmic feeds, engagement traps, and visual noise.
        </p>
        <p className="text-sm text-[#666666] pt-6">
          Published with care in 2026.
        </p>
      </div>
    </div>
  );
}

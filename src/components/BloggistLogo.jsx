import React from 'react';

/**
 * Bloggist Brand Logo
 * Elegant bespoke vector mark combining an editorial fountain pen nib,
 * an origami folded page, and a modern architectural 'B' monogram.
 */
export default function BloggistLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  wordmarkClassName = '',
  symbolClassName = '',
  animated = false
}) {
  // Dimensions map
  const sizeMap = {
    xs: { icon: 18, text: 'text-xs tracking-[0.15em]', gap: 'gap-1.5' },
    sm: { icon: 22, text: 'text-sm tracking-[0.16em]', gap: 'gap-2' },
    md: { icon: 28, text: 'text-base sm:text-lg tracking-[0.18em]', gap: 'gap-2.5' },
    lg: { icon: 36, text: 'text-xl sm:text-2xl tracking-[0.2em]', gap: 'gap-3' },
    xl: { icon: 48, text: 'text-2xl sm:text-3xl tracking-[0.22em]', gap: 'gap-3.5' }
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none group ${className}`}>
      {/* Bespoke Geometric Vector Icon */}
      <div
        className={`relative shrink-0 flex items-center justify-center transition-transform duration-300 ${
          animated ? 'group-hover:scale-105 group-hover:rotate-1' : ''
        } ${symbolClassName}`}
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Ambient editorial gradient */}
            <linearGradient id="bloggist-grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="50%" stopColor="#27272a" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>

            <linearGradient id="bloggist-nib-gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="60%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>

            <linearGradient id="bloggist-sheen" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer geometric shield / rounded square container */}
          <rect
            x="1.5"
            y="1.5"
            width="33"
            height="33"
            rx="8"
            fill="url(#bloggist-grad-accent)"
            stroke="#000000"
            strokeWidth="1.2"
          />

          {/* Folded editorial page facet (subtle origami corner) */}
          <path
            d="M26.5 2.5L34.5 10.5V26.5C34.5 30.5 30.5 34.5 26.5 34.5H9.5C5.5 34.5 1.5 30.5 1.5 26.5V9.5C1.5 5.5 5.5 1.5 9.5 1.5H26.5Z"
            fill="url(#bloggist-sheen)"
            opacity="0.25"
          />

          {/* Monogram 'B' + Fountain Pen Nib Vector Symbol */}
          {/* Stem of the B / Pen shaft */}
          <rect
            x="7.5"
            y="8.5"
            width="4.2"
            height="19"
            rx="1.5"
            fill="#ffffff"
          />

          {/* Upper loop of B with quill precision cut */}
          <path
            d="M11.7 8.5H19C22.3 8.5 24.5 10.3 24.5 13C24.5 15.2 23 16.8 20.8 17.3L11.7 17.3V8.5Z"
            fill="#ffffff"
          />
          <path
            d="M11.7 10.5H18.5C20.5 10.5 21.8 11.5 21.8 13C21.8 14.5 20.5 15.5 18.5 15.5H11.7V10.5Z"
            fill="#18181b"
          />

          {/* Lower loop of B extending into dynamic quill wing */}
          <path
            d="M11.7 16.5H20.5C23.8 16.5 26 18.5 26 21.5C26 24.5 23.5 27.5 19.5 27.5H11.7V16.5Z"
            fill="#ffffff"
          />
          <path
            d="M11.7 18.7H19C21.2 18.7 22.8 20 22.8 21.8C22.8 23.6 21.2 25.1 19 25.1H11.7V18.7Z"
            fill="#18181b"
          />

          {/* Glowing Quill Nib Core / Spark of Thought */}
          <circle
            cx="27.5"
            cy="8.5"
            r="2.2"
            fill="url(#bloggist-nib-gold)"
          />
          <circle
            cx="27.5"
            cy="8.5"
            r="3.5"
            stroke="url(#bloggist-nib-gold)"
            strokeWidth="0.8"
            strokeOpacity="0.5"
            className="animate-pulse"
          />
        </svg>
      </div>

      {/* Typographic Wordmark */}
      {showWordmark && (
        <div className="flex items-baseline">
          <span
            className={`font-black text-black uppercase transition-colors tracking-[0.16em] ${currentSize.text} ${wordmarkClassName}`}
            style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
          >
            BLOGGIST
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-black ml-1 transition-transform group-hover:scale-125" />
        </div>
      )}
    </div>
  );
}

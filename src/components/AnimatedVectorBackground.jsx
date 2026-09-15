import React, { useEffect, useState, useRef, useMemo } from 'react';

/**
 * AnimatedVectorBackground
 * Renders distinct, silky smooth animated vector graphics for each page archetype.
 * Uses SVG vector paths, gradients (purple, blue, red, yellow, emerald, coral),
 * and GPU-accelerated CSS keyframe animations with subtle mouse parallax.
 */
export default function AnimatedVectorBackground({ currentPath = '/', isAdminAuthenticated = true }) {
  // Determine page type
  const pageType = useMemo(() => {
    if (currentPath.startsWith('/admin')) {
      if (!isAdminAuthenticated) return 'admin-auth';
      if (currentPath === '/admin') return 'admin-overview';
      if (currentPath === '/admin/articles') return 'admin-articles';
      if (currentPath.includes('/admin/articles/new') || currentPath.includes('/admin/articles/edit')) return 'admin-editor';
      return 'admin-overview';
    }
    if (currentPath.startsWith('/blog/')) return 'article';
    if (currentPath === '/about') return 'about';
    if (currentPath === '/contact') return 'contact';
    return 'home';
  }, [currentPath, isAdminAuthenticated]);

  // Mouse parallax state
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const targetOffsetRef = useRef({ x: 0, y: 0 });
  const currentOffsetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1
      targetOffsetRef.current = { x: x * 22, y: y * 18 };
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const { innerWidth, innerHeight } = window;
        const x = (e.touches[0].clientX / innerWidth - 0.5) * 2;
        const y = (e.touches[0].clientY / innerHeight - 0.5) * 2;
        targetOffsetRef.current = { x: x * 15, y: y * 12 };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    // Smooth lerp loop
    const animate = () => {
      const cur = currentOffsetRef.current;
      const target = targetOffsetRef.current;
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      setMouseOffset({ x: cur.x, y: cur.y });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none transition-colors duration-500 ease-in-out bg-[#fafaf9] dark:bg-[#0a0a0a]"
      style={{
        contain: 'paint layout size'
      }}
    >
      {/* Dynamic Vector Canvas with subtle organic edge smoothing */}
      <svg
        className="w-full h-full object-cover transition-transform duration-300 ease-out opacity-90 dark:opacity-85"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `translate3d(${mouseOffset.x}px, ${mouseOffset.y}px, 0) scale(1.04)`,
          filter: 'blur(0.5px)',
          WebkitFilter: 'blur(0.5px)'
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Universal Shared Styles & Keyframes */}
          <style>{`
            @keyframes vectorFlow1 {
              0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
              50% { transform: translate(-30px, 20px) rotate(2deg) scale(1.03); }
              100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
            }
            @keyframes vectorFlow2 {
              0% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
              50% { transform: translate(35px, -25px) rotate(-3deg) scale(0.97); }
              100% { transform: translate(0px, 0px) rotate(0deg) scale(1); }
            }
            @keyframes vectorSpinCW {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes vectorSpinCCW {
              0% { transform: rotate(360deg); }
              100% { transform: rotate(0deg); }
            }
            @keyframes vectorPulseSlow {
              0%, 100% { opacity: 0.35; transform: scale(1); }
              50% { opacity: 0.7; transform: scale(1.06); }
            }
            @keyframes vectorDashLoop {
              to { stroke-dashoffset: -120; }
            }
            @keyframes vectorWaveShift {
              0% { transform: translateX(0px); }
              50% { transform: translateX(-40px); }
              100% { transform: translateX(0px); }
            }
            @keyframes vectorFloatTilt {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-18px) rotate(4deg); }
            }
            @keyframes vectorRadarPulse {
              0% { r: 40px; opacity: 0.8; }
              100% { r: 360px; opacity: 0; }
            }
            @keyframes vectorGridRoll {
              0% { transform: translateY(0px); }
              100% { transform: translateY(60px); }
            }
          `}</style>

          {/* Color Palettes Gradients */}
          {/* 1. Purple & Violet */}
          <linearGradient id="grad-purple-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.65" />
          </linearGradient>

          <linearGradient id="grad-violet-rose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#ec4899" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.65" />
          </linearGradient>

          {/* 2. Blue & Cyan */}
          <linearGradient id="grad-blue-sky" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
          </linearGradient>

          {/* 3. Red & Coral */}
          <linearGradient id="grad-red-amber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.7" />
          </linearGradient>

          {/* 4. Yellow & Amber Gold */}
          <linearGradient id="grad-yellow-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.7" />
          </linearGradient>

          {/* 5. Emerald & Cyan */}
          <linearGradient id="grad-emerald-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="60%" stopColor="#06b6d4" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.65" />
          </linearGradient>

          {/* 6. Multi Spectrum Ribbon */}
          <linearGradient id="grad-spectrum-full" x1="0%" y1="0%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="25%" stopColor="#3b82f6" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.7" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.8" />
          </linearGradient>

          {/* Radial Glows */}
          <radialGradient id="glow-purple" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c084fc" stopOpacity="0.52" />
            <stop offset="60%" stopColor="#a855f7" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="glow-blue" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.52" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="glow-yellow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fde047" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="glow-red" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.52" />
            <stop offset="60%" stopColor="#e11d48" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ========================================================================= */}
        {/* DESIGN 1: HOME PAGE - Dynamic Celestial Ribbons & Editorial Currents     */}
        {/* ========================================================================= */}
        {pageType === 'home' && (
          <g id="bg-home-vectors" className="transition-opacity duration-500">
            {/* Ambient radiant color washes */}
            <circle cx="200" cy="180" r="320" fill="url(#glow-purple)" />
            <circle cx="1280" cy="220" r="360" fill="url(#glow-yellow)" />
            <circle cx="1150" cy="780" r="380" fill="url(#glow-blue)" />
            <circle cx="150" cy="820" r="340" fill="url(#glow-red)" />

            {/* Major Flowing Undulating Ribbons */}
            <g style={{ animation: 'vectorFlow1 18s ease-in-out infinite' }}>
              <path
                d="M -100 320 C 240 180, 520 440, 920 260 C 1220 120, 1420 340, 1600 240"
                fill="none"
                stroke="url(#grad-purple-blue)"
                strokeWidth="3"
                strokeOpacity="0.5"
              />
              <path
                d="M -100 360 C 260 220, 540 480, 940 300 C 1240 160, 1440 380, 1600 280"
                fill="none"
                stroke="url(#grad-purple-blue)"
                strokeWidth="1.5"
                strokeDasharray="6 8"
                strokeOpacity="0.4"
                style={{ animation: 'vectorDashLoop 24s linear infinite' }}
              />
            </g>

            <g style={{ animation: 'vectorFlow2 22s ease-in-out infinite' }}>
              <path
                d="M -60 620 C 320 480, 680 780, 1080 540 C 1320 400, 1480 620, 1600 580"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="3.5"
                strokeOpacity="0.55"
              />
              <path
                d="M -60 660 C 340 520, 700 820, 1100 580 C 1340 440, 1500 660, 1600 620"
                fill="none"
                stroke="url(#grad-red-amber)"
                strokeWidth="1.5"
                strokeOpacity="0.45"
              />
            </g>

            <g style={{ animation: 'vectorFlow1 26s ease-in-out infinite reverse' }}>
              <path
                d="M -80 180 C 380 340, 780 120, 1180 340 C 1380 440, 1520 280, 1600 320"
                fill="none"
                stroke="url(#grad-violet-rose)"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
            </g>

            {/* Intersecting Celestial Orbital Rings (Upper Right) */}
            <g
              transform="translate(1220, 220)"
              style={{
                transformOrigin: '1220px 220px',
                animation: 'vectorSpinCW 80s linear infinite'
              }}
            >
              <circle
                r="180"
                fill="none"
                stroke="url(#grad-purple-blue)"
                strokeWidth="2"
                strokeOpacity="0.45"
              />
              <circle
                r="140"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                strokeOpacity="0.5"
              />
              <circle
                r="95"
                fill="none"
                stroke="url(#grad-red-amber)"
                strokeWidth="2"
                strokeOpacity="0.4"
              />
              {/* Satellite Node vectors */}
              <circle cx="180" cy="0" r="5" fill="#8b5cf6" fillOpacity="0.7" />
              <circle cx="-140" cy="0" r="4.5" fill="#f59e0b" fillOpacity="0.8" />
              <circle cx="0" cy="95" r="4" fill="#f43f5e" fillOpacity="0.75" />
            </g>

            {/* Counter-Spinning Celestial Rings (Bottom Left) */}
            <g
              transform="translate(180, 720)"
              style={{
                transformOrigin: '180px 720px',
                animation: 'vectorSpinCCW 95s linear infinite'
              }}
            >
              <circle
                r="160"
                fill="none"
                stroke="url(#grad-blue-sky)"
                strokeWidth="2"
                strokeOpacity="0.4"
              />
              <circle
                r="115"
                fill="none"
                stroke="url(#grad-violet-rose)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                strokeOpacity="0.45"
              />
              <circle cx="115" cy="0" r="4.5" fill="#0ea5e9" fillOpacity="0.75" />
              <circle cx="-160" cy="0" r="5" fill="#ec4899" fillOpacity="0.7" />
            </g>

            {/* Harmonic Diamond Constellations */}
            <g style={{ animation: 'vectorPulseSlow 8s ease-in-out infinite' }}>
              <polygon
                points="720,110 735,130 720,150 705,130"
                fill="url(#grad-yellow-gold)"
                fillOpacity="0.35"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />
              <polygon
                points="620,780 635,800 620,820 605,800"
                fill="url(#grad-purple-blue)"
                fillOpacity="0.3"
                stroke="#8b5cf6"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />
              <polygon
                points="1340,580 1352,595 1340,610 1328,595"
                fill="url(#grad-red-amber)"
                fillOpacity="0.35"
                stroke="#f43f5e"
                strokeWidth="1.5"
                strokeOpacity="0.65"
              />
              <polygon
                points="110,420 122,435 110,450 98,435"
                fill="url(#grad-emerald-cyan)"
                fillOpacity="0.3"
                stroke="#06b6d4"
                strokeWidth="1.5"
                strokeOpacity="0.6"
              />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 2: ARTICLE READING PAGE - Typographic Topography & Contours       */}
        {/* ========================================================================= */}
        {pageType === 'article' && (
          <g id="bg-article-vectors" className="transition-opacity duration-500">
            {/* Calming, focused color glow wells */}
            <circle cx="1320" cy="180" r="320" fill="url(#glow-blue)" />
            <circle cx="120" cy="400" r="340" fill="url(#glow-purple)" />
            <circle cx="1280" cy="750" r="300" fill="url(#glow-yellow)" />

            {/* Serene topographic contour lines sweeping in from the margins */}
            <g style={{ animation: 'vectorWaveShift 14s ease-in-out infinite' }}>
              <path
                d="M -80 160 Q 320 80, 720 180 T 1520 120"
                fill="none"
                stroke="url(#grad-purple-blue)"
                strokeWidth="2.5"
                strokeOpacity="0.45"
              />
              <path
                d="M -80 220 Q 340 140, 740 240 T 1520 180"
                fill="none"
                stroke="url(#grad-emerald-cyan)"
                strokeWidth="1.8"
                strokeOpacity="0.4"
              />
              <path
                d="M -80 280 Q 360 200, 760 300 T 1520 240"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
                strokeOpacity="0.4"
              />
              <path
                d="M -80 340 Q 380 260, 780 360 T 1520 300"
                fill="none"
                stroke="url(#grad-violet-rose)"
                strokeWidth="2"
                strokeOpacity="0.35"
              />
            </g>

            {/* Lower Reading Margin Contour Echo */}
            <g style={{ animation: 'vectorWaveShift 18s ease-in-out infinite reverse' }}>
              <path
                d="M -80 680 Q 400 760, 800 660 T 1520 720"
                fill="none"
                stroke="url(#grad-blue-sky)"
                strokeWidth="2.2"
                strokeOpacity="0.4"
              />
              <path
                d="M -80 740 Q 420 820, 820 720 T 1520 780"
                fill="none"
                stroke="url(#grad-red-amber)"
                strokeWidth="1.8"
                strokeOpacity="0.45"
              />
              <path
                d="M -80 800 Q 440 880, 840 780 T 1520 840"
                fill="none"
                stroke="url(#grad-purple-blue)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                strokeOpacity="0.35"
              />
            </g>

            {/* Rotating Golden Ratio Spiral Arc in Top-Right */}
            <g
              transform="translate(1320, 160)"
              style={{
                transformOrigin: '1320px 160px',
                animation: 'vectorSpinCW 110s linear infinite'
              }}
            >
              <circle
                r="150"
                fill="none"
                stroke="url(#grad-violet-rose)"
                strokeWidth="1.5"
                strokeOpacity="0.4"
              />
              <circle
                r="105"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                strokeOpacity="0.45"
              />
              <circle
                r="65"
                fill="none"
                stroke="url(#grad-blue-sky)"
                strokeWidth="2"
                strokeOpacity="0.5"
              />
              {/* Editorial Crosshairs */}
              <line x1="-165" y1="0" x2="165" y2="0" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.3" />
              <line x1="0" y1="-165" x2="0" y2="165" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.3" />
            </g>

            {/* Left Margin Resonant Harmonic Rings */}
            <g transform="translate(100, 520)">
              <circle
                r="70"
                fill="none"
                stroke="url(#grad-emerald-cyan)"
                strokeWidth="2"
                strokeOpacity="0.4"
              />
              <circle
                r="110"
                fill="none"
                stroke="url(#grad-red-amber)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                strokeOpacity="0.35"
              />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 3: ABOUT PAGE - Architectural Prisms, Polygons & Golden Harmonics */}
        {/* ========================================================================= */}
        {pageType === 'about' && (
          <g id="bg-about-vectors" className="transition-opacity duration-500">
            {/* Luminous Warm Ambient Glows */}
            <circle cx="220" cy="260" r="340" fill="url(#glow-yellow)" />
            <circle cx="1240" cy="280" r="340" fill="url(#glow-purple)" />
            <circle cx="720" cy="780" r="380" fill="url(#glow-red)" />

            {/* Floating 3D Isometric Prisms (Left side) */}
            <g
              transform="translate(220, 360)"
              style={{
                transformOrigin: '220px 360px',
                animation: 'vectorFloatTilt 12s ease-in-out infinite'
              }}
            >
              {/* Isometric Cube Facets */}
              {/* Top Facet */}
              <polygon
                points="0,-90 78,-45 0,0 -78,-45"
                fill="url(#grad-yellow-gold)"
                fillOpacity="0.22"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeOpacity="0.65"
              />
              {/* Left Facet */}
              <polygon
                points="-78,-45 0,0 0,90 -78,45"
                fill="url(#grad-red-amber)"
                fillOpacity="0.18"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeOpacity="0.6"
              />
              {/* Right Facet */}
              <polygon
                points="0,0 78,-45 78,45 0,90"
                fill="url(#grad-purple-blue)"
                fillOpacity="0.2"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeOpacity="0.6"
              />
              {/* Internal axis vectors */}
              <line x1="0" y1="0" x2="0" y2="-130" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5" />
              <line x1="0" y1="0" x2="120" y2="69" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5" />
              <line x1="0" y1="0" x2="-120" y2="69" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.5" />
            </g>

            {/* Floating Faceted Diamond Prism (Right side) */}
            <g
              transform="translate(1220, 420)"
              style={{
                transformOrigin: '1220px 420px',
                animation: 'vectorFloatTilt 15s ease-in-out infinite reverse'
              }}
            >
              {/* Upper Octahedron */}
              <polygon
                points="0,-120 90,0 0,20 -90,0"
                fill="url(#grad-violet-rose)"
                fillOpacity="0.25"
                stroke="#a855f7"
                strokeWidth="2"
                strokeOpacity="0.7"
              />
              {/* Lower Octahedron */}
              <polygon
                points="0,20 90,0 0,130 -90,0"
                fill="url(#grad-blue-sky)"
                fillOpacity="0.2"
                stroke="#0ea5e9"
                strokeWidth="2"
                strokeOpacity="0.65"
              />
              <circle r="120" fill="none" stroke="url(#grad-yellow-gold)" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.45" />
            </g>

            {/* Architectural Isometric Grid Ground Lines */}
            <g style={{ animation: 'vectorFlow1 20s ease-in-out infinite' }}>
              <path
                d="M -100 800 L 1540 500"
                stroke="url(#grad-purple-blue)"
                strokeWidth="2"
                strokeOpacity="0.35"
              />
              <path
                d="M -100 700 L 1540 400"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="1.5"
                strokeDasharray="8 6"
                strokeOpacity="0.4"
              />
              <path
                d="M -100 600 L 1540 900"
                stroke="url(#grad-red-amber)"
                strokeWidth="2"
                strokeOpacity="0.35"
              />
              <path
                d="M -100 500 L 1540 800"
                stroke="url(#grad-emerald-cyan)"
                strokeWidth="1.5"
                strokeDasharray="6 6"
                strokeOpacity="0.35"
              />
            </g>

            {/* Interlocking Circles of Proportion (Center-Top background) */}
            <g
              transform="translate(720, 180)"
              style={{
                transformOrigin: '720px 180px',
                animation: 'vectorSpinCW 120s linear infinite'
              }}
            >
              <circle cx="-50" cy="0" r="110" fill="none" stroke="url(#grad-yellow-gold)" strokeWidth="1.8" strokeOpacity="0.45" />
              <circle cx="50" cy="0" r="110" fill="none" stroke="url(#grad-violet-rose)" strokeWidth="1.8" strokeOpacity="0.45" />
              <circle cx="0" cy="-60" r="110" fill="none" stroke="url(#grad-blue-sky)" strokeWidth="1.8" strokeOpacity="0.4" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 4: CONTACT PAGE - Dynamic Constellations, Radar & Pulse Beacons   */}
        {/* ========================================================================= */}
        {pageType === 'contact' && (
          <g id="bg-contact-vectors" className="transition-opacity duration-500">
            {/* Vibrant, inviting red, amber and coral glows */}
            <circle cx="720" cy="460" r="380" fill="url(#glow-red)" />
            <circle cx="180" cy="220" r="320" fill="url(#glow-yellow)" />
            <circle cx="1260" cy="300" r="340" fill="url(#glow-purple)" />

            {/* Concentric Pulsing Radar Beacon Waves radiating from form area */}
            <g transform="translate(720, 420)">
              <circle
                r="120"
                fill="none"
                stroke="url(#grad-red-amber)"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <circle
                r="200"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="2"
                strokeDasharray="8 6"
                strokeOpacity="0.45"
              />
              <circle
                r="290"
                fill="none"
                stroke="url(#grad-violet-rose)"
                strokeWidth="1.8"
                strokeOpacity="0.4"
              />
              <circle
                r="390"
                fill="none"
                stroke="url(#grad-blue-sky)"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                strokeOpacity="0.35"
              />

              {/* Crosshair Sweep Axis */}
              <line x1="-420" y1="0" x2="420" y2="0" stroke="url(#grad-red-amber)" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.4" />
              <line x1="0" y1="-420" x2="0" y2="420" stroke="url(#grad-red-amber)" strokeWidth="1.5" strokeDasharray="6 6" strokeOpacity="0.4" />
            </g>

            {/* Connected Network Constellation Nodes (Interactive communication theme) */}
            <g style={{ animation: 'vectorFlow1 16s ease-in-out infinite' }}>
              {/* Connecting filament vector lines */}
              <line x1="180" y1="180" x2="340" y2="280" stroke="url(#grad-yellow-gold)" strokeWidth="2" strokeOpacity="0.55" />
              <line x1="340" y1="280" x2="260" y2="480" stroke="url(#grad-red-amber)" strokeWidth="2" strokeOpacity="0.5" />
              <line x1="260" y1="480" x2="420" y2="620" stroke="url(#grad-violet-rose)" strokeWidth="2" strokeOpacity="0.5" />
              <line x1="1260" y1="200" x2="1100" y2="340" stroke="url(#grad-purple-blue)" strokeWidth="2" strokeOpacity="0.55" />
              <line x1="1100" y1="340" x2="1180" y2="540" stroke="url(#grad-blue-sky)" strokeWidth="2" strokeOpacity="0.5" />
              <line x1="1180" y1="540" x2="1020" y2="680" stroke="url(#grad-emerald-cyan)" strokeWidth="2" strokeOpacity="0.5" />

              {/* Glowing Nodes */}
              <circle cx="180" cy="180" r="8" fill="#f59e0b" fillOpacity="0.8" stroke="#fef08a" strokeWidth="3" strokeOpacity="0.7" />
              <circle cx="340" cy="280" r="7" fill="#ef4444" fillOpacity="0.85" stroke="#fca5a5" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="260" cy="480" r="6" fill="#a855f7" fillOpacity="0.8" stroke="#e9d5ff" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="420" cy="620" r="8" fill="#ec4899" fillOpacity="0.8" stroke="#fbcfe8" strokeWidth="2" strokeOpacity="0.8" />

              <circle cx="1260" cy="200" r="8" fill="#8b5cf6" fillOpacity="0.8" stroke="#ddd6fe" strokeWidth="3" strokeOpacity="0.7" />
              <circle cx="1100" cy="340" r="7" fill="#0ea5e9" fillOpacity="0.85" stroke="#bae6fd" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="1180" cy="540" r="6" fill="#10b981" fillOpacity="0.85" stroke="#a7f3d0" strokeWidth="2" strokeOpacity="0.8" />
              <circle cx="1020" cy="680" r="8" fill="#f59e0b" fillOpacity="0.8" stroke="#fde68a" strokeWidth="2" strokeOpacity="0.8" />
            </g>

            {/* Communication Signal Sine Wave at top & bottom */}
            <path
              d="M -100 80 Q 200 140, 500 80 T 1100 80 T 1600 80"
              fill="none"
              stroke="url(#grad-red-amber)"
              strokeWidth="2.5"
              strokeOpacity="0.45"
              style={{ animation: 'vectorWaveShift 12s ease-in-out infinite' }}
            />
            <path
              d="M -100 820 Q 200 760, 500 820 T 1100 820 T 1600 820"
              fill="none"
              stroke="url(#grad-yellow-gold)"
              strokeWidth="2.5"
              strokeOpacity="0.45"
              style={{ animation: 'vectorWaveShift 12s ease-in-out infinite reverse' }}
            />
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 5: ADMIN OVERVIEW - Cyber Topography Grid & Telemetry Splines     */}
        {/* ========================================================================= */}
        {pageType === 'admin-overview' && (
          <g id="bg-admin-overview-vectors" className="transition-opacity duration-500">
            {/* Tech High-Contrast Glows: Royal Purple, Electric Cyan, Neon Yellow */}
            <circle cx="1180" cy="240" r="360" fill="url(#glow-purple)" />
            <circle cx="200" cy="320" r="340" fill="url(#glow-blue)" />
            <circle cx="720" cy="800" r="360" fill="url(#glow-yellow)" />

            {/* 3D Wireframe Perspective Grid Floor (Rolls smoothly) */}
            <g opacity="0.45">
              {/* Perspective rays converging from horizon (y=260) */}
              <line x1="720" y1="260" x2="-200" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="60" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="320" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="580" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="860" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="1120" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="1380" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />
              <line x1="720" y1="260" x2="1640" y2="950" stroke="url(#grad-purple-blue)" strokeWidth="1.5" />

              {/* Horizontal depth rungs */}
              <line x1="50" y1="400" x2="1390" y2="400" stroke="url(#grad-purple-blue)" strokeWidth="1.2" strokeOpacity="0.5" />
              <line x1="0" y1="520" x2="1440" y2="520" stroke="url(#grad-emerald-cyan)" strokeWidth="1.5" strokeOpacity="0.6" />
              <line x1="-100" y1="680" x2="1540" y2="680" stroke="url(#grad-purple-blue)" strokeWidth="1.8" strokeOpacity="0.7" />
              <line x1="-200" y1="880" x2="1640" y2="880" stroke="url(#grad-yellow-gold)" strokeWidth="2.2" strokeOpacity="0.75" />
            </g>

            {/* Dynamic Telemetry Wave 1 (Electric Blue & Cyan) */}
            <g style={{ animation: 'vectorWaveShift 10s ease-in-out infinite' }}>
              <path
                d="M -60 380 Q 200 240, 480 340 T 980 280 T 1500 360"
                fill="none"
                stroke="url(#grad-blue-sky)"
                strokeWidth="3.5"
                strokeOpacity="0.6"
              />
              <path
                d="M -60 380 Q 200 240, 480 340 T 980 280 T 1500 360"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="8 12"
                strokeOpacity="0.9"
                style={{ animation: 'vectorDashLoop 16s linear infinite' }}
              />
            </g>

            {/* Dynamic Telemetry Wave 2 (Neon Yellow & Amber) */}
            <g style={{ animation: 'vectorWaveShift 14s ease-in-out infinite reverse' }}>
              <path
                d="M -60 480 Q 300 580, 680 440 T 1180 520 T 1500 420"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="3"
                strokeOpacity="0.55"
              />
            </g>

            {/* Isometric Telemetry Dashboard Ring (Top Right) */}
            <g
              transform="translate(1240, 180)"
              style={{
                transformOrigin: '1240px 180px',
                animation: 'vectorSpinCW 70s linear infinite'
              }}
            >
              <circle r="130" fill="none" stroke="url(#grad-purple-blue)" strokeWidth="2" strokeOpacity="0.5" />
              <circle r="100" fill="none" stroke="url(#grad-emerald-cyan)" strokeWidth="2" strokeDasharray="6 8" strokeOpacity="0.55" />
              <circle r="70" fill="none" stroke="url(#grad-yellow-gold)" strokeWidth="1.5" strokeOpacity="0.6" />
              {/* Telemetry dial ticks */}
              <line x1="0" y1="-140" x2="0" y2="-120" stroke="#8b5cf6" strokeWidth="2" />
              <line x1="0" y1="120" x2="0" y2="140" stroke="#8b5cf6" strokeWidth="2" />
              <line x1="-140" y1="0" x2="-120" y2="0" stroke="#8b5cf6" strokeWidth="2" />
              <line x1="120" y1="0" x2="140" y2="0" stroke="#8b5cf6" strokeWidth="2" />
            </g>

            {/* Floating Metric Diamond Node (Top Left) */}
            <g
              transform="translate(160, 220)"
              style={{
                transformOrigin: '160px 220px',
                animation: 'vectorFloatTilt 9s ease-in-out infinite'
              }}
            >
              <polygon
                points="0,-55 55,0 0,55 -55,0"
                fill="url(#grad-purple-blue)"
                fillOpacity="0.25"
                stroke="#8b5cf6"
                strokeWidth="2"
                strokeOpacity="0.75"
              />
              <circle r="4" fill="#06b6d4" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 6: ADMIN ARTICLES LIST - Cascading Index Matrices & Cadence       */}
        {/* ========================================================================= */}
        {pageType === 'admin-articles' && (
          <g id="bg-admin-articles-vectors" className="transition-opacity duration-500">
            {/* Emerald, Cyan, Violet and Amber ambient pools */}
            <circle cx="180" cy="300" r="320" fill="url(#glow-blue)" />
            <circle cx="1260" cy="320" r="340" fill="url(#glow-purple)" />
            <circle cx="720" cy="740" r="360" fill="url(#glow-yellow)" />

            {/* Cascading Translucent Article Document Vector Outlines (Drifting Left to Right) */}
            <g style={{ animation: 'vectorFlow1 22s ease-in-out infinite' }}>
              {/* Layered Document 1 */}
              <g transform="translate(120, 240) rotate(-6)">
                <rect
                  x="0"
                  y="0"
                  width="200"
                  height="270"
                  rx="12"
                  fill="url(#grad-emerald-cyan)"
                  fillOpacity="0.12"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeOpacity="0.55"
                />
                <line x1="25" y1="40" x2="130" y2="40" stroke="#10b981" strokeWidth="2.5" strokeOpacity="0.6" />
                <line x1="25" y1="70" x2="175" y2="70" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="25" y1="95" x2="175" y2="95" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="25" y1="120" x2="140" y2="120" stroke="#06b6d4" strokeWidth="1.5" strokeOpacity="0.4" />
              </g>

              {/* Layered Document 2 */}
              <g transform="translate(1120, 280) rotate(8)">
                <rect
                  x="0"
                  y="0"
                  width="210"
                  height="280"
                  rx="12"
                  fill="url(#grad-purple-blue)"
                  fillOpacity="0.12"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeOpacity="0.55"
                />
                <line x1="25" y1="40" x2="140" y2="40" stroke="#8b5cf6" strokeWidth="2.5" strokeOpacity="0.6" />
                <line x1="25" y1="70" x2="185" y2="70" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="25" y1="95" x2="185" y2="95" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="25" y1="120" x2="150" y2="120" stroke="#a855f7" strokeWidth="1.5" strokeOpacity="0.4" />
              </g>
            </g>

            {/* Diagonal Speed Cadence Guides */}
            <g style={{ animation: 'vectorWaveShift 15s ease-in-out infinite' }}>
              <path
                d="M -100 450 L 1540 180"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="2"
                strokeDasharray="12 8"
                strokeOpacity="0.45"
              />
              <path
                d="M -100 550 L 1540 280"
                stroke="url(#grad-emerald-cyan)"
                strokeWidth="2.5"
                strokeOpacity="0.4"
              />
              <path
                d="M -100 650 L 1540 380"
                stroke="url(#grad-violet-rose)"
                strokeWidth="2"
                strokeDasharray="6 10"
                strokeOpacity="0.4"
              />
            </g>

            {/* Floating Index Ring (Center Bottom) */}
            <g
              transform="translate(720, 780)"
              style={{
                transformOrigin: '720px 780px',
                animation: 'vectorSpinCW 90s linear infinite'
              }}
            >
              <circle r="140" fill="none" stroke="url(#grad-purple-blue)" strokeWidth="2" strokeOpacity="0.45" />
              <circle r="95" fill="none" stroke="url(#grad-yellow-gold)" strokeWidth="1.8" strokeDasharray="5 7" strokeOpacity="0.5" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 7: ADMIN ARTICLE EDITOR - Creative Splines & Floating Pen Studio   */}
        {/* ========================================================================= */}
        {pageType === 'admin-editor' && (
          <g id="bg-admin-editor-vectors" className="transition-opacity duration-500">
            {/* Inspiring studio lights: Crimson Red, Vibrant Gold, Royal Violet, Azure */}
            <circle cx="120" cy="180" r="340" fill="url(#glow-purple)" />
            <circle cx="1320" cy="220" r="340" fill="url(#glow-yellow)" />
            <circle cx="200" cy="740" r="340" fill="url(#glow-red)" />
            <circle cx="1260" cy="760" r="340" fill="url(#glow-blue)" />

            {/* Expressive Bezier Splines with Visible Vector Tangents & Control Points */}
            <g style={{ animation: 'vectorFlow1 16s ease-in-out infinite' }}>
              {/* Major Spline Curve (Top to Bottom diagonal) */}
              <path
                d="M -80 180 C 380 40, 680 480, 1140 220 C 1380 90, 1480 340, 1560 300"
                fill="none"
                stroke="url(#grad-violet-rose)"
                strokeWidth="3.5"
                strokeOpacity="0.6"
              />

              {/* Tangent Handle Vectors (simulating vector design app anchor points) */}
              <line x1="380" y1="40" x2="380" y2="120" stroke="#f43f5e" strokeWidth="1.8" strokeOpacity="0.7" />
              <circle cx="380" cy="40" r="5" fill="#f43f5e" />
              <circle cx="380" cy="120" r="4" fill="#fbbf24" stroke="#f43f5e" strokeWidth="1.5" />

              <line x1="680" y1="480" x2="680" y2="390" stroke="#8b5cf6" strokeWidth="1.8" strokeOpacity="0.7" />
              <circle cx="680" cy="480" r="5" fill="#8b5cf6" />
              <circle cx="680" cy="390" r="4" fill="#38bdf8" stroke="#8b5cf6" strokeWidth="1.5" />

              <line x1="1140" y1="220" x2="1200" y2="160" stroke="#f59e0b" strokeWidth="1.8" strokeOpacity="0.7" />
              <circle cx="1140" cy="220" r="5" fill="#f59e0b" />
              <circle cx="1200" cy="160" r="4" fill="#ec4899" stroke="#f59e0b" strokeWidth="1.5" />
            </g>

            {/* Lower Harmonic Editor Curve */}
            <g style={{ animation: 'vectorFlow2 20s ease-in-out infinite' }}>
              <path
                d="M -60 740 C 320 620, 640 880, 1020 660 C 1320 520, 1480 720, 1600 680"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="3"
                strokeOpacity="0.55"
              />
              <path
                d="M -60 780 C 340 660, 660 920, 1040 700 C 1340 560, 1500 760, 1600 720"
                fill="none"
                stroke="url(#grad-blue-sky)"
                strokeWidth="1.8"
                strokeDasharray="8 6"
                strokeOpacity="0.5"
              />
            </g>

            {/* Creative Color Harmony Rings (Top Right) */}
            <g
              transform="translate(1260, 240)"
              style={{
                transformOrigin: '1260px 240px',
                animation: 'vectorSpinCW 65s linear infinite'
              }}
            >
              <circle r="150" fill="none" stroke="url(#grad-spectrum-full)" strokeWidth="2.5" strokeOpacity="0.55" />
              <circle r="110" fill="none" stroke="url(#grad-violet-rose)" strokeWidth="2" strokeDasharray="6 8" strokeOpacity="0.5" />
              <circle r="70" fill="none" stroke="url(#grad-yellow-gold)" strokeWidth="1.5" strokeOpacity="0.6" />
              <circle cx="150" cy="0" r="6" fill="#ec4899" />
              <circle cx="-110" cy="0" r="5" fill="#f59e0b" />
              <circle cx="0" cy="70" r="4.5" fill="#38bdf8" />
            </g>
          </g>
        )}

        {/* ========================================================================= */}
        {/* DESIGN 8: ADMIN AUTH GATE - Concentric Cipher Rings & Vault Geometry    */}
        {/* ========================================================================= */}
        {pageType === 'admin-auth' && (
          <g id="bg-admin-auth-vectors" className="transition-opacity duration-500">
            {/* Mysterious, intense glows: Deep Violet, Electric Blue, Radiant Gold */}
            <circle cx="720" cy="450" r="420" fill="url(#glow-purple)" />
            <circle cx="200" cy="200" r="340" fill="url(#glow-blue)" />
            <circle cx="1240" cy="700" r="340" fill="url(#glow-yellow)" />

            {/* Concentric Cryptographic Cipher Rings (Centering the PIN keypad/card) */}
            <g transform="translate(720, 450)">
              {/* Outer Cipher Ring */}
              <g
                style={{
                  transformOrigin: '0 0',
                  animation: 'vectorSpinCW 70s linear infinite'
                }}
              >
                <circle
                  r="280"
                  fill="none"
                  stroke="url(#grad-purple-blue)"
                  strokeWidth="2.5"
                  strokeOpacity="0.6"
                />
                <circle
                  r="260"
                  fill="none"
                  stroke="url(#grad-yellow-gold)"
                  strokeWidth="1.5"
                  strokeDasharray="4 10"
                  strokeOpacity="0.65"
                />
                {/* 12 Cipher Dial Markers */}
                {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                  <line
                    key={deg}
                    x1="0"
                    y1="-280"
                    x2="0"
                    y2="-265"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeOpacity="0.8"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>

              {/* Middle Cipher Ring (Counter-rotating) */}
              <g
                style={{
                  transformOrigin: '0 0',
                  animation: 'vectorSpinCCW 50s linear infinite'
                }}
              >
                <circle
                  r="200"
                  fill="none"
                  stroke="url(#grad-red-amber)"
                  strokeWidth="2.5"
                  strokeOpacity="0.65"
                />
                <circle
                  r="175"
                  fill="none"
                  stroke="url(#grad-blue-sky)"
                  strokeWidth="1.5"
                  strokeDasharray="8 6"
                  strokeOpacity="0.55"
                />
                {/* 8 Intermediate Cipher Markers */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <circle
                    key={deg}
                    cx="0"
                    cy="-200"
                    r="4"
                    fill="#f43f5e"
                    fillOpacity="0.8"
                    transform={`rotate(${deg})`}
                  />
                ))}
              </g>

              {/* Inner Focus Ring */}
              <circle
                r="120"
                fill="none"
                stroke="url(#grad-yellow-gold)"
                strokeWidth="2"
                strokeOpacity="0.5"
                style={{ animation: 'vectorPulseSlow 6s ease-in-out infinite' }}
              />

              {/* Radiating Axis Beams */}
              <line x1="-360" y1="0" x2="360" y2="0" stroke="url(#grad-purple-blue)" strokeWidth="1.5" strokeDasharray="8 8" strokeOpacity="0.4" />
              <line x1="0" y1="-360" x2="0" y2="360" stroke="url(#grad-purple-blue)" strokeWidth="1.5" strokeDasharray="8 8" strokeOpacity="0.4" />
            </g>
          </g>
        )}
      </svg>

      {/* Frosted Glass Overlay (transparent with gentle blur: soft light in light mode, transparent dark in dark mode) */}
      <div
        className="absolute inset-0 pointer-events-none bg-white/20 dark:bg-black/35 backdrop-blur-[3px] transition-colors duration-500"
      />

      {/* Subtle Fine Grain Mesh for tactile organic vector polish */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(#000000 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}

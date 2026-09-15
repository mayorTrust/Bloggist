import React, { useState, useRef, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header({ currentPath, navigate, onOpenAdminPinModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0 to 100%
  const pressTimerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const isHeldRef = useRef(false);

  const HOLD_DURATION_MS = 2800; // ~3 seconds

  const startHold = (e) => {
    // Prevent default context menu or drag behavior on touch
    isHeldRef.current = true;
    startTimeRef.current = Date.now();
    setPressProgress(0);

    const updateProgress = () => {
      if (!isHeldRef.current) return;
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / HOLD_DURATION_MS) * 100, 100);
      setPressProgress(progress);

      if (elapsed >= HOLD_DURATION_MS) {
        // Trigger admin login modal!
        cancelHold(false);
        if (onOpenAdminPinModal) {
          onOpenAdminPinModal();
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateProgress);
  };

  const cancelHold = (wasClick = true) => {
    if (!isHeldRef.current) return;
    const elapsed = Date.now() - (startTimeRef.current || Date.now());
    isHeldRef.current = false;
    startTimeRef.current = null;
    setPressProgress(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // If released quickly (< 500ms) and was intended as a click, navigate to home
    if (wasClick && elapsed < 500) {
      navigate('/');
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const navLinks = [
    { label: 'Blog', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]/80 transition-colors">
      <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Clickable and Press-and-Hold BLOGGIST Logo */}
        <div className="relative select-none">
          <button
            id="bloggist-header-logo-btn"
            type="button"
            onMouseDown={startHold}
            onMouseUp={() => cancelHold(true)}
            onMouseLeave={() => cancelHold(false)}
            onTouchStart={startHold}
            onTouchEnd={() => cancelHold(true)}
            onTouchCancel={() => cancelHold(false)}
            onContextMenu={(e) => e.preventDefault()}
            className="group text-xl font-bold tracking-tight text-black flex items-center gap-1 cursor-pointer py-1.5 focus:outline-hidden"
            title="BLOGGIST"
          >
            <span>BLOGGIST</span>
          </button>

          {/* Discreet indicator visible while holding logo */}
          {pressProgress > 0 && (
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#E5E5E5] overflow-hidden rounded-full">
              <div
                className="h-full bg-black transition-all duration-75"
                style={{ width: `${pressProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path || (link.path === '/' && currentPath.startsWith('/blog/'));
            return (
              <button
                key={link.path}
                id={`nav-link-${link.label.toLowerCase()}`}
                type="button"
                onClick={() => navigate(link.path)}
                className={`text-sm tracking-normal transition-colors cursor-pointer focus:outline-hidden ${
                  isActive ? 'text-black font-semibold' : 'text-[#666666] hover:text-black'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black hover:bg-[#F5F5F5] rounded-md transition-colors cursor-pointer focus:outline-hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5]/80 bg-white/90 backdrop-blur-md px-6 py-4 space-y-3">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate(link.path);
                }}
                className={`block w-full text-left py-2 text-base ${
                  isActive ? 'text-black font-semibold' : 'text-[#666666] hover:text-black'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

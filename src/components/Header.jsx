import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import BloggistLogo from './BloggistLogo.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Header({ currentPath, navigate, onOpenAdminPinModal }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0 to 100%
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
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-black/75 backdrop-blur-md border-b border-[#E5E5E5]/80 dark:border-neutral-800/80 transition-colors duration-200">
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
            className="group flex items-center cursor-pointer py-1 focus:outline-hidden"
            title="Bloggist (Hold 3s for admin access)"
          >
            <BloggistLogo size="md" animated={true} />
          </button>

          {/* Discreet indicator visible while holding logo */}
          {pressProgress > 0 && (
            <div className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#E5E5E5] dark:bg-neutral-700 overflow-hidden rounded-full">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-75"
                style={{ width: `${pressProgress}%` }}
              />
            </div>
          )}
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path || (link.path === '/' && currentPath.startsWith('/blog/'));
              return (
                <button
                  key={link.path}
                  id={`nav-link-${link.label.toLowerCase()}`}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className={`text-sm tracking-normal transition-colors cursor-pointer focus:outline-hidden ${
                    isActive
                      ? 'text-black dark:text-white font-semibold'
                      : 'text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle Button */}
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer focus:outline-hidden"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 transition-transform hover:rotate-45 duration-300 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 transition-transform hover:-rotate-12 duration-300 text-neutral-700" />
            )}
          </button>
        </div>

        {/* Mobile Header Actions (Theme Toggle + Hamburger) */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            id="mobile-theme-toggle-btn"
            type="button"
            onClick={toggleTheme}
            className="p-2 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-md transition-colors cursor-pointer focus:outline-hidden"
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            id="mobile-menu-toggle-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer focus:outline-hidden"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E5E5E5]/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md px-6 py-4 space-y-3">
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
                  isActive
                    ? 'text-black dark:text-white font-semibold'
                    : 'text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white'
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

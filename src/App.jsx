import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import AdminPinModal from './components/AdminPinModal.jsx';
import BottomNav from './components/BottomNav.jsx';
import AnimatedVectorBackground from './components/AnimatedVectorBackground.jsx';
import HomePage from './pages/HomePage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminOverview from './pages/admin/AdminOverview.jsx';
import AdminArticles from './pages/admin/AdminArticles.jsx';
import AdminArticleEditor from './pages/admin/AdminArticleEditor.jsx';
import { api, getAdminToken } from './services/api.js';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(!!getAdminToken());
  const [adminPinModalOpen, setAdminPinModalOpen] = useState(false);

  // Sync with browser history (back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Check admin session validation on startup
  useEffect(() => {
    if (isAdminAuthenticated) {
      api.checkAuth().then((isValid) => {
        setIsAdminAuthenticated(isValid);
        if (!isValid && currentPath.startsWith('/admin')) {
          navigate('/');
        }
      });
    }
  }, []);

  const navigate = (path) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    navigate('/admin');
  };

  const handleAdminLogout = async () => {
    await api.logout();
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  // Route matching logic
  const isAdminRoute = currentPath.startsWith('/admin');

  // Guard admin routes if not authenticated
  if (isAdminRoute && !isAdminAuthenticated) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-6 text-center text-black dark:text-white transition-colors">
        {/* Dedicated Admin Auth Cipher Vector Background */}
        <AnimatedVectorBackground
          currentPath={currentPath}
          isAdminAuthenticated={false}
        />

        <div className="w-full max-w-sm p-8 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border border-[#E5E5E5] dark:border-neutral-800 shadow-2xl space-y-4 text-center relative z-10 rounded-xs">
          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Admin Access Required</h2>
          <p className="text-sm text-[#666666] dark:text-neutral-400">
            Please enter your PIN to access the administrative controls.
          </p>
          <div className="pt-2 flex flex-col items-center gap-2 w-full">
            <button
              type="button"
              onClick={() => setAdminPinModalOpen(true)}
              className="w-full py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer shadow-none rounded-xs"
            >
              Enter PIN
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-xs text-[#666666] dark:text-neutral-400 hover:text-black dark:hover:text-white underline underline-offset-4 cursor-pointer pt-2"
            >
              Return to Blog
            </button>
          </div>
        </div>

        <AdminPinModal
          isOpen={adminPinModalOpen}
          onClose={() => setAdminPinModalOpen(false)}
          onSuccess={handleAdminAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-transparent text-black dark:text-white font-sans flex flex-col selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      {/* Dynamic Animated Vector Background for each page archetype */}
      <AnimatedVectorBackground
        currentPath={currentPath}
        isAdminAuthenticated={isAdminAuthenticated}
      />

      {/* Show public header on non-admin routes */}
      {!isAdminRoute && (
        <Header
          currentPath={currentPath}
          navigate={navigate}
          onOpenAdminPinModal={() => setAdminPinModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        {/* Public Routes */}
        {currentPath === '/' && <HomePage navigate={navigate} />}

        {currentPath.startsWith('/blog/') && (
          <ArticlePage
            slug={currentPath.replace('/blog/', '')}
            navigate={navigate}
          />
        )}

        {currentPath === '/about' && <AboutPage />}

        {currentPath === '/contact' && <ContactPage />}

        {/* Admin Routes */}
        {currentPath === '/admin' && (
          <AdminOverview navigate={navigate} onLogout={handleAdminLogout} />
        )}

        {currentPath === '/admin/articles' && (
          <AdminArticles navigate={navigate} />
        )}

        {currentPath === '/admin/articles/new' && (
          <AdminArticleEditor navigate={navigate} />
        )}

        {currentPath.startsWith('/admin/articles/edit/') && (
          <AdminArticleEditor
            articleId={currentPath.replace('/admin/articles/edit/', '')}
            navigate={navigate}
          />
        )}
      </main>

      {/* Admin Bottom Navigation & Floating Plus Action */}
      {isAdminRoute && (
        <BottomNav currentPath={currentPath} navigate={navigate} />
      )}

      {/* Admin PIN Login Modal (accessible via 3-second hold on BLOGGIST) */}
      <AdminPinModal
        isOpen={adminPinModalOpen}
        onClose={() => setAdminPinModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />
    </div>
  );
}

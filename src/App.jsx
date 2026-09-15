import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import AdminPinModal from './components/AdminPinModal.jsx';
import BottomNav from './components/BottomNav.jsx';
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-black">Admin Access Required</h2>
        <p className="text-sm text-[#666666]">
          Please enter your PIN to access the administrative controls.
        </p>
        <button
          type="button"
          onClick={() => setAdminPinModalOpen(true)}
          className="px-5 py-2.5 bg-black text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer"
        >
          Enter PIN
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-xs text-[#666666] hover:text-black underline underline-offset-4 cursor-pointer pt-2"
        >
          Return to Blog
        </button>

        <AdminPinModal
          isOpen={adminPinModalOpen}
          onClose={() => setAdminPinModalOpen(false)}
          onSuccess={handleAdminAuthSuccess}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col selection:bg-black selection:text-white">
      {/* Show public header on non-admin routes */}
      {!isAdminRoute && (
        <Header
          currentPath={currentPath}
          navigate={navigate}
          onOpenAdminPinModal={() => setAdminPinModalOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1">
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

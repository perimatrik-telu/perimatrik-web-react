import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";

// Layouts & Guards
import Layout from "./pages/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardAdminApp from "./pages/dashboard/DashboardAdminApp";

// Public Pages
import { LoginPage } from "./pages/LoginPage";
import AboutPage from "./pages/AboutPage";
import HomePage from "./pages/HomePage";
import { ArticlePage } from "./pages/ArticlePage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { NewsPage } from "./pages/NewsPage";
import { NewsDetailPage } from "./pages/NewsDetailPage";
import { GalleryPage } from "./pages/GalleryPage";

// Dashboard Pages
import { getCanonicalRootHost } from "./utils/domain";

/**
 * A component to handle redirection to external subdomains safely
 */
const ExternalRedirect = ({ url }: { url: string }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
};

function AppRoutes() {
  const hostname = window.location.hostname;
  const isLocalhost = hostname.includes("localhost") || hostname === "127.0.0.1";
  
  // Strict subdomain check only for production
  const isNewsSubdomain = !isLocalhost && hostname.startsWith("news.");
  const isDashboardSubdomain = !isLocalhost && hostname.startsWith("dashboard.");

  // Force redirection from subdomains to main domain on localhost to prevent session split
  useEffect(() => {
    if (isLocalhost && (hostname.startsWith("dashboard.") || hostname.startsWith("news."))) {
      const mainHost = hostname.split('.').slice(-1)[0]; // get 'localhost'
      const port = window.location.port ? `:${window.location.port}` : '';
      window.location.href = `${window.location.protocol}//${mainHost}${port}${window.location.pathname}${window.location.search}`;
    }
  }, [hostname, isLocalhost]);

  // ========================================================
  // DASHBOARD SUBDOMAIN LOGIC (Production Only)
  // ========================================================
  if (isDashboardSubdomain) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<DashboardAdminApp />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // ========================================================
  // COMBINED LOGIC (Main domain and News sub in Prod, ALL in Local)
  // ========================================================
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {isNewsSubdomain ? (
          <>
            <Route index element={<NewsPage />} />
            <Route path="detail/:slug" element={<NewsDetailPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="article" element={<ArticlePage />} />
            <Route path="article/detail/:slug" element={<ArticleDetailPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="news/detail/:slug" element={<NewsDetailPage />} />
            <Route path="gallery" element={<GalleryPage />} />
          </>
        )}
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<LoginPage />} />

      {/* Unified Dashboard Route for Localhost */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard/*" element={<DashboardAdminApp />} />
      </Route>

      <Route 
        path="/dashboard/*" 
        element={
          !isLocalhost 
            ? <ExternalRedirect url={`https://dashboard.${getCanonicalRootHost(hostname)}`} />
            : <Navigate to="/dashboard" replace />
        } 
      />
    </Routes>
  );
}

export default AppRoutes;

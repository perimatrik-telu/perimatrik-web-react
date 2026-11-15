import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../../public/css/navbar.css";
import routes from "../constants/routes.js";
import { useThemeContext } from "../context/theme-context";
import { useTranslation } from "react-i18next";

import { IconButton, Tooltip, Box } from "@mui/material";
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
} from "@mui/icons-material";

interface NavbarFrontItem {
  path: string;
  label: string;
  element: string;
  i18nKey?: string;
}

export const NavbarPartial = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  const { mode, toggleTheme, themePreference } = useThemeContext();

  const hostname = window.location.hostname;
  const isLocalhost = hostname.includes("localhost") || hostname === "127.0.0.1";
  const isNewsSubdomain = !isLocalhost && hostname.includes("news.");
  
  // Base URLs
  const mainDomain = isLocalhost ? "" : "https://perimatrik.org";
  const newsDomain = isLocalhost ? "/news" : "https://news.perimatrik.org";

  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 25);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isNotHomePage = pathname !== "/";

  // Determine navbar styling based on state and theme
  const getNavbarStyle = () => {
    if (isScrolled || isNotHomePage) {
      return {
        background: mode === 'dark' ? 'rgba(18, 18, 18, 0.85)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(12px)',
        boxShadow: mode === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.05)',
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}`,
        padding: '0.8rem 0'
      };
    }
    return {
      background: 'transparent',
      backdropFilter: 'none',
      boxShadow: 'none',
      borderBottom: '1px solid transparent',
      padding: '1.5rem 0'
    };
  };

  const renderThemeIcon = () => {
    switch (themePreference) {
      case "light":
        return <Brightness7 />;
      case "dark":
        return <Brightness4 />;
      case "system":
      default:
        return <SettingsBrightness />;
    }
  };

  const getThemeTooltipTitle = () => {
    switch (themePreference) {
      case "light":
        return "Light Theme";
      case "dark":
        return "Dark Theme";
      case "system":
      default:
        return "System Theme";
    }
  };

  const getNavLinkColor = () => {
    if (mode === 'dark') return '#ffffff';
    if (isScrolled || isNotHomePage) return 'rgba(0,0,0,0.85)';
    return '#ffffff';
  };

  const renderNavLink = (link: NavbarFrontItem) => {
    // Improved active state logic for subdomains and local dev
    let navItemActive = false;
    
    if (isNewsSubdomain) {
      if (link.path === "/news") {
        navItemActive = pathname === "/";
      } else {
        navItemActive = false;
      }
    } else {
      if (link.path === "/") {
        navItemActive = pathname === "/";
      } else if (link.path === "/news") {
        navItemActive = isLocalhost ? pathname.startsWith("/news") : false;
      } else {
        navItemActive = pathname.startsWith(link.path);
      }
    }
    
    const commonStyles = {
      fontWeight: 700,
      letterSpacing: '0.5px',
      color: navItemActive ? '#e67817' : getNavLinkColor(),
      transition: 'all 0.3s ease'
    };

    // ----------------------------------------------------
    // CASE: LOCALHOST (Single domain, no subdomains)
    // ----------------------------------------------------
    if (isLocalhost) {
      return (
        <Link to={link.path} className="nav-link" style={commonStyles}>
          {link.i18nKey ? t(`navbar.${link.i18nKey}`) : link.label}
        </Link>
      );
    }

    // ----------------------------------------------------
    // CASE: PRODUCTION (Subdomain logic)
    // ----------------------------------------------------
    if (isNewsSubdomain) {
      if (link.path === "/news") {
        return (
          <Link to="/" className="nav-link" style={commonStyles}>
            {link.i18nKey ? t(`navbar.${link.i18nKey}`) : link.label}
          </Link>
        );
      }
      
      const targetUrl = link.path === "/" ? mainDomain : `${mainDomain}${link.path}`;
      return (
        <a href={targetUrl} className="nav-link" style={commonStyles}>
          {link.i18nKey ? t(`navbar.${link.i18nKey}`) : link.label}
        </a>
      );
    }

    if (link.path === "/news") {
      return (
        <a href={newsDomain} className="nav-link" style={commonStyles}>
          {link.i18nKey ? t(`navbar.${link.i18nKey}`) : link.label}
        </a>
      );
    }

    return (
      <Link to={link.path} className="nav-link" style={commonStyles}>
        {link.i18nKey ? t(`navbar.${link.i18nKey}`) : link.label}
      </Link>
    );
  };

  return (
    <Box
      component="div"
      className={`navbar-partial-container w-100 ${isNotHomePage ? "position-sticky" : "position-fixed"} top-0`}
      data-theme={mode}
      sx={{ zIndex: 1100 }}
    >
      <nav
        className="navbar navbar-expand-lg"
        style={{ ...getNavbarStyle(), transition: 'all 0.4s ease' }}
      >
        <div className="container">
          <Link to={isLocalhost ? "/" : (isNewsSubdomain ? newsDomain : "/")} className="navbar-brand">
            <img
              src={`${
                (isScrolled || isNotHomePage) && mode === 'light'
                  ? "/logos/logo-text-black.png"
                  : "/logos/logo-text-white.png"
              }`}
              alt="PERIMATRIK"
              style={{ width: 'auto', height: isScrolled || isNotHomePage ? '38px' : '45px', transition: 'all 0.3s ease' }}
            />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            onClick={toggleNavbar}
            style={{ border: 'none', padding: '8px' }}
          >
            <span
              className={`navbar-toggler-icon ${
                mode === 'dark' || (!isScrolled && !isNotHomePage && mode === 'light')
                  ? 'navbar-toggler-icon-light'
                  : 'navbar-toggler-icon-dark'
              }`}
            ></span>
          </button>

          <div
            className={`collapse navbar-collapse ${isCollapsed ? "" : "show"}`}
            id="navbarNav"
          >
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-4 align-items-center">
              {(routes.navbar_front as NavbarFrontItem[]).map((link) => (
                <li className="nav-item position-relative" key={link.element}>
                  {renderNavLink(link)}
                </li>
              ))}
            </ul>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: { xs: 'center', lg: 'flex-end' }, mt: { xs: 2, lg: 0 } }}>
              
              <IconButton
                onClick={() => i18n.changeLanguage(i18n.language?.startsWith('en') ? 'id' : 'en')}
                sx={{
                  bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: mode === 'dark' || (!isScrolled && !isNotHomePage && mode === 'light') ? 'white' : 'var(--text-primary)',
                  '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' },
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  width: '40px',
                  height: '40px'
                }}
              >
                {i18n.language?.startsWith('en') ? 'EN' : 'ID'}
              </IconButton>
              <Tooltip title={getThemeTooltipTitle()}>
                <IconButton 
                  onClick={toggleTheme} 
                  sx={{ 
                    bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: mode === 'dark' || (!isScrolled && !isNotHomePage && mode === 'light') ? 'white' : 'var(--text-primary)',
                    '&:hover': { bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
                  }}
                >
                  {renderThemeIcon()}
                </IconButton>
              </Tooltip>
            </Box>
          </div>
        </div>
      </nav>
    </Box>
  );
};

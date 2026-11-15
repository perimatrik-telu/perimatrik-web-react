import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { lightTheme, darkTheme, dashboardLightTheme, dashboardDarkTheme } from '../theme/theme';
import { ThemeContext, type ThemePreference } from './theme-context';

export const ThemeProvider: React.FC<{children: React.ReactNode, forcedMode?: 'light' | 'dark', variant?: 'site' | 'dashboard'}> = ({ children, forcedMode, variant = 'site' }) => {
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const savedPreference = localStorage.getItem('themePreference') as ThemePreference | null;
    return savedPreference || 'system';
  });

  useEffect(() => {
    localStorage.setItem('themePreference', themePreference);
  }, [themePreference]);
  
  const toggleTheme = () => {
    const preferences: ThemePreference[] = ['system', 'light', 'dark'];
    const currentIndex = preferences.indexOf(themePreference);
    const nextIndex = (currentIndex + 1) % preferences.length;
    setThemePreference(preferences[nextIndex]);
  };

  const mode = useMemo(() => {
    if (forcedMode) {
      return forcedMode;
    }
    if (themePreference === 'system') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return themePreference;
  }, [themePreference, forcedMode]);

  const theme = useMemo(() => {
    if (variant === 'dashboard') return mode === 'light' ? dashboardLightTheme : dashboardDarkTheme;
    return mode === 'light' ? lightTheme : darkTheme;
  }, [mode, variant]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode, themePreference }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

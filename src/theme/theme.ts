import { createTheme, type ThemeOptions } from '@mui/material/styles';

/**
 * Design tokens: clean, neutral SaaS look with the PERIMATRIK orange as the only accent.
 * Neutrals follow a cool-gray scale; borders are hairline and shadows are kept very soft.
 */
const brand = {
  main: '#e67817',
  dark: '#b95608',
  light: '#f6a554',
  contrastText: '#ffffff',
};

/**
 * Dashboard brand: white text on #e67817 is only 2.97:1 (fails WCAG AA), so the light dashboard uses
 * the deeper #b95608 (4.78:1) as primary. Dark mode keeps #e67817 (6.1:1 on the dark surface) with dark
 * text on filled buttons.
 */
const dashboardBrand = {
  light: { main: '#b95608', dark: '#9a4706', light: '#e67817', contrastText: '#ffffff' },
  dark: { main: '#e67817', dark: '#b95608', light: '#f6a554', contrastText: '#101828' },
};

const fontFamily = ['Inter', '"Helvetica Neue"', 'Arial', 'sans-serif'].join(',');

const shared = (mode: 'light' | 'dark', radiusUnit: number, variant: 'site' | 'dashboard' = 'site'): ThemeOptions => {
  const light = mode === 'light';
  const border = light ? '#eaecf0' : 'rgba(255, 255, 255, 0.08)';

  return {
    palette: {
      mode,
      primary: variant === 'dashboard' ? dashboardBrand[mode] : brand,
      secondary: { main: '#1f7a6b' },
      success: { main: light ? '#079455' : '#47cd89' },
      warning: { main: light ? '#dc6803' : '#fdb022' },
      error: { main: light ? '#d92d20' : '#f97066' },
      info: { main: light ? '#1570ef' : '#53b1fd' },
      background: light
        ? { default: '#f8f9fb', paper: '#ffffff' }
        : { default: '#0c0e12', paper: '#13161b' },
      text: light
        ? { primary: '#101828', secondary: '#667085', disabled: '#98a2b3' }
        : { primary: '#f5f5f6', secondary: '#94969c', disabled: '#61646c' },
      divider: border,
      // Only override the grey scale in light mode; leaving the key out keeps MUI's defaults in dark mode.
      ...(light && {
        grey: { 50: '#f9fafb', 100: '#f2f4f7', 200: '#eaecf0', 300: '#d0d5dd', 400: '#98a2b3', 500: '#667085', 600: '#475467', 700: '#344054', 800: '#182230', 900: '#101828' },
      }),
    },
    shape: { borderRadius: radiusUnit },
    typography: {
      fontFamily,
      h1: { fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.02em' },
      h4: { fontWeight: 700, letterSpacing: '-0.02em' },
      h5: { fontWeight: 700, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${border}`,
            boxShadow: light ? '0 1px 2px rgba(16, 24, 40, 0.04)' : 'none',
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 8, boxShadow: 'none' },
          sizeMedium: { minHeight: 40, paddingInline: 16 },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 8 },
          notchedOutline: { borderColor: light ? '#d0d5dd' : 'rgba(255,255,255,0.12)' },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: border },
          head: {
            color: light ? '#475467' : '#94969c',
            fontWeight: 600,
            fontSize: 12,
            backgroundColor: light ? '#f9fafb' : 'rgba(255,255,255,0.02)',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: { root: { '&:last-child td': { borderBottom: 0 } } },
      },
      MuiTooltip: {
        defaultProps: { arrow: true },
        styleOverrides: { tooltip: { fontSize: 12, fontWeight: 500 } },
      },
    },
  };
};

/**
 * Public site: radius unit 8 (unchanged from before the redesign, so `sx={{ borderRadius: n }}`
 * on public pages keeps its size).
 */
export const lightTheme = createTheme(shared('light', 8));
export const darkTheme = createTheme(shared('dark', 8));

/**
 * Dashboard: radius unit 4, so `borderRadius: 2` = 8px, `2.5` = 10px, `3` = 12px.
 * Components with explicit radii (buttons, inputs) are unaffected.
 */
export const dashboardLightTheme = createTheme(shared('light', 4, 'dashboard'));
export const dashboardDarkTheme = createTheme(shared('dark', 4, 'dashboard'));

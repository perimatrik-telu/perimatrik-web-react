import React, { useMemo, useEffect, useState, type ReactNode } from "react";
import {
  alpha,
  AppBar,
  Box,
  Breadcrumbs,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Translate as TranslateIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  SettingsBrightness as SystemModeIcon,
} from "@mui/icons-material";
import { Outlet, useLocation, Link as RouterLink } from "react-router-dom";
import {
  faTachometerAlt,
  faNewspaper,
  faImages,
  faBullhorn,
  faFlag,
  faAddressCard,
  faUserShield,
  faPhoneVolume,
  faStore,
  faBoxesStacked,
  faScrewdriverWrench,
  faMapLocationDot,
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import { Profile as UserProfile } from "../../partials/mui-template/profile-partial";
import { useThemeContext } from "../../context/theme-context";
import { ThemeProvider } from "../../context/ThemeContext";

interface NavItem {
  text: string;
  icon: IconDefinition;
  path: string;
  allowedRoles?: string[];
  badge?: string;
  disabled?: boolean;
}

const drawerWidth = 264;
const headerHeight = 64;

const isPathActive = (itemPath: string, pathname: string) =>
  itemPath === "/dashboard" ? pathname === itemPath : pathname.startsWith(itemPath);

const DashboardContent: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { i18n, t } = useTranslation();
  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isDark = theme.palette.mode === "dark";
  const { toggleTheme, themePreference } = useThemeContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(null);

  const navGroups: { groupId: string; groupName: string; items: NavItem[] }[] = useMemo(() => [
    {
      groupId: "utama", groupName: t("Utama", "Utama"),
      items: [{ text: t("Dasbor", "Dasbor"), icon: faTachometerAlt, path: "/dashboard", allowedRoles: ["admin", "officer", "member"] }],
    },
    {
      groupId: "manajemen", groupName: t("Manajemen Konten", "Manajemen Konten"),
      items: [
        { text: t("Artikel", "Artikel"), icon: faNewspaper, path: "/dashboard/article", allowedRoles: ["admin", "member"] },
        { text: t("Berita", "Berita"), icon: faBullhorn, path: "/dashboard/news", allowedRoles: ["admin", "officer"] },
        { text: t("Galeri", "Galeri"), icon: faImages, path: "/dashboard/gallery", allowedRoles: ["admin", "member", "officer"] },
        { text: t("Angkatan", "Angkatan"), icon: faFlag, path: "/dashboard/angkatan", allowedRoles: ["admin"] },
        { text: t("Anggota", "Anggota"), icon: faAddressCard, path: "/dashboard/member", allowedRoles: ["admin"] },
      ],
    },
    {
      groupId: "layanan", groupName: t("Layanan", "Layanan"),
      items: [
        { text: t("Lapak Peri", "Lapak Peri"), icon: faStore, path: "/dashboard/lapak-peri", allowedRoles: ["admin", "officer", "member"], badge: "Soon", disabled: true },
        { text: t("Inventaris", "Inventaris"), icon: faBoxesStacked, path: "/dashboard/inventaris", allowedRoles: ["admin", "officer", "member"], badge: "Soon", disabled: true },
        { text: t("Sewa Alat", "Sewa Alat"), icon: faScrewdriverWrench, path: "/dashboard/sewa-alat", allowedRoles: ["admin", "officer", "member"], badge: "Soon", disabled: true },
        { text: t("Lokasi", "Lokasi"), icon: faMapLocationDot, path: "/dashboard/lokasi", allowedRoles: ["admin"], badge: "Soon", disabled: true },
      ],
    },
    {
      groupId: "pengaturan", groupName: t("Pengaturan", "Pengaturan"),
      items: [
        { text: t("Akses", "Akses"), icon: faUserShield, path: "/dashboard/setting/privacy/access", allowedRoles: ["admin"] },
        { text: t("Kontak", "Kontak"), icon: faPhoneVolume, path: "/dashboard/setting/privacy/contact", allowedRoles: ["admin"] },
      ],
    },
  ], [t]);

  const filteredNavGroups = useMemo(() => navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.allowedRoles || (user && item.allowedRoles.includes(user.role))),
    }))
    .filter((group) => group.items.length > 0), [navGroups, user]);

  const currentNavItem = filteredNavGroups
    .flatMap((group) => group.items)
    .find((item) => isPathActive(item.path, pathname));

  useEffect(() => {
    document.title = currentNavItem ? `${currentNavItem.text} - Dasbor` : "Dasbor";
  }, [currentNavItem]);

  // Breadcrumb trail: Dasbor › Section › (Tambah / Ubah)
  const subPage = /\/create$/.test(pathname) ? t("crud.tambah") : /\/edit\//.test(pathname) ? t("crud.ubah") : null;
  const crumbs = [
    { label: t("Dasbor", "Dasbor"), to: "/dashboard" },
    ...(currentNavItem && currentNavItem.path !== "/dashboard" ? [{ label: currentNavItem.text, to: currentNavItem.path }] : []),
    ...(pathname.startsWith("/dashboard/profile") ? [{ label: t("Profil", "Profil"), to: "/dashboard/profile" }] : []),
    ...(subPage ? [{ label: subPage, to: pathname }] : []),
  ];

  const themeIcon = themePreference === "light" ? <LightModeIcon fontSize="small" /> : themePreference === "dark" ? <DarkModeIcon fontSize="small" /> : <SystemModeIcon fontSize="small" />;
  const themeText = themePreference === "light" ? t("Terang", "Terang") : themePreference === "dark" ? t("Gelap", "Gelap") : t("Sistem", "Sistem");

  const navItemSx = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 1.25,
    height: 38,
    px: 1.25,
    borderRadius: 2,
    color: active ? "text.primary" : "text.secondary",
    bgcolor: active ? (isDark ? alpha("#fff", 0.06) : "grey.100") : "transparent",
    fontSize: 14,
    fontWeight: active ? 600 : 500,
    textDecoration: "none",
    transition: "background-color 120ms ease, color 120ms ease",
    "& .nav-icon": {
      width: 18,
      display: "grid",
      placeItems: "center",
      fontSize: 15,
      color: active ? "primary.main" : "text.disabled",
      transition: "color 120ms ease",
    },
    "&:hover": {
      bgcolor: isDark ? alpha("#fff", 0.04) : "grey.50",
      color: "text.primary",
      "& .nav-icon": { color: active ? "primary.main" : "text.secondary" },
    },
    "&:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
  });

  const drawerContent = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
      <Box sx={{ height: headerHeight, px: 2.5, display: "flex", alignItems: "center", flexShrink: 0 }}>
        <RouterLink to="/" aria-label="PERIMATRIK" style={{ display: "block" }}>
          <img
            src={isDark ? "/logos/logo-text-white.png" : "/logos/logo-text-black.png"}
            alt="PERIMATRIK"
            style={{ height: 30, display: "block", maxWidth: 170, objectFit: "contain" }}
          />
        </RouterLink>
      </Box>

      <Box component="nav" aria-label={t("Navigasi dasbor", "Navigasi dasbor")} sx={{ flexGrow: 1, overflowY: "auto", px: 1.5, pb: 2 }}>
        {filteredNavGroups.map((group, groupIndex) => (
          <Box key={group.groupId} sx={{ mt: groupIndex === 0 ? 1 : 2.5 }}>
            <Typography
              component="div"
              sx={{ px: 1.25, mb: 0.75, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "text.disabled" }}
            >
              {group.groupName}
            </Typography>
            <Stack component="ul" spacing={0.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
              {group.items.map((item) => {
                const active = isPathActive(item.path, pathname);
                const content = (
                  <>
                    <span className="nav-icon"><FontAwesomeIcon icon={item.icon} /></span>
                    <Box component="span" sx={{ flexGrow: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.text}
                    </Box>
                    {item.badge && (
                      <Box
                        component="span"
                        sx={{
                          px: 0.75, py: 0.125, borderRadius: 999, fontSize: 11, fontWeight: 600, lineHeight: 1.6,
                          color: "text.secondary", bgcolor: isDark ? alpha("#fff", 0.06) : "grey.100",
                          border: "1px solid", borderColor: "divider",
                        }}
                      >
                        {item.badge}
                      </Box>
                    )}
                  </>
                );
                return (
                  <li key={item.path}>
                    {item.disabled ? (
                      <Box aria-disabled="true" sx={{ ...navItemSx(false), cursor: "default", opacity: 0.6, "&:hover": {} }}>
                        {content}
                      </Box>
                    ) : (
                      <Box
                        component={RouterLink}
                        to={item.path}
                        aria-current={active ? "page" : undefined}
                        onClick={() => isMobile && setMobileOpen(false)}
                        sx={navItemSx(active)}
                      >
                        {content}
                      </Box>
                    )}
                  </li>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
        <Box component="a" href="/" target="_blank" rel="noreferrer" sx={navItemSx(false)}>
          <span className="nav-icon"><FontAwesomeIcon icon={faArrowUpRightFromSquare} /></span>
          <Box component="span" sx={{ flexGrow: 1 }}>{t("dashboard.lihatWebsite")}</Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "saturate(180%) blur(12px)",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ minHeight: `${headerHeight}px !important`, px: { xs: 2, md: 4 }, gap: 1.5 }}>
          {isMobile && (
            <IconButton edge="start" aria-label={t("Buka menu", "Buka menu")} onClick={() => setMobileOpen((open) => !open)} sx={{ color: "text.secondary" }}>
              <MenuIcon />
            </IconButton>
          )}

          <Breadcrumbs aria-label="breadcrumb" separator="/" sx={{ flexGrow: 1, minWidth: 0, fontSize: 14, "& .MuiBreadcrumbs-separator": { color: "text.disabled", mx: 1 } }}>
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1;
              return last ? (
                <Typography key={crumb.to + index} noWrap sx={{ fontSize: 14, fontWeight: 600, color: "text.primary" }}>
                  {crumb.label}
                </Typography>
              ) : (
                <Box key={crumb.to + index} component={RouterLink} to={crumb.to} sx={{ color: "text.secondary", textDecoration: "none", "&:hover": { color: "text.primary" } }}>
                  {crumb.label}
                </Box>
              );
            })}
          </Breadcrumbs>

          <Tooltip title={t("Pengaturan Tampilan", "Pengaturan Tampilan")}>
            <IconButton
              aria-label={t("Pengaturan Tampilan", "Pengaturan Tampilan")}
              onClick={(event) => setAnchorElSettings(event.currentTarget)}
              sx={{ width: 38, height: 38, color: "text.secondary", border: "1px solid", borderColor: "divider", borderRadius: 2, "&:hover": { color: "text.primary", bgcolor: "action.hover" } }}
            >
              <SettingsIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElSettings}
            open={Boolean(anchorElSettings)}
            onClose={() => setAnchorElSettings(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            slotProps={{ paper: { elevation: 0, sx: { mt: 1, minWidth: 220, borderRadius: 2.5, border: "1px solid", borderColor: "divider", boxShadow: "0 12px 24px -4px rgba(16,24,40,0.08), 0 4px 8px -2px rgba(16,24,40,0.04)" } } }}
          >
            <Typography sx={{ px: 2, pt: 1, pb: 0.75, fontSize: 12, fontWeight: 600, color: "text.secondary" }}>
              {t("Pengaturan Tampilan", "Pengaturan Tampilan")}
            </Typography>
            <MenuItem onClick={() => { void i18n.changeLanguage(i18n.language?.startsWith("en") ? "id" : "en"); setAnchorElSettings(null); }}>
              <ListItemIcon><TranslateIcon fontSize="small" /></ListItemIcon>
              <ListItemText primary={t("Bahasa", "Bahasa")} secondary={i18n.language?.startsWith("en") ? "English" : "Indonesia"} />
            </MenuItem>
            <MenuItem onClick={toggleTheme}>
              <ListItemIcon>{themeIcon}</ListItemIcon>
              <ListItemText primary={t("Tema", "Tema")} secondary={themeText} />
            </MenuItem>
          </Menu>

          <Divider orientation="vertical" flexItem sx={{ my: 1.5, display: { xs: "none", sm: "block" } }} />

          {user && <UserProfile />}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        anchor="left"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: "100vh",
          pt: `${headerHeight}px`,
          // react-admin defaults, aligned with the dashboard look
          "& .RaList-main": {
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 3,
            overflow: "hidden",
            bgcolor: "background.paper",
          },
          "& .RaList-actions": { mb: 1.5, gap: 1 },
        }}
      >
        <Box sx={{ maxWidth: 1360, mx: "auto", px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 } }}>
          {children ?? <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};

const DashboardLayout: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <DashboardContent>{children}</DashboardContent>
  </ThemeProvider>
);

export default DashboardLayout;

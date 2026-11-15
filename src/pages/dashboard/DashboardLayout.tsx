import React, { useMemo, useEffect, useState, type ReactNode } from "react";
import {
  alpha,
  AppBar,
  Box,
  Chip,
  CssBaseline,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore, Menu as MenuIcon } from "@mui/icons-material";
import { Outlet, useLocation } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Profile as UserProfile } from "../../partials/mui-template/profile-partial";
import { useTranslation } from "react-i18next";
import { useThemeContext } from "../../context/theme-context";
import { Settings as SettingsIcon, Translate as TranslateIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon, SettingsBrightness as SystemModeIcon } from "@mui/icons-material";
import { Menu, MenuItem, Divider } from "@mui/material";
import { ThemeProvider } from "../../context/ThemeContext";

interface NavItem {
  text: string;
  icon: IconDefinition;
  path: string;
  allowedRoles?: string[];
  badge?: string;
  disabled?: boolean;
}

const drawerWidth = 240;
const sidebarBg = "#101820";
const sidebarMuted = "rgba(255,255,255,0.62)";
const sidebarBorder = "rgba(255,255,255,0.1)";


const DashboardLayout: React.FC<{ children?: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { i18n, t } = useTranslation();

  const dashboardNavGroups: { groupId: string; groupName: string; items: NavItem[] }[] = useMemo(() => [
    {
      groupId: "utama", groupName: t("Utama", "Utama"),
      items: [{ text: t("Dasbor", "Dasbor"), icon: faTachometerAlt, path: "/dashboard", allowedRoles: ['admin', 'officer', 'member'] }],
    },
    {
      groupId: "manajemen", groupName: t("Manajemen Konten", "Manajemen Konten"),
      items: [
        { text: t("Artikel", "Artikel"), icon: faNewspaper, path: "/dashboard/article", allowedRoles: ['admin', 'member'] },
        { text: t("Berita", "Berita"), icon: faBullhorn, path: "/dashboard/news", allowedRoles: ['admin', 'officer'] },
        { text: t("Galeri", "Galeri"), icon: faImages, path: "/dashboard/gallery", allowedRoles: ['admin', 'member', 'officer'] },
        { text: t("Angkatan", "Angkatan"), icon: faFlag, path: "/dashboard/angkatan", allowedRoles: ['admin'] },
        { text: t("Anggota", "Anggota"), icon: faAddressCard, path: "/dashboard/member", allowedRoles: ['admin'] },
      ],
    },
    {
      groupId: "layanan", groupName: t("Layanan", "Layanan"),
      items: [
        { text: t("Lapak Peri", "Lapak Peri"), icon: faStore, path: "/dashboard/lapak-peri", allowedRoles: ['admin', 'officer', 'member'], badge: "Soon", disabled: true },
        { text: t("Inventaris", "Inventaris"), icon: faBoxesStacked, path: "/dashboard/inventaris", allowedRoles: ['admin', 'officer', 'member'], badge: "Soon", disabled: true },
        { text: t("Sewa Alat", "Sewa Alat"), icon: faScrewdriverWrench, path: "/dashboard/sewa-alat", allowedRoles: ['admin', 'officer', 'member'], badge: "Soon", disabled: true },
        { text: t("Lokasi", "Lokasi"), icon: faMapLocationDot, path: "/dashboard/lokasi", allowedRoles: ['admin'], badge: "Soon", disabled: true },
      ],
    },
    {
      groupId: "pengaturan", groupName: t("Pengaturan", "Pengaturan"),
      items: [
        { text: t("Akses", "Akses"), icon: faUserShield, path: "/dashboard/setting/privacy/access", allowedRoles: ['admin'] },
        { text: t("Kontak", "Kontak"), icon: faPhoneVolume, path: "/dashboard/setting/privacy/contact", allowedRoles: ['admin'] },
      ],
    },
  ], [t]);


  const { pathname } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Filter groups based on user role
  const filteredNavGroups = dashboardNavGroups.map(group => ({
    ...group,
    items: group.items.filter(item => 
      !item.allowedRoles || (user && item.allowedRoles.includes(user.role))
    )
  })).filter(group => group.items.length > 0);

  const [openGroup, setOpenGroup] = useState<{ [key: string]: boolean }>(
    filteredNavGroups.reduce(
      (acc, group) => ({ ...acc, [group.groupId]: true }),
      {},
    ),
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const { toggleTheme, themePreference } = useThemeContext();
  const [anchorElSettings, setAnchorElSettings] = useState<null | HTMLElement>(null);
  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => setAnchorElSettings(event.currentTarget);
  const handleCloseSettings = () => setAnchorElSettings(null);
  
  const getThemeIcon = () => {
    if (themePreference === 'light') return <LightModeIcon fontSize="small" />;
    if (themePreference === 'dark') return <DarkModeIcon fontSize="small" />;
    return <SystemModeIcon fontSize="small" />;
  };
  const getThemeText = () => {
    if (themePreference === 'light') return t('Terang', 'Terang');
    if (themePreference === 'dark') return t('Gelap', 'Gelap');
    return t('Sistem', 'Sistem');
  };


  const handleClick = (groupId: string) => {
    setOpenGroup((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleMobileDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    // Flatten all items from groups to find the current item for title setting
    const allNavItems: NavItem[] = filteredNavGroups.flatMap((group) => group.items);
    const currentNavItem: NavItem | undefined = allNavItems.find((item) =>
      item.path === "/dashboard"
        ? pathname === item.path
        : pathname.startsWith(item.path),
    );

    if (currentNavItem) {
      document.title = `${currentNavItem.text} - Dasbor`;
    } else {
      document.title = "Dasbor"; 
    }
  }, [pathname, filteredNavGroups]);

  const currentNavItem = filteredNavGroups
    .flatMap((group) => group.items)
    .find((item) =>
      item.path === "/dashboard" ? pathname === item.path : pathname.startsWith(item.path),
    );

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: sidebarBg,
        color: "common.white",
      }}
    >
      <Toolbar
        sx={{
          px: 2.5,
          minHeight: "80px !important",
          borderBottom: `1px solid ${sidebarBorder}`,
          alignItems: "center",
        }}
      >
        <Stack sx={{ alignItems: "flex-start", minWidth: 0, width: "100%" }}>
          <RouterLink to="/" style={{ display: "block", maxWidth: "100%" }}>
            <img
              src="/logos/logo-text-white.png"
              alt="Logo"
              style={{ height: 34, display: "block", maxWidth: 168, objectFit: "contain" }}
            />
          </RouterLink>
        </Stack>
      </Toolbar>
      <List sx={{ px: 1.25, py: 2, flexGrow: 1, overflowY: "auto" }}>
        {filteredNavGroups.map((group) => (
          <React.Fragment key={group.groupName}>
            <ListItemButton
              onClick={() => handleClick(group.groupId)}
              sx={{
                mb: 0.5,
                borderRadius: 1,
                px: 1.5,
                py: 1.25,
                color: sidebarMuted,
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.06)",
                },
              }}
            >
              <ListItemText
                primary={group.groupName}
                slotProps={{
                  primary: {
                    sx: {
                      fontWeight: 800,
                      color: "inherit",
                      fontSize: 12,
                      letterSpacing: 0,
                      textTransform: "uppercase",
                    },
                  },
                }}
              />
              {openGroup[group.groupId] ? <ExpandLess /> : <ExpandMore />}
            </ListItemButton>
            <Collapse
              in={openGroup[group.groupId]}
              timeout="auto"
              unmountOnExit
            >
              <List component="div" disablePadding sx={{ py: 0.5 }}>
                {group.items.map((item) => {
                  const isActive =
                    item.path === "/dashboard"
                      ? pathname === item.path
                      : pathname.startsWith(item.path);
                  return (
                    <ListItem
                      key={item.text}
                      disablePadding
                      sx={{ position: "relative", mb: 0.5 }}
                    >
                      <ListItemButton
                        component={item.disabled ? "div" : RouterLink}
                        {...(!item.disabled ? { to: item.path } : {})}
                        selected={isActive}
                        disabled={item.disabled}
                        onClick={() => {
                          if (isMobile) {
                            setMobileOpen(false);
                          }
                        }}
                        sx={{
                          pl: 2,
                          pr: 1.5,
                          py: 1.25,
                          borderRadius: 1,
                          color: isActive ? "#fff" : "rgba(255,255,255,0.78)",
                          transition: "background-color 160ms ease, color 160ms ease",
                          "&.Mui-disabled": {
                            color: "rgba(255,255,255,0.52)",
                            opacity: 1,
                          },
                          "& .MuiListItemIcon-root": {
                            minWidth: 38,
                            color: isActive ? "#ffd0a3" : "rgba(255,255,255,0.52)",
                          },
                          "&.Mui-disabled .MuiListItemIcon-root": {
                            color: "rgba(255,255,255,0.34)",
                          },
                          "& .MuiListItemText-primary": {
                            fontWeight: 600,
                            fontSize: 14,
                          },
                          "&:hover": {
                            bgcolor: "rgba(255,255,255,0.07)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.24),
                            boxShadow: `inset 3px 0 0 ${theme.palette.primary.light}`,
                            "& .MuiListItemIcon-root": {
                              color: "#ffd0a3",
                            },
                            "& .MuiListItemText-primary": {
                              fontWeight: 700,
                            },
                            "&:hover": {
                              backgroundColor: alpha(theme.palette.primary.main, 0.3),
                            },
                          },
                        }}
                      >
                        <ListItemIcon>
                          <FontAwesomeIcon icon={item.icon} />
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                        {item.badge && (
                          <Chip
                            label={item.badge}
                            size="small"
                            sx={{
                              height: 20,
                              flex: "0 0 auto",
                              borderRadius: 1,
                              fontSize: 11,
                              fontWeight: 800,
                              color: "#ffe0bd",
                              bgcolor: "rgba(255, 208, 163, 0.14)",
                              border: "1px solid rgba(255, 208, 163, 0.28)",
                              "& .MuiChip-label": {
                                px: 0.75,
                              },
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            backgroundColor: alpha(theme.palette.background.paper, 0.94),
            backdropFilter: "blur(14px)",
            color: theme.palette.text.primary,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar sx={{ minHeight: "76px !important", px: { xs: 2, md: 3 } }}>
            {isMobile && (
              <IconButton
                edge="start"
                onClick={toggleMobileDrawer}
                sx={{
                  mr: 1.25,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                  },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Stack
              direction="row"
              spacing={1.5}
              sx={{ alignItems: "center", flexGrow: 1, minWidth: 0 }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  flex: "0 0 auto",
                  borderRadius: 1,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                }}
              >
                <FontAwesomeIcon icon={currentNavItem?.icon ?? faTachometerAlt} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25, fontWeight: 700 }}>
                  Dasbor
                </Typography>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                  {currentNavItem?.text ?? "Ringkasan"}
                </Typography>
              </Box>
            </Stack>
            

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                onClick={handleOpenSettings}
                sx={{
                  ml: 1.5,
                  color: 'text.primary',
                  width: 44,
                  height: 44,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.default",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
                  },
                }}
              >
                <SettingsIcon />
              </IconButton>
              
              <Menu
                anchorEl={anchorElSettings}
                open={Boolean(anchorElSettings)}
                onClose={handleCloseSettings}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{ paper: {
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    '&:before': {
                      content: '""', display: 'block', position: 'absolute', top: 0, right: 18,
                      width: 10, height: 10, bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                    },
                  },
                } }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important', py: 0.5 }}>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
                    {t('Pengaturan Tampilan', 'Pengaturan Tampilan')}
                  </Typography>
                </MenuItem>
                
                <MenuItem onClick={() => { i18n.changeLanguage(i18n.language?.startsWith('en') ? 'id' : 'en'); handleCloseSettings(); }}>
                  <ListItemIcon>
                    <TranslateIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={t('Bahasa', 'Bahasa')} secondary={i18n.language?.startsWith('en') ? 'English' : 'Indonesia'} />
                </MenuItem>
                
                <MenuItem onClick={toggleTheme}>
                  <ListItemIcon>
                    {getThemeIcon()}
                  </ListItemIcon>
                  <ListItemText primary={t('Tema', 'Tema')} secondary={getThemeText()} />
                </MenuItem>
              </Menu>
            </Box>


            {user && (
              <Box
                sx={{
                  ml: { xs: 1, md: 2 },
                  display: "flex",
                  alignItems: "center",
                  "& .MuiIconButton-root": {
                    borderRadius: 1,
                    px: { xs: 0.75, sm: 1.25 },
                    py: 0.75,
                    gap: 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      borderColor: alpha(theme.palette.primary.main, 0.26),
                    },
                  },
                  "& .MuiAvatar-root": {
                    width: 40,
                    height: 40,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
                    boxShadow: "none",
                  },
                }}
              >
                <UserProfile />
              </Box>
            )}
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: 0,
              bgcolor: sidebarBg,
            },
          }}
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={toggleMobileDrawer}
          ModalProps={{ keepMounted: true }}
          anchor="left"
        >
          {drawerContent}
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: "100vh",
            bgcolor: "background.default",
            p: { xs: 2, md: 3.5 },
            mt: { xs: "72px", md: "72px" },
            "& .RaList-main": {
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: "background.paper",
              boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
            },
            "& .RaList-actions": {
              mb: 1.5,
              gap: 1,
            },
            "& .MuiToolbar-root.RaToolbar-defaultToolbar": {
              borderTop: "1px solid",
              borderColor: "divider",
            },
            "& .MuiTable-root": {
              minWidth: 760,
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              py: 1.6,
              fontSize: 13,
              textTransform: "uppercase",
            },
            "& .MuiTableBody-root .MuiTableCell-root": {
              py: 1.35,
            },
            "& .MuiTableBody-root .MuiTableRow-root:hover": {
              bgcolor: alpha(theme.palette.primary.main, 0.035),
            },
            "& .MuiCard-root, & .MuiPaper-root": {
              borderRadius: 1,
            },
            "& .MuiButton-contained": {
              boxShadow: "none",
            },
          }}
        >
          {children ?? <Outlet />}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;

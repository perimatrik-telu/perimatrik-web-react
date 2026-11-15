import {
  IconLayoutDashboard,
  IconLibraryPhoto,
  IconLock,
  IconNews,
  IconVersions,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const routes = {
  navbar_front: [
    { path: "/", label: "Beranda", i18nKey: "home", element: "Welcome Home" },
    { path: "/gallery", label: "Galeri", i18nKey: "gallery", element: "Galeri" },
    { path: "/article", label: "Artikel", i18nKey: "article", element: "Artikel" },
    // { path: "/news", label: "Berita", i18nKey: "news", element: "Berita" },
    { path: "/about", label: "Tentang", i18nKey: "about", element: "Tentang" },
  ],
  sidebar_panel: [
    {
      navlabel: true,
      subheader: "Dashboard", i18nKey: "dashboardHeader",
    },
    {
      id: uniqueId(),
      title: "Dashboard", i18nKey: "dashboard",
      icon: IconLayoutDashboard,
      path: "/dashboard",
      element: "Dashboard",
    },
    {
      id: uniqueId(),
      title: "Artikel", i18nKey: "article",
      icon: IconNews,
      path: "/dashboard/article",
      element: "Artikel",
    },
    {
      id: uniqueId(),
      title: "Berita", i18nKey: "news",
      icon: IconNews,
      path: "/dashboard/news",
      element: "Berita",
    },
    {
      id: uniqueId(),
      title: "Galeri", i18nKey: "gallery",
      icon: IconLibraryPhoto,
      path: "/dashboard/gallery",
      element: "Galeri",
    },
    {
      navlabel: true,
      subheader: "Pengaturan", i18nKey: "settingsHeader",
    },
    {
      id: uniqueId(),
      title: "Banner", i18nKey: "banner",
      icon: IconLibraryPhoto,
      path: "/dashboard/setting/content/banner", // Adjusted path for consistency
      element: "Banner",
    },
    {
      id: uniqueId(),
      title: "Angkatan", i18nKey: "force",
      icon: IconVersions,
      path: "/dashboard/setting/content/force", // Adjusted path for consistency
      element: "Angkatan",
    },
    {
      id: uniqueId(),
      title: "Hak Akses", i18nKey: "access",
      icon: IconLock,
      path: "/dashboard/setting/privacy/access", // Adjusted path for consistency
      element: "Hak Akses",
    },
    /* End Setting */
  ],
};

export default routes;

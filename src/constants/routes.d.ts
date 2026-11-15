import type { ElementType } from "react";

interface SidebarPanelRoute {
  id?: string;
  title?: string;
  icon?: ElementType;
  path?: string;
  element?: string;
  navlabel?: boolean;
  subheader?: string;
}

interface NavbarFrontRoute {
  label: string;
  path: string;
  element: string;
}

declare const routes: {
  sidebar_panel: SidebarPanelRoute[];
  navbar_front: NavbarFrontRoute[];
};

export default routes;

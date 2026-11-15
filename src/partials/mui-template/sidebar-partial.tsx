import { useMediaQuery, Box, Drawer, List } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import type { ElementType } from "react";
import { Sidebar, Logo } from "react-mui-sidebar";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom"; // Replaced usePathname with useLocation
import { NavItem } from "../../utils/index.ts"; // Converted to relative import
import { NavGroup } from "../../utils/index.ts"; // Converted to relative import
import routes from "../../constants/routes.js"; // Converted to relative import

// Define a type for items in routes.sidebar_panel
interface NavGroupItem {
  navlabel: boolean;
  subheader: string;
  i18nKey?: string;
}

interface NavItemType {
  id: string;
  title: string;
  i18nKey?: string;
  icon: ElementType<{ stroke?: number; size?: string }>;
  path: string;
  element: string;
}

type SidebarPanelItem = NavGroupItem | NavItemType;

interface ItemType {
  isMobileSidebarOpen: boolean;
  onSidebarClose: (event: React.MouseEvent<HTMLElement>) => void;
  isSidebarOpen: boolean;
}

export const MSidebar = ({
  isMobileSidebarOpen,
  onSidebarClose,
  isSidebarOpen,
}: ItemType) => {
  const { pathname } = useLocation(); // Replaced usePathname with useLocation
  const { t } = useTranslation();

  const pathDirect = pathname;

  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up("lg"));

  const sidebarWidth = "270px";

  // Custom CSS for short scrollbar
  const scrollbarStyles = {
    "&::-webkit-scrollbar": {
      width: "7px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "#eff2f7",
      borderRadius: "15px",
    },
  };

  if (lgUp) {
    return (
      <Box
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
        }}
      >
        {/* ------------------------------------------- */}
        {/* Sidebar for desktop */}
        {/* ------------------------------------------- */}
        <Drawer
          anchor="left"
          open={isSidebarOpen}
          variant="permanent"
          PaperProps={{
            sx: {
              boxSizing: "border-box",
              ...scrollbarStyles,
            },
          }}
        >
          {/* ------------------------------------------- */}
          {/* Sidebar Box */}
          {/* ------------------------------------------- */}
          <Box
            sx={{
              height: "100%",
            }}
          >
            <Sidebar
              width={"270px"}
              collapsewidth="80px"
              themeColor="#5d87ff"
              themeSecondaryColor="#49beff"
              showProfile={false}
            >
              {/* ------------------------------------------- */}
              {/* Logo */}
              {/* ------------------------------------------- */}
              <Logo img="/logos/logo-small.svg">{null}</Logo>
              <Box>
                {/* ------------------------------------------- */}
                {/* Sidebar Items */}
                {/* ------------------------------------------- */}
                <Box sx={{ px: 3 }}>
                  <List sx={{ pt: 0 }} className="sidebarNav" component="div">
                    {(routes.sidebar_panel as SidebarPanelItem[]).map((item) => {
                      // {/********SubHeader**********/}
                      if ('navlabel' in item && item.navlabel && 'subheader' in item) { // Check both navlabel and subheader
                        return <NavGroup item={{...item, subheader: item.i18nKey ? t('sidebar.' + item.i18nKey) : item.subheader}} key={item.subheader} />;

                        // {/********If Sub Menu**********/}
                        /* eslint no-else-return: "off" */
                      } else if ('id' in item) { // Check if it's a NavItemType
                        return (
                          <NavItem item={{...item, title: item.i18nKey ? t('sidebar.' + item.i18nKey) : item.title}}
                            key={item.id}
                            pathDirect={pathDirect}
                            onClick={onSidebarClose}
                          />
                        );
                      }
                      return null; // Fallback for items that don't match
                    })}
                  </List>
                </Box>
              </Box>
            </Sidebar>
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebarOpen}
      onClose={onSidebarClose}
      variant="temporary"
      PaperProps={{
        sx: {
          boxShadow: (theme) => theme.shadows[8],
          ...scrollbarStyles,
        },
      }}
    >
      {/* ------------------------------------------- */}
      {/* Sidebar Box */}
      {/* ------------------------------------------- */}
      <Box px={2}>
        <Sidebar
          width={"270px"}
          collapsewidth="80px"
          isCollapse={false}
          mode="light"
          direction="ltr"
          themeColor="#5d87ff"
          themeSecondaryColor="#49beff"
          showProfile={false}
        >
          {/* ------------------------------------------- */}
          {/* Logo */}
          {/* ------------------------------------------- */}
          <Logo img="/logos/logo-small.svg">{null}</Logo>
          {/* ------------------------------------------- */}
          {/* Sidebar Items */}
          {/* ------------------------------------------- */}
          <Box sx={{ px: 3 }}>
            <List sx={{ pt: 0 }} className="sidebarNav" component="div">
              {(routes.sidebar_panel as SidebarPanelItem[]).map((item) => {
                // {/********SubHeader**********/}
                if ('navlabel' in item && item.navlabel && 'subheader' in item) { // Check both navlabel and subheader
                  return <NavGroup item={{...item, subheader: item.i18nKey ? t('sidebar.' + item.i18nKey) : item.subheader}} key={item.subheader} />;
                } else if ('id' in item) { // Check if it's a NavItemType
                  return (
                    <NavItem item={{...item, title: item.i18nKey ? t('sidebar.' + item.i18nKey) : item.title}}
                      key={item.id}
                      pathDirect={pathDirect}
                      onClick={onSidebarClose}
                    />
                  );
                }
                return null; // Fallback for items that don't match
              })}
            </List>
          </Box>
        </Sidebar>
      </Box>
      {/* ------------------------------------------- */}
      {/* Sidebar For Mobile */}
      {/* ------------------------------------------- */}
    </Drawer>
  );
};

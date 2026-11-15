
import {
  Box,
  AppBar,
  Toolbar,
  styled,
  Stack,
  IconButton,
  Badge,

} from "@mui/material";
import PropTypes from "prop-types";
// components
import { Profile } from "./profile-partial";
import { useTranslation } from "react-i18next";
import { IconBellRinging, IconMenu } from "@tabler/icons-react";

interface ItemType {
  toggleMobileSidebar: (event: React.MouseEvent<HTMLElement>) => void;
}

export const Header = ({ toggleMobileSidebar }: ItemType) => {
  // const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  // const lgDown = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  const { i18n } = useTranslation();

  const AppBarStyled = styled(AppBar)(({ theme }) => ({
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
    background: theme.palette.background.paper,
    justifyContent: "center",
    backdropFilter: "blur(4px)",
    [theme.breakpoints.up("lg")]: {
      minHeight: "70px",
    },
  }));
  const ToolbarStyled = styled(Toolbar)(({ theme }) => ({
    width: "100%",
    color: theme.palette.text.secondary,
  }));

  return (
    <AppBarStyled position="sticky" color="default">
      <ToolbarStyled>
        <IconButton
          color="inherit"
          aria-label="menu"
          onClick={toggleMobileSidebar}
          sx={{
            display: {
              lg: "none",
              xs: "inline",
            },
          }}
        >
          <IconMenu width="20" height="20" />
        </IconButton>

        <Box flexGrow={1} />
        <Stack spacing={1} direction="row" alignItems="center">
          
          <IconButton
            size="small"
            onClick={() => i18n.changeLanguage(i18n.language?.startsWith('en') ? 'id' : 'en')}
            sx={{
              fontSize: '0.85rem',
              fontWeight: '900',
              color: 'text.secondary',
              width: 36,
              height: 36,
              border: '2px solid rgba(0,0,0,0.08)',
            }}
          >
            {i18n.language?.startsWith('en') ? 'EN' : 'ID'}
          </IconButton>
          <IconButton
            size="large"
            aria-label="show 11 new notifications"
            color="inherit"
            aria-controls="msgs-menu"
            aria-haspopup="true"
          >
            <Badge variant="dot" color="primary">
              <IconBellRinging size="21" stroke="1.5" />
            </Badge>
          </IconButton>
          <Profile />
        </Stack>
      </ToolbarStyled>
    </AppBarStyled>
  );
};

Header.propTypes = {
  sx: PropTypes.object,
};



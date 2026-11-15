import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Menu,
  ButtonBase,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import { IconChevronDown, IconUser, IconLogout } from "@tabler/icons-react";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

export const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl2(event.currentTarget);
  const handleClose2 = () => setAnchorEl2(null);

  const handleLogout = async () => {
    await logout();
    toast.success("Berhasil keluar");
    navigate("/login");
  };

  if (!user) return null;

  const roleLabel = user.role.charAt(0).toUpperCase() + user.role.slice(1);

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <ButtonBase
        className="profile-trigger"
        aria-controls={anchorEl2 ? "profile-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={anchorEl2 ? "true" : undefined}
        onClick={handleClick2}
        sx={{
          borderRadius: 2,
          pl: 0.5,
          pr: { xs: 0.5, sm: 1 },
          py: 0.5,
          gap: 1.25,
          color: "text.primary",
          bgcolor: anchorEl2 ? "action.hover" : "transparent",
          transition: "background-color 120ms ease",
          "&:hover": { bgcolor: "action.hover" },
          "&:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
        }}
      >
        <Avatar
          src={user.avatar || "/images/default-avatar.webp"}
          alt={user.name}
          sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 600, bgcolor: "primary.main" }}
        >
          {user.name?.charAt(0)?.toUpperCase() ?? "U"}
        </Avatar>

        <Box sx={{ minWidth: 0, textAlign: "left", display: { xs: "none", sm: "block" } }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25, maxWidth: 160 }}>
            {user.name}
          </Typography>
          <Typography noWrap sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.3 }}>
            {roleLabel}
          </Typography>
        </Box>

        <IconChevronDown
          size={16}
          stroke={2}
          style={{
            color: theme.palette.text.secondary,
            transform: anchorEl2 ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 160ms ease",
          }}
        />
      </ButtonBase>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl2}
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        slotProps={{ paper: {
          sx: {
            width: 280,
            mt: 1,
            borderRadius: 2.5,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: "0 12px 24px -4px rgba(16,24,40,0.08), 0 4px 8px -2px rgba(16,24,40,0.04)",
          },
        } }}
      >
        <Box sx={{ px: 2, py: 1.75 }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar
              src={user.avatar || "/images/default-avatar.webp"}
              alt={user.name}
              sx={{ width: 40, height: 40, bgcolor: "primary.main", fontWeight: 600 }}
            >
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography color="text.primary" noWrap sx={{ fontWeight: 600, fontSize: 14 }}>
                {user.name}
              </Typography>
              <Typography color="text.secondary" noWrap sx={{ fontSize: 13 }}>
                {user.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <MenuItem onClick={() => { handleClose2(); navigate("/dashboard/profile"); }} sx={{ mt: 0.5 }}>
          <ListItemIcon>
            <IconUser size={20} />
          </ListItemIcon>
          <ListItemText primary="Profil Saya" />
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem onClick={handleLogout} sx={{ color: "error.main", mb: 0.5 }}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <IconLogout size={20} />
          </ListItemIcon>
          <ListItemText primary="Keluar" />
        </MenuItem>
      </Menu>
    </Box>
  );
};

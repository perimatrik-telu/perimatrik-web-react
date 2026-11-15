import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Menu,
  Button,
  ButtonBase,
  Chip,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

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
          borderRadius: 1,
          px: { xs: 0.75, sm: 1 },
          py: 0.75,
          gap: 1.25,
          minHeight: 52,
          border: "1px solid",
          borderColor: anchorEl2
            ? alpha(theme.palette.primary.main, 0.32)
            : "rgba(255,255,255,0.08)",
          bgcolor: anchorEl2
            ? "#17222d"
            : "#101820",
          color: "common.white",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.16)",
          transition:
            "background-color 160ms ease, border-color 160ms ease, box-shadow 160ms ease",
          "&:hover": {
            bgcolor: "#17222d",
            borderColor: alpha(theme.palette.primary.main, 0.42),
            boxShadow: "0 12px 28px rgba(15, 23, 42, 0.2)",
          },
        }}
      >
        <Avatar
          src={user.avatar || "/images/default-avatar.webp"}
          alt={user.name}
          sx={{
            width: 38,
            height: 38,
            fontWeight: 800,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
          }}
        >
          {user.name?.charAt(0)?.toUpperCase() ?? "U"}
        </Avatar>

        <Box
          sx={{
            minWidth: 0,
            textAlign: "left",
            display: "block",
          }}
        >
          <Typography
            variant="body2"
            noWrap
            sx={{
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.15,
              maxWidth: { xs: 86, sm: 150 },
            }}
          >
            {user.name}
          </Typography>
          <Chip
            label={roleLabel}
            size="small"
            sx={{
              display: { xs: "none", sm: "inline-flex" },
              mt: 0.5,
              height: 20,
              borderRadius: 1,
              fontSize: 11,
              fontWeight: 800,
              color: "#ffffff",
              bgcolor: alpha(theme.palette.primary.main, 0.86),
              border: `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
              "& .MuiChip-label": {
                px: 0.75,
              },
            }}
          />
        </Box>

        <IconChevronDown
          size={18}
          stroke={2}
          style={{
            color: "rgba(255,255,255,0.82)",
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
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            overflow: "hidden",
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
          },
        } }}
      >
        <Box sx={{ px: 2, py: 1.75, bgcolor: alpha(theme.palette.primary.main, 0.075) }}>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
            <Avatar
              src={user.avatar || "/images/default-avatar.webp"}
              alt={user.name}
              sx={{ width: 42, height: 42, bgcolor: "primary.main", fontWeight: 800 }}
            >
              {user.name?.charAt(0)?.toUpperCase() ?? "U"}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography color="text.primary" noWrap sx={{ fontWeight: 800 }}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <MenuItem onClick={() => { handleClose2(); navigate("/dashboard/profile"); }}>
          <ListItemIcon>
            <IconUser size={20} />
          </ListItemIcon>
          <ListItemText primary="Profil Saya" />
        </MenuItem>

        <Divider sx={{ my: 1 }} />

        {/* LOGOUT */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            fullWidth
            startIcon={<IconLogout size={18} />}
            sx={{ borderRadius: 1, py: 1 }}
          >
            Keluar
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

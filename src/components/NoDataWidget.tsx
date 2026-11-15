import React from "react";
import { Link } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faFolderOpen } from "@fortawesome/free-solid-svg-icons";

interface NoDataWidgetProps {
  /** Main heading of the empty state. */
  message?: string;
  /** Optional supporting sentence under the heading. */
  description?: string;
  /** Icon shown in the badge. */
  icon?: IconDefinition;
  /** Optional call-to-action rendered as a router link. */
  action?: { label: string; to: string; icon?: IconDefinition };
  /** Smaller padding, for use inside page sections. */
  compact?: boolean;
  /** Kept for backward compatibility; ignored in favour of `icon`. */
  imageSrc?: string;
}

export const NoDataWidget: React.FC<NoDataWidgetProps> = ({
  message = "No data available at the moment.",
  description,
  icon = faFolderOpen,
  action,
  compact = false,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const primary = theme.palette.primary.main;

  return (
    <Box
      role="status"
      sx={{
        width: "100%",
        maxWidth: 560,
        mx: "auto",
        px: { xs: 3, sm: 5 },
        py: compact ? { xs: 5, sm: 6 } : { xs: 6, sm: 8 },
        textAlign: "center",
        borderRadius: 4,
        border: `1px dashed ${alpha(theme.palette.text.primary, isDark ? 0.18 : 0.14)}`,
        backgroundColor: alpha(theme.palette.text.primary, isDark ? 0.03 : 0.02),
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          mx: "auto",
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          color: primary,
          backgroundColor: alpha(primary, isDark ? 0.16 : 0.1),
          boxShadow: `0 0 0 8px ${alpha(primary, isDark ? 0.06 : 0.04)}`,
          fontSize: 28,
        }}
      >
        <FontAwesomeIcon icon={icon} />
      </Box>

      <Typography
        component="h3"
        sx={{
          fontSize: { xs: "1.125rem", sm: "1.25rem" },
          fontWeight: 700,
          color: "text.primary",
          mb: description ? 1 : 0,
        }}
      >
        {message}
      </Typography>

      {description && (
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.95rem",
            lineHeight: 1.6,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button
          component={Link}
          to={action.to}
          variant="outlined"
          color="primary"
          startIcon={action.icon ? <FontAwesomeIcon icon={action.icon} /> : undefined}
          sx={{ mt: 3, borderRadius: 999, px: 3, textTransform: "none", fontWeight: 600 }}
        >
          {action.label}
        </Button>
      )}
    </Box>
  );
};

export default NoDataWidget;

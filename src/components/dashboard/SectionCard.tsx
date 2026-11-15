import type { ReactNode } from "react";
import { Box, Paper, Stack, Typography, type SxProps, type Theme } from "@mui/material";
import { dashboardCardSx } from "./dashboardStyles";

type SectionCardProps = {
  title?: ReactNode;
  description?: ReactNode;
  /** Element aligned to the right of the header (button, switch, badge). */
  action?: ReactNode;
  children?: ReactNode;
  /** Footer row, typically form buttons; rendered right-aligned on a subtle background. */
  footer?: ReactNode;
  /** Remove body padding (e.g. for lists or tables that span the card). */
  disablePadding?: boolean;
  sx?: SxProps<Theme>;
};

/**
 * Card with an optional header (title + description + action), a body and an optional footer.
 * Use one SectionCard per logical group of fields or content on dashboard pages.
 */
export const SectionCard = ({ title, description, action, children, footer, disablePadding, sx }: SectionCardProps) => (
  <Paper elevation={0} sx={[dashboardCardSx, { overflow: "hidden" }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {(title || action) && (
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ px: { xs: 2, md: 3 }, py: 2.25, borderBottom: "1px solid", borderColor: "divider", alignItems: { sm: "center" }, justifyContent: "space-between" }}
      >
        <Box sx={{ minWidth: 0 }}>
          {title && (
            <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>
              {title}
            </Typography>
          )}
          {description && (
            <Typography sx={{ mt: 0.25, fontSize: 14, color: "text.secondary" }}>{description}</Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Stack>
    )}
    {children !== undefined && <Box sx={disablePadding ? undefined : { p: { xs: 2, md: 3 } }}>{children}</Box>}
    {footer && (
      <Stack
        direction="row"
        spacing={1.25}
        sx={{ px: { xs: 2, md: 3 }, py: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "action.hover", justifyContent: "flex-end", flexWrap: "wrap", rowGap: 1 }}
      >
        {footer}
      </Stack>
    )}
  </Paper>
);

/** Label + optional hint above a form control, matching the dashboard type scale. */
export const FieldLabel = ({ id, htmlFor, children, hint, hintId, required }: {
  /** id of the label element itself, for `aria-labelledby` (e.g. MUI Select). */
  id?: string;
  htmlFor?: string;
  children: ReactNode;
  hint?: ReactNode;
  /** id of the hint text, for `aria-describedby` on the control. */
  hintId?: string;
  required?: boolean;
}) => (
  <Box sx={{ mb: 0.75 }}>
    <Typography component="label" id={id} htmlFor={htmlFor} sx={{ display: "block", fontSize: 14, fontWeight: 500, color: "text.primary" }}>
      {children}
      {required && <Box component="span" sx={{ color: "error.main", ml: 0.25 }}>*</Box>}
    </Typography>
    {hint && <Typography id={hintId} sx={{ fontSize: 13, color: "text.secondary", mt: 0.25 }}>{hint}</Typography>}
  </Box>
);

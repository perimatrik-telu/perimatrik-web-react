import type { ReactNode } from "react";
import { alpha, Box, Stack, Typography } from "@mui/material";

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Small element rendered next to the title, e.g. a count badge. */
  meta?: ReactNode;
  /** Buttons aligned to the right on desktop, stacked below on mobile. */
  actions?: ReactNode;
};

/** Standard page heading for dashboard pages: title, supporting text and primary actions. */
export const PageHeader = ({ title, description, meta, actions }: PageHeaderProps) => (
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    sx={{ alignItems: { xs: "stretch", sm: "flex-end" }, justifyContent: "space-between" }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
        <Typography component="h1" sx={{ fontSize: { xs: 22, md: 26 }, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
          {title}
        </Typography>
        {meta}
      </Stack>
      {description && (
        <Typography sx={{ mt: 0.5, fontSize: 14, color: "text.secondary", maxWidth: 640 }}>
          {description}
        </Typography>
      )}
    </Box>
    {actions && (
      <Stack direction="row" spacing={1.25} sx={{ flexShrink: 0, flexWrap: "wrap", rowGap: 1, "& > *": { flex: { xs: "1 1 auto", sm: "0 0 auto" } } }}>
        {actions}
      </Stack>
    )}
  </Stack>
);

/** Neutral pill used for counts and statuses. */
export const CountBadge = ({ children }: { children: ReactNode }) => (
  <Box
    component="span"
    sx={{
      px: 1, py: 0.25, borderRadius: 999, fontSize: 12, fontWeight: 600, lineHeight: 1.5, whiteSpace: "nowrap",
      color: "text.secondary", bgcolor: "action.hover", border: "1px solid", borderColor: "divider",
    }}
  >
    {children}
  </Box>
);

type StatusTone = "success" | "warning" | "neutral" | "error" | "info";

/** Small status pill with a leading dot, e.g. "Terbit" / "Draft". */
export const StatusPill = ({ tone = "neutral", children }: { tone?: StatusTone; children: ReactNode }) => {
  const color = tone === "neutral" ? "text.secondary" : `${tone}.main`;
  return (
    <Box
      component="span"
      sx={(theme) => {
        const main = tone === "neutral" ? theme.palette.text.secondary : theme.palette[tone].main;
        return {
          display: "inline-flex", alignItems: "center", gap: 0.75,
          px: 1, py: 0.25, borderRadius: 999, fontSize: 12, fontWeight: 600, lineHeight: 1.5, whiteSpace: "nowrap",
          color, border: "1px solid", borderColor: alpha(main, 0.3), bgcolor: alpha(main, 0.08),
          "&::before": { content: '""', width: 6, height: 6, borderRadius: "50%", bgcolor: main },
        };
      }}
    >
      {children}
    </Box>
  );
};

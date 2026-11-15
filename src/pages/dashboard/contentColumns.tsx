import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { TableImage } from "../../components/dashboard/DashboardTable";
import { StatusPill } from "../../components/dashboard/PageHeader";

/** Thumbnail + bold title + secondary line, used as the primary column of content tables. */
export const MediaTitleCell = ({ image, title, subtitle }: { image?: string | null; title: ReactNode; subtitle?: ReactNode }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
    <TableImage src={image} alt="" />
    <Box sx={{ minWidth: 0 }}>
      <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: "text.primary", maxWidth: 420 }}>
        {title}
      </Typography>
      {subtitle !== undefined && (
        <Typography noWrap sx={{ fontSize: 13, color: "text.secondary" }}>
          {subtitle || "—"}
        </Typography>
      )}
    </Box>
  </Stack>
);

type PublishableRow = { status?: "draft" | "active" | "inactive"; published_at?: string | null };

export const ContentStatusPill = ({ row }: { row: PublishableRow }) => {
  const status = row.status ?? (row.published_at ? "active" : "draft");
  if (status === "active") return <StatusPill tone="success">Terbit</StatusPill>;
  if (status === "inactive") return <StatusPill tone="warning">Nonaktif</StatusPill>;
  return <StatusPill>Draft</StatusPill>;
};

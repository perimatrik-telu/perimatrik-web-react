import { Box, Stack, Typography } from "@mui/material";
import { StatusPill } from "../../components/dashboard/PageHeader";
import {
  deleteArticle,
  getAllArticles,
} from "../../controllers/article-controller";
import {
  TableImage,
  type DashboardTableColumn,
} from "../../components/dashboard/DashboardTable";
import { ContentTablePage } from "./ContentTablePage";

type ArticleRow = {
  id: string;
  image?: string;
  title: string;
  author?: string;
  views?: number;
  published_at?: string | null;
  status?: "draft" | "active" | "inactive";
};

const statusPill = (row: ArticleRow) => {
  const status = row.status ?? (row.published_at ? "active" : "draft");
  if (status === "active") return <StatusPill tone="success">Terbit</StatusPill>;
  if (status === "inactive") return <StatusPill tone="warning">Nonaktif</StatusPill>;
  return <StatusPill>Draft</StatusPill>;
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

const articleColumns: DashboardTableColumn<ArticleRow>[] = [
  {
    key: "title",
    label: "Artikel",
    render: (row) => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
        <TableImage src={row.image} alt="" />
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: "text.primary", maxWidth: 420 }}>
            {row.title}
          </Typography>
          <Typography noWrap sx={{ fontSize: 13, color: "text.secondary" }}>
            {row.author || "—"}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    key: "status",
    label: "Status",
    width: 120,
    render: statusPill,
  },
  {
    key: "views",
    label: "Dilihat",
    width: 100,
    align: "right",
    render: (row) => (row.views ?? 0).toLocaleString("id-ID"),
  },
  {
    key: "published_at",
    label: "Tanggal terbit",
    width: 150,
    render: (row) => formatDate(row.published_at),
  },
];

const filterArticle = (row: ArticleRow, query: string) =>
  [row.title, row.author, String(row.views ?? "")]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));

export const RAArticleListPage = () => (
  <ContentTablePage
    title="Artikel"
    description="Kelola artikel anggota dan publikasi website."
    createLabel="Tambah Artikel"
    createPath="/dashboard/article/create"
    getEditPath={(row) => `/dashboard/article/edit/${row.id}`}
    columns={articleColumns}
    fetchRows={getAllArticles}
    deleteRow={deleteArticle}
    searchPlaceholder="Cari judul atau penulis…"
    filterRow={filterArticle}
    emptyTitle="Artikel tidak ditemukan"
  />
);

export default RAArticleListPage;

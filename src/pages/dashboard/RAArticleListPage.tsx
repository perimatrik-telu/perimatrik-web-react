import { Typography } from "@mui/material";
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
};

const articleColumns: DashboardTableColumn<ArticleRow>[] = [
  {
    key: "image",
    label: "Gambar",
    width: 104,
    render: (row) => <TableImage src={row.image} alt={row.title} />,
  },
  {
    key: "title",
    label: "Judul",
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 800, maxWidth: 360 }} noWrap>
        {row.title}
      </Typography>
    ),
  },
  { key: "author", label: "Penulis", width: 180 },
  { key: "views", label: "Dilihat", width: 96, align: "right" },
  {
    key: "published_at",
    label: "Terbit",
    width: 150,
    render: (row) =>
      row.published_at ? new Date(row.published_at).toLocaleDateString("id-ID") : "-",
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
    searchPlaceholder="Cari artikel di halaman ini..."
    filterRow={filterArticle}
    emptyTitle="Artikel tidak ditemukan"
  />
);

export default RAArticleListPage;

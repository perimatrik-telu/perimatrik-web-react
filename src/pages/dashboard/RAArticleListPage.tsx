import {
  deleteArticle,
  getAllArticles,
} from "../../controllers/article-controller";
import type { DashboardTableColumn } from "../../components/dashboard/DashboardTable";
import { ContentStatusPill, MediaTitleCell } from "./contentColumns";
import { formatDate } from "../../utils/format";
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

const articleColumns: DashboardTableColumn<ArticleRow>[] = [
  {
    key: "title",
    label: "Artikel",
    render: (row) => <MediaTitleCell image={row.image} title={row.title} subtitle={row.author} />,
  },
  {
    key: "status",
    label: "Status",
    width: 120,
    render: (row) => <ContentStatusPill row={row} />,
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

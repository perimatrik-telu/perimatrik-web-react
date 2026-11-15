import { deleteNews, getAllNews } from "../../controllers/news-controller";
import type { DashboardTableColumn } from "../../components/dashboard/DashboardTable";
import { ContentStatusPill, MediaTitleCell } from "./contentColumns";
import { formatDate } from "../../utils/format";
import { ContentTablePage } from "./ContentTablePage";

type NewsRow = {
  id: string;
  image?: string;
  title: string;
  author?: string;
  views?: number;
  published_at?: string | null;
  status?: "draft" | "active" | "inactive";
};

const newsColumns: DashboardTableColumn<NewsRow>[] = [
  {
    key: "title",
    label: "Berita",
    render: (row) => <MediaTitleCell image={row.image} title={row.title} subtitle={row.author} />,
  },
  { key: "status", label: "Status", width: 120, render: (row) => <ContentStatusPill row={row} /> },
  { key: "views", label: "Dilihat", width: 100, align: "right", render: (row) => (row.views ?? 0).toLocaleString("id-ID") },
  { key: "published_at", label: "Tanggal terbit", width: 150, render: (row) => formatDate(row.published_at) },
];

const fetchNewsRows = ({
  page,
  limit,
  userId,
}: {
  page: number;
  limit: number;
  userId?: string;
}) => getAllNews(page, limit, userId);

const filterNews = (row: NewsRow, query: string) =>
  [row.title, row.author, String(row.views ?? "")]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));

export const RANewsListPage = () => (
  <ContentTablePage
    title="Berita"
    description="Kelola berita, pengumuman, dan publikasi organisasi."
    createLabel="Tambah Berita"
    createPath="/dashboard/news/create"
    getEditPath={(row) => `/dashboard/news/edit/${row.id}`}
    columns={newsColumns}
    fetchRows={fetchNewsRows}
    deleteRow={deleteNews}
    searchPlaceholder="Cari judul atau penulis…"
    filterRow={filterNews}
    emptyTitle="Berita tidak ditemukan"
  />
);

export default RANewsListPage;

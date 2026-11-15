import { Typography } from "@mui/material";
import { deleteNews, getAllNews } from "../../controllers/news-controller";
import {
  TableImage,
  type DashboardTableColumn,
} from "../../components/dashboard/DashboardTable";
import { ContentTablePage } from "./ContentTablePage";

type NewsRow = {
  id: string;
  image?: string;
  title: string;
  author?: string;
  views?: number;
  published_at?: string | null;
};

const newsColumns: DashboardTableColumn<NewsRow>[] = [
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
    searchPlaceholder="Cari berita di halaman ini..."
    filterRow={filterNews}
    emptyTitle="Berita tidak ditemukan"
  />
);

export default RANewsListPage;

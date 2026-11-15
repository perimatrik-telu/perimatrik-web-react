import { Typography } from "@mui/material";
import {
  deleteGallery,
  getAllGalleries,
} from "../../controllers/gallery-controller";
import {
  TableImage,
  type DashboardTableColumn,
} from "../../components/dashboard/DashboardTable";
import { ContentTablePage } from "./ContentTablePage";

type GalleryRow = {
  id: string;
  image_url?: string;
  caption?: string;
  user?: { name?: string } | null;
};

const galleryColumns: DashboardTableColumn<GalleryRow>[] = [
  {
    key: "image_url",
    label: "Gambar",
    width: 104,
    render: (row) => <TableImage src={row.image_url} alt={row.caption || "Gallery"} />,
  },
  {
    key: "caption",
    label: "Keterangan",
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 800, maxWidth: 440 }} noWrap>
        {(!row.caption || row.caption === "null") ? "-" : row.caption}
      </Typography>
    ),
  },
  {
    key: "user",
    label: "Pengguna",
    width: 220,
    render: (row) => row.user?.name || "-",
  },
];

const fetchGalleryRows = ({
  page,
  limit,
  userId,
}: {
  page: number;
  limit: number;
  userId?: string;
}) => getAllGalleries(page, limit, userId);

const deleteGalleryRow = async (id: string) => {
  const deleted = await deleteGallery(id);
  if (!deleted) {
    throw new Error("Galeri gagal dihapus");
  }
};

const filterGallery = (row: GalleryRow, query: string) =>
  [row.caption, row.user?.name]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));

export const RAGalleryListPage = () => (
  <ContentTablePage
    title="Galeri"
    description="Kelola dokumentasi foto dan kontribusi galeri."
    createLabel="Tambah Galeri"
    createPath="/dashboard/gallery/create"
    getEditPath={(row) => `/dashboard/gallery/edit/${row.id}`}
    columns={galleryColumns}
    fetchRows={fetchGalleryRows}
    deleteRow={deleteGalleryRow}
    searchPlaceholder="Cari galeri di halaman ini..."
    filterRow={filterGallery}
    emptyTitle="Galeri tidak ditemukan"
    forceUserFilter={true}
  />
);

export default RAGalleryListPage;

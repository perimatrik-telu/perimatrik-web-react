import {
  deleteGallery,
  getAllGalleries,
} from "../../controllers/gallery-controller";
import type { DashboardTableColumn } from "../../components/dashboard/DashboardTable";
import { MediaTitleCell } from "./contentColumns";
import { ContentTablePage } from "./ContentTablePage";

type GalleryRow = {
  id: string;
  image_url?: string;
  caption?: string;
  user?: { name?: string } | null;
};

const captionOf = (row: GalleryRow) => (!row.caption || row.caption === "null" ? "Tanpa keterangan" : row.caption);

const galleryColumns: DashboardTableColumn<GalleryRow>[] = [
  {
    key: "caption",
    label: "Foto",
    render: (row) => <MediaTitleCell image={row.image_url} title={captionOf(row)} />,
  },
  {
    key: "user",
    label: "Diunggah oleh",
    width: 240,
    render: (row) => row.user?.name || "—",
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
    searchPlaceholder="Cari keterangan atau pengunggah…"
    filterRow={filterGallery}
    emptyTitle="Galeri tidak ditemukan"
    forceUserFilter={true}
  />
);

export default RAGalleryListPage;

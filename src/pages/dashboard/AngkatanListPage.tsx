import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import {
  DashboardRowActions,
  DashboardTable,
  type DashboardTableColumn,
} from "../../components/dashboard/DashboardTable";
import api from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import { useConfirm } from "../../components/dashboard/confirm-context";

interface Angkatan {
  id: string;
  nama_angkatan: string;
  year: string;
}

const columns: DashboardTableColumn<Angkatan>[] = [
  {
    key: "nama_angkatan",
    label: "Nama angkatan",
    render: (row) => (
      <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: "text.primary", maxWidth: 480 }}>
        {row.nama_angkatan}
      </Typography>
    ),
  },
  {
    key: "year",
    label: "Tahun",
    width: 120,
    align: "right",
    render: (row) => (
      <Box component="span" sx={{ fontVariantNumeric: "tabular-nums" }}>{row.year || "—"}</Box>
    ),
  },
];

const AngkatanListPage = () => {
  const { user, isLoading: userLoading } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [angkatans, setAngkatans] = useState<Angkatan[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAngkatans = async () => {
    setLoading(true);
    try {
      const response = await api.get("/content/angkatan");
      setAngkatans(response.data.data);
    } catch (error) {
      console.error("Failed to fetch angkatans:", error);
      toast.error("Gagal memuat angkatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchAngkatans();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDelete = async (id: string) => {
    if (!(await confirm({ title: "Hapus angkatan ini?", description: "Tindakan ini tidak dapat dibatalkan." }))) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/content/angkatan/${id}`);
      toast.success("Angkatan berhasil dihapus");
      await fetchAngkatans();
    } catch (error) {
      console.error("Failed to delete angkatan:", error);
      toast.error("Gagal menghapus angkatan");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAngkatans = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return angkatans;
    }

    return angkatans.filter(
      (angkatan) =>
        angkatan.nama_angkatan.toLowerCase().includes(query) ||
        angkatan.year.toLowerCase().includes(query),
    );
  }, [angkatans, searchQuery]);

  const paginatedAngkatans = filteredAngkatans.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  if (userLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "officer")) {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography component="h1" sx={{ fontSize: 20, fontWeight: 600, color: "text.primary" }}>
          Akses Ditolak
        </Typography>
        <Button sx={{ mt: 2.5 }} variant="contained" onClick={() => navigate("/")}>
          Kembali ke Beranda
        </Button>
      </Box>
    );
  }

  return (
    <DashboardTable
      title="Angkatan"
      description="Kelola data angkatan anggota PERIMATRIK."
      columns={columns}
      rows={paginatedAngkatans}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={filteredAngkatans.length}
      searchValue={searchQuery}
      searchPlaceholder="Cari angkatan..."
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(0);
      }}
      actions={[
        {
          label: "Tambah Angkatan",
          onClick: () => navigate("/dashboard/angkatan/create"),
          icon: <FontAwesomeIcon icon={faPlus} />,
        },
      ]}
      emptyTitle="Angkatan tidak ditemukan"
      minWidth={560}
      onPageChange={setPage}
      onRowsPerPageChange={(value) => {
        setRowsPerPage(value);
        setPage(0);
      }}
      renderRowActions={(row) => (
        <DashboardRowActions
          onEdit={() => navigate(`/dashboard/angkatan/edit/${row.id}`)}
          onDelete={() => handleDelete(row.id)}
          deleting={deletingId === row.id}
          deleteDisabled={Boolean(deletingId && deletingId !== row.id)}
        />
      )}
    />
  );
};

export default AngkatanListPage;

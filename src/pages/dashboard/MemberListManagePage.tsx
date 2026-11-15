import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import {
  DashboardRowActions,
  DashboardTable,
  type DashboardTableColumn,
} from "../../components/dashboard/DashboardTable";
import api from "../../api/api";
import { useAuth } from "../../hooks/useAuth";
import { MAIN_URL } from "../../constants/constant";

interface Angkatan {
  id: string;
  nama_angkatan: string;
  year: string;
}

interface Member {
  id: string;
  no_anggota: string;
  nama_lengkap: string;
  nama_lapangan: string;
  domisili: string;
  kontak: string;
  avatar?: string;
  angkatan?: Angkatan | null;
}

const columns: DashboardTableColumn<Member>[] = [
  { key: "no_anggota", label: "No. Anggota", width: 150 },
  {
    key: "nama_lengkap",
    label: "Nama Lengkap",
    render: (row) => (
      <Typography variant="body2" sx={{ fontWeight: 800, maxWidth: 240 }} noWrap>
        {row.nama_lengkap}
      </Typography>
    ),
  },
  { key: "nama_lapangan", label: "Nama Lapangan", width: 180 },
  {
    key: "angkatan",
    label: "Angkatan",
    width: 180,
    render: (row) => row.angkatan?.nama_angkatan || "-",
  },
  { key: "domisili", label: "Domisili", width: 180 },
  { key: "kontak", label: "Kontak", width: 160 },
];

const MemberListManagePage = () => {
  const { t } = useTranslation();
  const { user, token, isLoading: userLoading } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportFormatLoading, setExportFormatLoading] = useState<"xlsx" | "csv" | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/content/member");
      setMembers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Gagal memuat anggota");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchMembers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleExport = async (format: "xlsx" | "csv") => {
    setExportFormatLoading(format);
    try {
      const response = await fetch(`${MAIN_URL}content/export-members?format=${format}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Ekspor gagal");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `database_anggota_perimatrik.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`Database berhasil diekspor sebagai ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Failed to export members:", error);
      toast.error(`Gagal mengekspor database ${format.toUpperCase()}`);
    } finally {
      setExportFormatLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Hapus anggota ini?")) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/content/member/${id}`);
      toast.success("Anggota berhasil dihapus");
      await fetchMembers();
    } catch (error) {
      console.error("Failed to delete member:", error);
      toast.error("Gagal menghapus anggota");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return members;
    }

    return members.filter((member) =>
      [
        member.no_anggota,
        member.nama_lengkap,
        member.nama_lapangan,
        member.domisili,
        member.kontak,
        member.angkatan?.nama_angkatan,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [members, searchQuery]);

  const paginatedMembers = filteredMembers.slice(
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

  if (!user || user.role !== "admin") {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h4" color="error">
          Akses Ditolak
        </Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>
          Kembali ke Beranda
        </Button>
      </Box>
    );
  }

  return (
    <DashboardTable
      title="Anggota"
      description="Kelola database anggota, profil, kontak, dan ekspor data."
      columns={columns}
      rows={paginatedMembers}
      loading={loading}
      page={page}
      rowsPerPage={rowsPerPage}
      totalCount={filteredMembers.length}
      searchValue={searchQuery}
      searchPlaceholder="Cari anggota..."
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(0);
      }}
      actions={[
        {
          label: "Ekspor CSV",
          onClick: () => handleExport("csv"),
          icon: <FontAwesomeIcon icon={faDownload} />,
          variant: "outlined",
          loading: exportFormatLoading === "csv",
          disabled: exportFormatLoading !== null,
        },
        {
          label: "Ekspor Excel",
          onClick: () => handleExport("xlsx"),
          icon: <FontAwesomeIcon icon={faDownload} />,
          variant: "outlined",
          loading: exportFormatLoading === "xlsx",
          disabled: exportFormatLoading !== null,
        },
        {
          label: "Tambah Anggota",
          onClick: () => navigate("/dashboard/member/create"),
          icon: <FontAwesomeIcon icon={faPlus} />,
        },
      ]}
      emptyTitle="Anggota tidak ditemukan"
      minWidth={1120}
      onPageChange={setPage}
      onRowsPerPageChange={(value) => {
        setRowsPerPage(value);
        setPage(0);
      }}
      renderRowActions={(row) => (
        <DashboardRowActions
          onEdit={() => navigate(`/dashboard/member/edit/${row.id}`)}
          onDelete={() => handleDelete(row.id)}
          deleting={deletingId === row.id}
          deleteDisabled={Boolean(deletingId && deletingId !== row.id)}
        />
      )}
    />
  );
};

export default MemberListManagePage;

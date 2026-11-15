import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { FieldLabel, SectionCard } from "../../components/dashboard/SectionCard";
import api from "../../api/api";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";

interface AngkatanFormData {
  nama_angkatan: string;
  year: string;
}

type ApiErrorResponse = {
  response?: {
    data?: {
      errors?: { [key: string]: string[] };
      message?: string;
    };
  };
};

const AngkatanFormPage = () => {
  const { t } = useTranslation();
  const { user, isLoading: userLoading } = useAuth();
  const [formData, setFormData] = useState<AngkatanFormData>({
    nama_angkatan: "",
    year: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>(); // Optional ID for editing

  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchAngkatan = async () => {
      setLoading(true);
      try {
        if (isEditMode) {
          const response = await api.get(`/content/angkatan/${id}`);
          setFormData({
            nama_angkatan: response.data.data.nama_angkatan,
            year: response.data.data.year,
          });
        }
      } catch (error) {
        console.error("Failed to fetch angkatan for editing:", error);
        toast.error("Gagal memuat data angkatan.");
      } finally {
        setLoading(false);
      }
    };
    fetchAngkatan();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: [] })); // Clear error on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (isEditMode) {
        await api.put(`/content/angkatan/${id}`, formData);
        toast.success("Angkatan berhasil diperbarui.");
      } else {
        await api.post("/content/angkatan", formData);
        toast.success("Angkatan berhasil dibuat.");
      }
      navigate("/dashboard/angkatan"); // Redirect to list page
    } catch (error: unknown) {
      console.error("Failed to save angkatan:", error);
      const apiError = error as ApiErrorResponse;
      if (apiError.response?.data?.errors) {
        setErrors(apiError.response.data.errors);
        toast.error("Validasi gagal. Periksa kembali isian Anda.");
      } else {
        toast.error("Terjadi kesalahan saat menyimpan angkatan.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Authorization Check
  if (userLoading || loading) {
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
        <Button
          sx={{ mt: 2.5 }}
          variant="contained"
          onClick={() => navigate("/")}
        >
          Kembali ke Beranda
        </Button>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={isEditMode ? "Ubah Angkatan" : "Tambah Angkatan Baru"}
        description="Nama dan tahun angkatan anggota PERIMATRIK."
      />

      <Box component="form" onSubmit={handleSubmit}>
        <SectionCard
          title="Data angkatan"
          footer={
            <>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/dashboard/angkatan")}
                disabled={submitting}
              >
                {t("crud.batal")}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
              >
                {isEditMode ? "Perbarui Angkatan" : "Tambah Angkatan"}
              </Button>
            </>
          }
        >
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FieldLabel htmlFor="nama_angkatan">Nama Angkatan</FieldLabel>
              <TextField
                id="nama_angkatan"
                fullWidth
                size="small"
                name="nama_angkatan"
                value={formData.nama_angkatan}
                onChange={handleChange}
                error={!!errors.nama_angkatan}
                helperText={errors.nama_angkatan ? errors.nama_angkatan[0] : ""}
                slotProps={{ htmlInput: {
                  maxLength: 255,
                } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FieldLabel htmlFor="year">Tahun</FieldLabel>
              <TextField
                id="year"
                fullWidth
                size="small"
                name="year"
                placeholder="contoh: 2024"
                value={formData.year}
                onChange={handleChange}
                error={!!errors.year}
                helperText={errors.year ? errors.year[0] : ""}
                slotProps={{ htmlInput: {
                  maxLength: 4,
                  pattern: "\\d{4}", // HTML5 pattern for 4 digits
                  inputMode: "numeric",
                } }}
              />
            </Grid>
          </Grid>
        </SectionCard>
      </Box>
    </Stack>
  );
};

export default AngkatanFormPage;

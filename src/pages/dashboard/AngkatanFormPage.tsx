import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  FormLabel,
} from "@mui/material";
import { Stack } from "@mui/system";
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
        <Typography variant="h4" color="error">
          Akses Ditolak
        </Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => navigate("/")}
        >
          Kembali ke Beranda
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? "Ubah Angkatan" : "Tambah Angkatan Baru"}
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Box sx={{ width: "100%" }}>
              <FormLabel
                htmlFor="nama_angkatan"
                sx={{ mb: 1, display: "block", fontWeight: "bold" }}
              >
                Nama Angkatan
              </FormLabel>
              <TextField
                id="nama_angkatan"
                fullWidth
                name="nama_angkatan"
                value={formData.nama_angkatan}
                onChange={handleChange}
                error={!!errors.nama_angkatan}
                helperText={errors.nama_angkatan ? errors.nama_angkatan[0] : ""}
                slotProps={{ htmlInput: {
                  maxLength: 255,
                } }}
              />
            </Box>

            <Box sx={{ width: "100%" }}>
              <FormLabel
                htmlFor="year"
                sx={{ mb: 1, display: "block", fontWeight: "bold" }}
              >
                Tahun
              </FormLabel>
              <TextField
                id="year"
                fullWidth
                name="year"
                value={formData.year}
                onChange={handleChange}
                error={!!errors.year}
                helperText={errors.year ? errors.year[0] : ""}
                slotProps={{ htmlInput: {
                  maxLength: 4,
                  pattern: "\\d{4}", // HTML5 pattern for 4 digits
                } }}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/dashboard/angkatan")}
                disabled={submitting}
              >{t('crud.batal')}</Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : isEditMode ? (
                  "Perbarui Angkatan"
                ) : (
                  "Tambah Angkatan"
                )}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default AngkatanFormPage;

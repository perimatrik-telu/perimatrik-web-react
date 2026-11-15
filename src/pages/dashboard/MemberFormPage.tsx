import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  FormLabel,
  Alert,
  Grid,
  Divider,
  Avatar,
} from "@mui/material";
import { Stack } from "@mui/system";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/api";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { User } from "../../types/models";

interface Angkatan {
  id: string;
  nama_angkatan: string;
  year: string;
}

interface MemberFormData {
  no_anggota: string;
  nama_lengkap: string;
  nama_lapangan: string;
  domisili: string;
  kontak: string;
  angkatan_id: string;
  user_id: string;
  avatar: File | null;
  current_avatar_url?: string | null;
  avatar_removed?: boolean;
}

type ApiErrorResponse = {
  response?: {
    status?: number;
    data?: {
      errors?: { [key: string]: string[] };
      message?: string;
    };
  };
};

const MemberFormPage = () => {
  const { t } = useTranslation();
  const { user, isLoading: userLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  const [formData, setFormData] = useState<MemberFormData>({
    no_anggota: "",
    nama_lengkap: "",
    nama_lapangan: "",
    domisili: "",
    kontak: "",
    angkatan_id: "",
    user_id: "",
    avatar: null,
    current_avatar_url: null,
    avatar_removed: false,
  });
  
  const [angkatans, setAngkatans] = useState<Angkatan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const isEditMode = Boolean(id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [angkatanRes, userRes] = await Promise.all([
          api.get("content/angkatan"),
          api.get("system/users")
        ]);
        
        setAngkatans(angkatanRes.data.data);
        setUsers(userRes.data.data);

        if (isEditMode) {
          const memberResponse = await api.get(`/content/member/${id}`);
          const memberData = memberResponse.data.data;
          setFormData((prev) => ({
            ...prev,
            no_anggota: memberData.no_anggota,
            nama_lengkap: memberData.nama_lengkap,
            nama_lapangan: memberData.nama_lapangan,
            domisili: memberData.domisili,
            kontak: memberData.kontak,
            angkatan_id: memberData.angkatan_id,
            user_id: memberData.user_id || "",
            current_avatar_url: memberData.avatar,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "avatar" && files) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, avatar: ["Ukuran file maksimal 2MB."] }));
        setFormData((prev) => ({ ...prev, avatar: null }));
        return;
      }
      setIsUploadingAvatar(true);
      setFormData((prev) => ({ ...prev, [name]: file, avatar_removed: false }));
      setErrors((prev) => ({ ...prev, [name]: [] }));
      setTimeout(() => setIsUploadingAvatar(false), 500);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: [] }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Auto-fill name if user is selected and name is empty
    if (name === "user_id" && value) {
      const selectedUser = users.find(u => u.id === value);
      if (selectedUser && !formData.nama_lengkap) {
        setFormData(prev => ({ ...prev, nama_lengkap: selectedUser.name }));
      }
    }
    setErrors((prev) => ({ ...prev, [name]: [] }));
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatar: null, current_avatar_url: null, avatar_removed: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = new FormData();
    for (const key in formData) {
      if (key === "avatar") {
        if (formData.avatar) data.append("avatar", formData.avatar);
      } else if (key === "current_avatar_url") {
        continue;
      } else if (key === "avatar_removed" && formData.avatar_removed) {
        data.append("avatar_removed", "true");
      } else {
        const val = formData[key as keyof MemberFormData];
        if (val !== null && val !== undefined) {
          data.append(key, val as string);
        }
      }
    }

    try {
      if (isEditMode) {
        data.append("_method", "PUT");
        await api.post(`/content/member/${id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Anggota berhasil diperbarui.");
      } else {
        await api.post("/content/member", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Anggota berhasil dibuat.");
      }
      navigate("/dashboard/member");
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      if (apiError.response?.status === 422 && apiError.response.data?.errors) {
        setErrors(apiError.response.data.errors);
        toast.error("Validasi gagal. Periksa kembali isian Anda.");
      } else {
        console.error("Failed to save member:", error);
        toast.error("Gagal menyimpan anggota.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h4" color="error">{t("form.aksesDitolak")}</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>{t("form.kembaliBeranda")}</Button>
      </Box>
    );
  }

  const previewAvatar = formData.avatar
    ? URL.createObjectURL(formData.avatar)
    : formData.current_avatar_url;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
        {isEditMode ? "Ubah Detail Anggota" : "Daftarkan Anggota Baru"}
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Hubungkan profil anggota dengan akun pengguna untuk sinkronisasi otomatis.
      </Typography>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            
            <Alert severity="info">
              Menghubungkan anggota ke <b>akun pengguna</b> akan menyinkronkan nama dan avatar saat pengguna memperbarui profil.
            </Alert>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>{t("form.hubungkanAkun")}</FormLabel>
                <TextField
                  select
                  fullWidth
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleSelectChange}
                  error={!!errors.user_id}
                  helperText={errors.user_id ? errors.user_id[0] : "Pilih akun login pemilik profil ini"}
                >
                  <MenuItem value=""><em>Tidak ada (tanpa akses login)</em></MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>No. Anggota</FormLabel>
                <TextField
                  fullWidth
                  name="no_anggota"
                  placeholder="contoh: P.XVI.002.099.KH"
                  value={formData.no_anggota}
                  onChange={handleChange}
                  error={!!errors.no_anggota}
                  helperText={errors.no_anggota ? errors.no_anggota[0] : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>{t("profile.namaLengkap")}</FormLabel>
                <TextField
                  fullWidth
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  error={!!errors.nama_lengkap}
                  helperText={errors.nama_lengkap ? errors.nama_lengkap[0] : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>{t("profile.lapangan")}</FormLabel>
                <TextField
                  fullWidth
                  name="nama_lapangan"
                  value={formData.nama_lapangan}
                  onChange={handleChange}
                  error={!!errors.nama_lapangan}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>Angkatan</FormLabel>
                <TextField
                  select
                  fullWidth
                  name="angkatan_id"
                  value={formData.angkatan_id}
                  onChange={handleSelectChange}
                  error={!!errors.angkatan_id}
                >
                  {angkatans.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.nama_angkatan} ({a.year})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>{t("profile.domisili")}</FormLabel>
                <TextField
                  fullWidth
                  name="domisili"
                  value={formData.domisili}
                  onChange={handleChange}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>{t("form.kontak")}</FormLabel>
                <TextField
                  fullWidth
                  name="kontak"
                  value={formData.kontak}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Divider />

            <Box>
              <FormLabel sx={{ mb: 2, display: "block", fontWeight: "bold" }}>{t("form.fotoProfil")}</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar 
                  src={previewAvatar || ""} 
                  sx={{ width: 100, height: 100, border: '1px solid', borderColor: 'grey.300' }}
                />
                <Box>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<FontAwesomeIcon icon={faPlus} />}
                  >
                    Unggah Foto Baru
                    <input type="file" hidden accept="image/*" name="avatar" onChange={handleChange} />
                  </Button>
                  {previewAvatar && (
                    <Button color="error" sx={{ ml: 2 }} onClick={handleRemoveAvatar}>{t('crud.hapus')}</Button>
                  )}
                  <Typography variant="caption" sx={{ display: "block", mt: 1, color: 'text.secondary' }}>
                    JPG, PNG, atau GIF. Maksimal 2MB.
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 2 }}>
              <Button variant="text" onClick={() => navigate("/dashboard/member")}>{t('crud.batal')}</Button>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting || isUploadingAvatar}
                sx={{ px: 4, borderRadius: 2 }}
              >
                {submitting ? <CircularProgress size={24} /> : isEditMode ? "Perbarui Profil" : "Daftarkan Anggota"}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default MemberFormPage;

import { useTranslation } from "react-i18next";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Alert,
  Grid,
  Avatar,
  Stack,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/api";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { User } from "../../types/models";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { FieldLabel, SectionCard } from "../../components/dashboard/SectionCard";

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

  // Object URL for the newly picked photo: created once per file and revoked when replaced/unmounted.
  const avatarObjectUrl = useMemo(
    () => (formData.avatar ? URL.createObjectURL(formData.avatar) : null),
    [formData.avatar],
  );
  useEffect(() => () => {
    if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
  }, [avatarObjectUrl]);

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
        <Typography component="h1" sx={{ fontSize: 20, fontWeight: 600, color: "text.primary" }}>{t("form.aksesDitolak")}</Typography>
        <Button sx={{ mt: 2.5 }} variant="contained" onClick={() => navigate("/")}>{t("form.kembaliBeranda")}</Button>
      </Box>
    );
  }

  const previewAvatar = avatarObjectUrl ?? formData.current_avatar_url;

  return (
    <Stack spacing={3}>
      <PageHeader
        title={isEditMode ? "Ubah Detail Anggota" : "Daftarkan Anggota Baru"}
        description="Hubungkan profil anggota dengan akun pengguna untuk sinkronisasi otomatis."
      />

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <SectionCard
            title="Akun pengguna"
            description="Akun login yang terhubung dengan profil anggota ini."
          >
            <Stack spacing={2.5}>
              <Alert severity="info" variant="outlined" sx={{ fontSize: 14 }}>
                Menghubungkan anggota ke <b>akun pengguna</b> akan menyinkronkan nama dan avatar saat pengguna memperbarui profil.
              </Alert>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel id="member-user_id-label">{t("form.hubungkanAkun")}</FieldLabel>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    id="member-user_id"
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleSelectChange}
                    error={!!errors.user_id}
                    helperText={errors.user_id ? errors.user_id[0] : "Pilih akun login pemilik profil ini"}
                    slotProps={{ select: { labelId: "member-user_id-label", displayEmpty: true } }}
                  >
                    <MenuItem value=""><em>Tidak ada (tanpa akses login)</em></MenuItem>
                    {users.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Stack>
          </SectionCard>

          <SectionCard title="Data anggota" description="Identitas anggota dan angkatan.">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel htmlFor="member-no_anggota">No. Anggota</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  id="member-no_anggota"
                  name="no_anggota"
                  placeholder="contoh: P.XVI.002.099.KH"
                  value={formData.no_anggota}
                  onChange={handleChange}
                  error={!!errors.no_anggota}
                  helperText={errors.no_anggota ? errors.no_anggota[0] : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel id="member-angkatan_id-label">Angkatan</FieldLabel>
                <TextField
                  select
                  fullWidth
                  size="small"
                  id="member-angkatan_id"
                  name="angkatan_id"
                  value={formData.angkatan_id}
                  onChange={handleSelectChange}
                  error={!!errors.angkatan_id}
                  helperText={errors.angkatan_id ? errors.angkatan_id[0] : ""}
                  slotProps={{
                    select: {
                      labelId: "member-angkatan_id-label",
                      displayEmpty: true,
                      renderValue: (value) => {
                        const selected = angkatans.find((a) => a.id === value);
                        return selected ? `${selected.nama_angkatan} (${selected.year})` : (
                          <Box component="span" sx={{ color: "text.disabled" }}>Pilih angkatan</Box>
                        );
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled>Pilih angkatan</MenuItem>
                  {angkatans.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.nama_angkatan} ({a.year})
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel htmlFor="member-nama_lengkap">{t("profile.namaLengkap")}</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  id="member-nama_lengkap"
                  name="nama_lengkap"
                  value={formData.nama_lengkap}
                  onChange={handleChange}
                  error={!!errors.nama_lengkap}
                  helperText={errors.nama_lengkap ? errors.nama_lengkap[0] : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel htmlFor="member-nama_lapangan">{t("profile.lapangan")}</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  id="member-nama_lapangan"
                  name="nama_lapangan"
                  value={formData.nama_lapangan}
                  onChange={handleChange}
                  error={!!errors.nama_lapangan}
                  helperText={errors.nama_lapangan ? errors.nama_lapangan[0] : ""}
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard title="Kontak" description="Domisili dan kontak yang dapat dihubungi.">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel htmlFor="member-domisili">{t("profile.domisili")}</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  id="member-domisili"
                  name="domisili"
                  value={formData.domisili}
                  onChange={handleChange}
                  error={!!errors.domisili}
                  helperText={errors.domisili ? errors.domisili[0] : ""}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FieldLabel htmlFor="member-kontak">{t("form.kontak")}</FieldLabel>
                <TextField
                  fullWidth
                  size="small"
                  id="member-kontak"
                  name="kontak"
                  value={formData.kontak}
                  onChange={handleChange}
                  error={!!errors.kontak}
                  helperText={errors.kontak ? errors.kontak[0] : ""}
                />
              </Grid>
            </Grid>
          </SectionCard>

          <SectionCard
            title={t("form.fotoProfil")}
            description="JPG, PNG, atau GIF. Maksimal 2MB."
            footer={
              <>
                <Button variant="outlined" color="inherit" onClick={() => navigate("/dashboard/member")}>
                  {t("crud.batal")}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || isUploadingAvatar}
                  startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : undefined}
                >
                  {isEditMode ? "Perbarui Profil" : "Daftarkan Anggota"}
                </Button>
              </>
            }
          >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} sx={{ alignItems: { xs: "flex-start", sm: "center" } }}>
              <Avatar
                src={previewAvatar || ""}
                alt=""
                sx={{ width: 80, height: 80, border: "1px solid", borderColor: "divider", bgcolor: "action.hover", color: "text.secondary" }}
              />
              <Box>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    component="label"
                    startIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />}
                  >
                    Unggah Foto Baru
                    <input type="file" hidden accept="image/*" name="avatar" onChange={handleChange} />
                  </Button>
                  {previewAvatar && (
                    <Button color="error" onClick={handleRemoveAvatar}>{t("crud.hapus")}</Button>
                  )}
                </Stack>
                {errors.avatar && errors.avatar.length > 0 ? (
                  <Typography role="alert" sx={{ mt: 1, fontSize: 13, color: "error.main" }}>
                    {errors.avatar[0]}
                  </Typography>
                ) : null}
              </Box>
            </Stack>
          </SectionCard>
        </Stack>
      </Box>
    </Stack>
  );
};

export default MemberFormPage;

import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Avatar,
  Grid,
  TextField,
  Button,
  Stack,
  IconButton,
  Paper,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faLock,
  faEye,
  faEyeSlash,
} from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faFacebook,
  faLinkedin,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { toast } from "react-toastify";
import api from "../../api/api";
import type { User } from "../../types/models";
import { PageHeader, StatusPill, CountBadge } from "../../components/dashboard/PageHeader";
import { SectionCard, FieldLabel } from "../../components/dashboard/SectionCard";
import { dashboardCardSx } from "../../components/dashboard/dashboardStyles";

type ProfileMemberData = {
  no_anggota?: string | null;
  nama_lapangan?: string | null;
  domisili?: string | null;
  kontak?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
  youtube?: string | null;
  angkatan?: {
    nama_angkatan?: string | null;
  } | null;
};

type ProfileUserData = User & {
  member?: ProfileMemberData | null;
};

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    password: "",
    password_confirmation: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStep, setPasswordStep] = useState(1);

  const verifyOldPassword = async () => {
    setPasswordLoading(true);
    try {
      await api.post(`/auth/verify-password`, { old_password: passwordData.old_password });
      setPasswordStep(2);
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Password lama salah.");
    } finally {
      setPasswordLoading(false);
    }
  };


  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    if (passwordData.password !== passwordData.password_confirmation) {
      toast.error("Konfirmasi password baru tidak cocok.");
      return;
    }
    setPasswordLoading(true);
    try {
      await api.post(`/auth/change-password`, passwordData);
      toast.success("Password berhasil diubah!");
      closePasswordModal();
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Gagal mengubah password.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [userData, setUserData] = useState<ProfileUserData | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
        no_anggota: "",
    nama_lapangan: "",
    domisili: "",
    kontak: "",
    instagram: "",
    facebook: "",
    linkedin: "",
    tiktok: "",
    youtube: "",
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>("/images/default-avatar.webp");

  useEffect(() => {
    const fetchFullProfile = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/system/users/${user.id}`);
        const data = response.data.data as ProfileUserData;
        setUserData(data);
        setFormData({
          name: data.name || "",
          email: data.email || user?.email || "",
                    no_anggota: data.member?.no_anggota || "",
          nama_lapangan: data.member?.nama_lapangan || "",
          domisili: data.member?.domisili || "",
          kontak: data.member?.kontak || "",
          instagram: data.member?.instagram || "",
          facebook: data.member?.facebook || "",
          linkedin: data.member?.linkedin || "",
          tiktok: data.member?.tiktok || "",
          youtube: data.member?.youtube || "",
        });
        setAvatarPreview(data.avatar || "/images/default-avatar.webp");
      } catch (error) {
        console.error("Fetch profile error:", error);
        toast.error("Gagal memuat detail profil.");
      } finally {
        setFetching(false);
      }
    };

    fetchFullProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB.");
        return;
      }
      setAvatarFile(file);
      const nextUrl = URL.createObjectURL(file);
      // Free the previous picked-image URL (server URLs are not blob: and are left alone).
      setAvatarPreview((previous) => {
        if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
        return nextUrl;
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = new FormData();
      data.append("_method", "PUT");
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("role", userData?.role || "member");
      
      // Member & Social fields
      data.append("no_anggota", formData.no_anggota);
      data.append("nama_lapangan", formData.nama_lapangan);
      data.append("domisili", formData.domisili);
      data.append("kontak", formData.kontak);
      data.append("instagram", formData.instagram);
      data.append("facebook", formData.facebook);
      data.append("linkedin", formData.linkedin);
      data.append("tiktok", formData.tiktok);
      data.append("youtube", formData.youtube);
      
            
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      const response = await api.post(`/system/users/${user?.id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data) {
        toast.success("Profil berhasil diperbarui.");
        
        setUserData(response.data.data);
      }
    } catch (error: unknown) {
      console.error("Update profile error:", error);
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Gagal memperbarui profil.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const roleLabel: Record<string, string> = {
    admin: "Administrator",
    officer: "Pengurus",
    member: "Anggota",
  };
  const currentRole = userData?.role ?? "member";
  const currentRoleLabel = roleLabel[currentRole] ?? currentRole;

  const isMember = userData?.role !== "admin";

  const closePasswordModal = () => {
    setOpenPasswordModal(false);
    setPasswordStep(1);
    setPasswordData({ old_password: "", password: "", password_confirmation: "" });
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const saveButton = (
    <Button
      type="submit"
      form="profile-form"
      variant="contained"
      disabled={loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
    >
      Simpan perubahan
    </Button>
  );

  const textInput = (name: keyof typeof formData, extra?: Partial<React.ComponentProps<typeof TextField>>) => (
    <TextField
      id={`profile-${name}`}
      fullWidth
      size="small"
      name={name}
      value={formData[name]}
      onChange={handleChange}
      {...extra}
    />
  );

  const socialFields: { name: keyof typeof formData; label: string; icon: typeof faInstagram; placeholder: string }[] = [
    { name: "instagram", label: t("profile.instagram"), icon: faInstagram, placeholder: "@username" },
    { name: "facebook", label: t("profile.facebook"), icon: faFacebook, placeholder: "tautan profil" },
    { name: "linkedin", label: t("profile.linkedin"), icon: faLinkedin, placeholder: "tautan profil" },
    { name: "tiktok", label: t("profile.tiktok"), icon: faTiktok, placeholder: "@username" },
    { name: "youtube", label: t("profile.youtube"), icon: faYoutube, placeholder: "tautan kanal" },
  ];

  const summaryRows: { label: React.ReactNode; value: React.ReactNode }[] = [
    { label: t("profile.alamatEmail"), value: formData.email || "-" },
    ...(isMember
      ? [
          { label: "No. anggota", value: formData.no_anggota || "Belum diisi" },
          { label: t("profile.namaLapangan"), value: formData.nama_lapangan || "Belum diisi" },
        ]
      : []),
    { label: t("profile.statusAkun"), value: <StatusPill tone="success">{t("profile.aktif")}</StatusPill> },
  ];

  const passwordField = (
    name: "old_password" | "password" | "password_confirmation",
    label: string,
    show: boolean,
    toggle: () => void,
  ) => (
    <Box>
      <FieldLabel htmlFor={`profile-${name}`}>{label}</FieldLabel>
      <TextField
        id={`profile-${name}`}
        fullWidth
        size="small"
        name={name}
        type={show ? "text" : "password"}
        value={passwordData[name]}
        onChange={handlePasswordChange}
        placeholder="••••••••"
        slotProps={{ input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={toggle}
                edge="end"
                size="small"
                aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
                sx={{ color: "text.secondary" }}
              >
                <FontAwesomeIcon icon={show ? faEyeSlash : faEye} style={{ fontSize: 14 }} />
              </IconButton>
            </InputAdornment>
          ),
        } }}
      />
    </Box>
  );

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Profil saya"
        description="Kelola informasi pribadi dan profil keanggotaan Anda."
      />

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        {/* Summary */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={0} sx={[dashboardCardSx, { overflow: "hidden" }]}>
            <Stack spacing={1.5} sx={{ p: 3, alignItems: "center", textAlign: "center" }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  src={avatarPreview || "/images/default-avatar.webp"}
                  alt={formData.name}
                  sx={{ width: 88, height: 88, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <IconButton
                  onClick={handleAvatarClick}
                  aria-label="Ubah foto profil"
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 30,
                    height: 30,
                    bgcolor: "background.paper",
                    color: "text.secondary",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": { bgcolor: "background.paper", color: "primary.main", borderColor: "primary.main" },
                  }}
                >
                  <FontAwesomeIcon icon={faCamera} style={{ fontSize: 12 }} />
                </IconButton>
              </Box>
              <Box sx={{ minWidth: 0, maxWidth: "100%" }}>
                <Typography sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.35, overflowWrap: "anywhere" }}>
                  {formData.name || "-"}
                </Typography>
                <Typography sx={{ mt: 0.25, fontSize: 13, color: "text.secondary", overflowWrap: "anywhere" }}>
                  {formData.email}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "center", rowGap: 1 }}>
                <StatusPill tone={currentRole === "admin" ? "warning" : currentRole === "officer" ? "info" : "success"}>Akses {currentRoleLabel}</StatusPill>
                {isMember && userData?.member?.angkatan?.nama_angkatan && (
                  <CountBadge>{userData.member.angkatan.nama_angkatan}</CountBadge>
                )}
              </Stack>
              <Box>
                <Button variant="text" size="small" onClick={handleAvatarClick} startIcon={<FontAwesomeIcon icon={faCamera} style={{ fontSize: 12 }} />}>
                  Ubah foto
                </Button>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Maksimal 2MB.</Typography>
              </Box>
            </Stack>
            <Box component="dl" sx={{ m: 0, borderTop: "1px solid", borderColor: "divider" }}>
              {summaryRows.map((row, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  sx={{
                    px: 3,
                    py: 1.5,
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTop: index === 0 ? "none" : "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography component="dt" sx={{ fontSize: 13, color: "text.secondary", flexShrink: 0 }}>
                    {row.label}
                  </Typography>
                  <Typography component="dd" sx={{ m: 0, fontSize: 14, fontWeight: 500, textAlign: "right", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Settings sections */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            <Box component="form" id="profile-form" onSubmit={handleUpdateProfile}>
              <Stack spacing={3}>
                <SectionCard
                  title="Informasi pribadi"
                  description={isMember ? "Nama, kontak, dan data keanggotaan Anda." : "Nama dan alamat email akun Anda."}
                  footer={isMember ? undefined : saveButton}
                >
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FieldLabel htmlFor="profile-name">{t("profile.namaLengkap")}</FieldLabel>
                      {textInput("name")}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FieldLabel htmlFor="profile-email" hint="Email tidak dapat diubah.">{t("profile.email")}</FieldLabel>
                      {textInput("email", { type: "email", disabled: true })}
                    </Grid>
                    {isMember && (
                      <>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FieldLabel htmlFor="profile-no_anggota">No. anggota</FieldLabel>
                          {textInput("no_anggota", { placeholder: "P.XXX.XXX.XXX" })}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FieldLabel htmlFor="profile-nama_lapangan">{t("profile.lapangan")}</FieldLabel>
                          {textInput("nama_lapangan")}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FieldLabel htmlFor="profile-domisili">{t("profile.domisili")}</FieldLabel>
                          {textInput("domisili")}
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <FieldLabel htmlFor="profile-kontak">Kontak / WhatsApp</FieldLabel>
                          {textInput("kontak")}
                        </Grid>
                      </>
                    )}
                  </Grid>
                </SectionCard>

                {isMember && (
                  <SectionCard
                    title="Media sosial"
                    description="Tautan profil yang dapat ditampilkan pada data keanggotaan Anda."
                    footer={saveButton}
                  >
                    <Grid container spacing={2.5}>
                      {socialFields.map((field) => (
                        <Grid key={field.name} size={{ xs: 12, md: 6 }}>
                          <FieldLabel htmlFor={`profile-${field.name}`}>{field.label}</FieldLabel>
                          {textInput(field.name, {
                            placeholder: field.placeholder,
                            slotProps: { input: {
                              startAdornment: (
                                <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                                  <FontAwesomeIcon icon={field.icon} style={{ fontSize: 15 }} />
                                </InputAdornment>
                              ),
                            } },
                          })}
                        </Grid>
                      ))}
                    </Grid>
                  </SectionCard>
                )}
              </Stack>
            </Box>

            <SectionCard title="Keamanan" description="Kelola password yang digunakan untuk masuk ke akun Anda.">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
              >
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>Ubah password</Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    Anda akan diminta memasukkan password saat ini terlebih dahulu.
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => { setOpenPasswordModal(true); setPasswordStep(1); }}
                  startIcon={<FontAwesomeIcon icon={faLock} style={{ fontSize: 13 }} />}
                  sx={{ flexShrink: 0, borderColor: "divider" }}
                >
                  Ganti password
                </Button>
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>

      <Dialog
        open={openPasswordModal}
        onClose={closePasswordModal}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontSize: 18, fontWeight: 600, pb: 1 }}>
          {passwordStep === 1 ? "Validasi keamanan" : "Buat password baru"}
        </DialogTitle>
        <DialogContent>
          {passwordStep === 1 ? (
            <Stack spacing={2}>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                Untuk alasan keamanan, silakan masukkan password Anda saat ini sebelum menggantinya.
              </Typography>
              {passwordField("old_password", "Password saat ini", showOldPassword, () => setShowOldPassword(!showOldPassword))}
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 0.5 }}>
              {passwordField("password", "Password baru", showNewPassword, () => setShowNewPassword(!showNewPassword))}
              {passwordField("password_confirmation", "Konfirmasi password baru", showConfirmPassword, () => setShowConfirmPassword(!showConfirmPassword))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1, gap: 1 }}>
          <Button onClick={closePasswordModal} color="inherit">Batal</Button>
          {passwordStep === 1 ? (
            <Button
              onClick={verifyOldPassword}
              variant="contained"
              disabled={passwordLoading || !passwordData.old_password}
              startIcon={passwordLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Lanjut
            </Button>
          ) : (
            <Button
              onClick={submitPasswordChange}
              variant="contained"
              disabled={passwordLoading || !passwordData.password || !passwordData.password_confirmation}
              startIcon={passwordLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Simpan password
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

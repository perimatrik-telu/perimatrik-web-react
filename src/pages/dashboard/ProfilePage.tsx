import { useTranslation } from "react-i18next";
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Card,
  Avatar,
  Grid,
  TextField,
  Button,
  Divider,
  Stack,
  IconButton,
  Paper,
  InputAdornment,
  CircularProgress,
  Chip,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faEnvelope, 
  faShieldHalved, 
  faCamera, 
  faLock,
  faEye,
  faEyeSlash,
  faCircleCheck,
  faIdCard,
  faMapMarkerAlt,
  faPhone,
  faMountain,
  faShareNodes,
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
  
  // Perimatrik Theme Colors
  const primaryOrange = '#e67817';
  const secondaryOrange = '#ff9800';
  
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
      setOpenPasswordModal(false); setPasswordStep(1); setPasswordData({ old_password: "", password: "", password_confirmation: "" });;
      setPasswordData({ old_password: "", password: "", password_confirmation: "" });
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
      setAvatarPreview(URL.createObjectURL(file));
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

  return (
    <Box sx={{ pb: 5 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: "800", letterSpacing: "-0.5px" }}>
          Profil Saya
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Kelola informasi pribadi dan profil keanggotaan Anda.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* LEFT SIDE: Identity Card */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card 
            sx={{ 
              borderRadius: 5, 
              boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <Box 
              sx={{ 
                height: 100, 
                background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
              }} 
            />
            
            <Box sx={{ px: 3, pb: 4, mt: -6, textAlign: "center" }}>
              <Box sx={{ position: "relative", display: "inline-block", mb: 2 }}>
                <Avatar
                  src={avatarPreview || "/images/default-avatar.webp"}
                  sx={{ 
                    width: 110, 
                    height: 110, 
                    border: "5px solid", borderColor: "background.paper", 
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                    bgcolor: "background.paper"
                  }}
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
                  sx={{
                    position: "absolute",
                    bottom: 5,
                    right: 5,
                    bgcolor: "primary.main",
                    color: "#ffffff",
                    border: "3px solid", borderColor: "background.paper",
                    "&:hover": { bgcolor: "primary.dark" },
                    width: 32,
                    height: 32
                  }}
                >
                  <FontAwesomeIcon icon={faCamera} size="xs" />
                </IconButton>
              </Box>

              <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
                {formData.name}
              </Typography>
              
              <Box 
                sx={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: 1,
                  px: 2, 
                  py: 0.5, 
                  borderRadius: 10, 
                  bgcolor: `${primaryOrange}15`,
                  color: primaryOrange,
                  mb: 2
                }}
              >
                <FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: '12px' }} />
                <Typography variant="caption" sx={{ fontWeight: "800", textTransform: "uppercase" }}>
                  Akses {currentRoleLabel}
                </Typography>
              </Box>

              {userData?.role !== 'admin' && userData?.member?.angkatan && (
                <Box sx={{ mb: 3 }}>
                  <Chip 
                    label={userData.member.angkatan.nama_angkatan} 
                    variant="outlined" 
                    size="small" 
                    sx={{ fontWeight: 'bold' }} 
                  />
                </Box>
              )}

              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              <Stack spacing={2.5}>
                <Box sx={{ display: "flex", alignItems: "center", textAlign: "left", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "background.default", color: "text.secondary", width: 40, height: 40 }}>
                    <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '16px' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>{t("profile.alamatEmail")}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: "600" }}>{formData.email}</Typography>
                  </Box>
                </Box>

                {userData?.role !== 'admin' && (
                  <>
                    <Box sx={{ display: "flex", alignItems: "center", textAlign: "left", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "background.default", color: "text.secondary", width: 40, height: 40 }}>
                        <FontAwesomeIcon icon={faIdCard} style={{ fontSize: '16px' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>NO. ANGGOTA</Typography>
                        <Typography variant="body2" sx={{ fontWeight: "600" }}>{formData.no_anggota || "Belum Diisi"}</Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center", textAlign: "left", gap: 2 }}>
                      <Avatar sx={{ bgcolor: "background.default", color: "text.secondary", width: 40, height: 40 }}>
                        <FontAwesomeIcon icon={faMountain} style={{ fontSize: '16px' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>{t("profile.namaLapangan")}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: "600" }}>{formData.nama_lapangan || "Belum Diisi"}</Typography>
                      </Box>
                    </Box>
                  </>
                )}
                
                <Box sx={{ display: "flex", alignItems: "center", textAlign: "left", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "background.default", color: "text.secondary", width: 40, height: 40 }}>
                    <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: '16px' }} />
                  </Avatar>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "bold" }}>{t("profile.statusAkun")}</Typography>
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: "600" }}>{t("profile.aktif")}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Grid>

        {/* RIGHT SIDE: Form Settings */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper 
            sx={{ 
              borderRadius: 5, 
              boxShadow: "0 20px 40px rgba(0,0,0,0.04)", 
              overflow: "hidden",
              border: "1px solid",
              borderColor: "grey.100"
            }}
          >
            <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "background.default" }}>
              <Avatar sx={{ bgcolor: primaryOrange, width: 32, height: 32 }}>
                <FontAwesomeIcon icon={faUser} style={{ fontSize: '14px' }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: "800" }}>{t("profile.detail")}</Typography>
            </Box>
            
            <Box component="form" onSubmit={handleUpdateProfile} sx={{ p: 4 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.namaLengkap")}</Typography>
                  <TextField
                    fullWidth
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    slotProps={{ input: {
                      startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faUser} style={{ opacity: 0.4 }} /></InputAdornment>),
                      sx: { borderRadius: 3 }
                    } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.email")}</Typography>
                  <TextField
                    fullWidth
                    name="email"
                    type="email"
                    value={formData.email}
                    disabled
                    onChange={handleChange}
                    slotProps={{ input: {
                      startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faEnvelope} style={{ opacity: 0.4 }} /></InputAdornment>),
                      sx: { borderRadius: 3 }
                    } }}
                  />
                </Grid>

                {userData?.role !== 'admin' && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>No. Anggota</Typography>
                      <TextField
                        fullWidth
                        name="no_anggota"
                        value={formData.no_anggota}
                        onChange={handleChange}
                        placeholder="P.XXX.XXX.XXX"
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faIdCard} style={{ opacity: 0.4 }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.lapangan")}</Typography>
                      <TextField
                        fullWidth
                        name="nama_lapangan"
                        value={formData.nama_lapangan}
                        onChange={handleChange}
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faMountain} style={{ opacity: 0.4 }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.domisili")}</Typography>
                      <TextField
                        fullWidth
                        name="domisili"
                        value={formData.domisili}
                        onChange={handleChange}
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faMapMarkerAlt} style={{ opacity: 0.4 }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>Kontak / WhatsApp</Typography>
                      <TextField
                        fullWidth
                        name="kontak"
                        value={formData.kontak}
                        onChange={handleChange}
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faPhone} style={{ opacity: 0.4 }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>

                    <Grid size={12}>
                      <Box sx={{ mt: 3, mb: 1 }}>
                        <Divider textAlign="left">
                          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                            <FontAwesomeIcon icon={faShareNodes} style={{ color: primaryOrange, fontSize: '14px' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "800", letterSpacing: 1.5 }}>
                              TAUTAN MEDIA SOSIAL
                            </Typography>
                          </Stack>
                        </Divider>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.instagram")}</Typography>
                      <TextField
                        fullWidth
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleChange}
                        placeholder="@username"
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faInstagram} style={{ color: '#E4405F' }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.facebook")}</Typography>
                      <TextField
                        fullWidth
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleChange}
                        placeholder="tautan profil"
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faFacebook} style={{ color: '#1877F2' }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.linkedin")}</Typography>
                      <TextField
                        fullWidth
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="tautan profil"
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faLinkedin} style={{ color: '#0077B5' }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.tiktok")}</Typography>
                      <TextField
                        fullWidth
                        name="tiktok"
                        value={formData.tiktok}
                        onChange={handleChange}
                        placeholder="@username"
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faTiktok} style={{ color: '#000000' }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>{t("profile.youtube")}</Typography>
                      <TextField
                        fullWidth
                        name="youtube"
                        value={formData.youtube}
                        onChange={handleChange}
                        placeholder="tautan kanal"
                        slotProps={{ input: {
                          startAdornment: (<InputAdornment position="start"><FontAwesomeIcon icon={faYoutube} style={{ color: '#FF0000' }} /></InputAdornment>),
                          sx: { borderRadius: 3 }
                        } }}
                      />
                    </Grid>
                  </>
                )}

                <Grid size={12}>
                  <Box sx={{ mt: 3, mb: 1 }}>
                    <Divider textAlign="left">
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <FontAwesomeIcon icon={faLock} style={{ color: primaryOrange, fontSize: '14px' }} />
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: "800", letterSpacing: 1.5 }}>
                          KEAMANAN & AUTENTIKASI
                        </Typography>
                      </Stack>
                    </Divider>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>Ubah Password</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => { setOpenPasswordModal(true); setPasswordStep(1); }}
                    startIcon={<FontAwesomeIcon icon={faLock} />}
                    sx={{ borderRadius: 3, py: 1.5, px: 3, fontWeight: "800", textTransform: "none" }}
                  >
                    Ganti Password Sekarang
                  </Button>
                </Grid>

                <Grid size={12}>
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        px: 8,
                        py: 1.8,
                        borderRadius: 3,
                        fontWeight: "900",
                        textTransform: "none",
                        fontSize: "1rem",
                        background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
                        boxShadow: `0 10px 25px ${primaryOrange}40`,
                        transition: "all 0.3s ease",
                        "&:hover": { transform: "translateY(-3px)", boxShadow: `0 15px 35px ${primaryOrange}50` }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Simpan Perubahan"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>
      </Grid>

            <Dialog open={openPasswordModal} onClose={() => { setOpenPasswordModal(false); setPasswordStep(1); setPasswordData({ old_password: "", password: "", password_confirmation: "" }); ; setShowOldPassword(false); setShowNewPassword(false); setShowConfirmPassword(false); }} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{passwordStep === 1 ? 'Validasi Keamanan' : 'Buat Password Baru'}</DialogTitle>
        <DialogContent dividers>
          {passwordStep === 1 ? (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Untuk alasan keamanan, silakan masukkan password Anda saat ini sebelum menggantinya.
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>Password Saat Ini</Typography>
                <TextField
                  fullWidth
                  name="old_password"
                  type={showOldPassword ? "text" : "password"}
                  value={passwordData.old_password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  slotProps={{ input: {
                    sx: { borderRadius: 3 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowOldPassword(!showOldPassword)} edge="end">
                          <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} style={{ fontSize: '16px', opacity: 0.6 }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  } }}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>Password Baru</Typography>
                <TextField
                  fullWidth
                  name="password"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  slotProps={{ input: {
                    sx: { borderRadius: 3 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                          <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} style={{ fontSize: '16px', opacity: 0.6 }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  } }}
                />
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" sx={{ fontWeight: "800", mb: 1 }}>Konfirmasi Password Baru</Typography>
                <TextField
                  fullWidth
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.password_confirmation}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                  slotProps={{ input: {
                    sx: { borderRadius: 3 },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                          <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} style={{ fontSize: '16px', opacity: 0.6 }} />
                        </IconButton>
                      </InputAdornment>
                    )
                  } }}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setOpenPasswordModal(false); setPasswordStep(1); setPasswordData({ old_password: "", password: "", password_confirmation: "" }); ; setShowOldPassword(false); setShowNewPassword(false); setShowConfirmPassword(false); }} color="inherit" sx={{ fontWeight: 800 }}>Batal</Button>
          {passwordStep === 1 ? (
            <Button 
              onClick={verifyOldPassword} 
              variant="contained" 
              disabled={passwordLoading || !passwordData.old_password}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              {passwordLoading ? <CircularProgress size={24} color="inherit" /> : "Lanjut"}
            </Button>
          ) : (
            <Button 
              onClick={submitPasswordChange} 
              variant="contained" 
              disabled={passwordLoading || !passwordData.password || !passwordData.password_confirmation}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              {passwordLoading ? <CircularProgress size={24} color="inherit" /> : "Simpan Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};
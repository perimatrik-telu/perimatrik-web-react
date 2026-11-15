import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Stack,
  InputAdornment,
  Grid,
  Divider,
  Avatar,
  Fade,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt, 
  faSave,
  faAddressCard,
  faGlobe,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../../api/api";

type ApiErrorResponse = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export const ContactSettingPage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    contact_email: "",
    contact_phone: "",
    contact_address: "",
    contact_maps: "",
    allow_member_registration: true,
  });

  const primaryOrange = '#e67817';
  const secondaryOrange = '#ff9800';

  useEffect(() => {
    document.title = "Pengaturan Kontak - Dasbor";
    const fetchContact = async () => {
      try {
        const response = await api.get("/system/settings/contact");
        setFormData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
        toast.error("Gagal memuat informasi kontak.");
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/system/settings/contact", formData);
      toast.success("Informasi kontak berhasil diperbarui.");
    } catch (error: unknown) {
      console.error("Update error:", error);
      const apiError = error as ApiErrorResponse;
      toast.error(apiError.response?.data?.message || "Gagal memperbarui pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ pb: 5 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="800" letterSpacing="-0.5px">
            Konfigurasi Website
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola informasi kontak publik dan detail organisasi.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* LEFT SIDE: Preview Card */}
          <Grid item xs={12} lg={4}>
            <Paper 
              sx={{ 
                p: 4, 
                borderRadius: 5, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
                color: 'white',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'absolute', top: -20, right: -20, fontSize: '10rem', opacity: 0.1, color: 'white' }}>
                <FontAwesomeIcon icon={faGlobe} />
              </Box>
              
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography variant="h6" fontWeight="800" sx={{ mb: 3, letterSpacing: 1 }}>
                  PRATINJAU LANGSUNG
                </Typography>
                
                <Stack spacing={4}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1.5 }}>{t("setting.emailResmi")}</Typography>
                    <Typography variant="body1" fontWeight="600">{formData.contact_email || "Belum diisi"}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1.5 }}>TELEPON / WHATSAPP</Typography>
                    <Typography variant="body1" fontWeight="600">{formData.contact_phone || "Belum diisi"}</Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1.5 }}>{t("setting.alamatSekretariat")}</Typography>
                    <Typography variant="body1" fontWeight="600" sx={{ lineHeight: 1.6 }}>{formData.contact_address || "Belum diisi"}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 'bold', letterSpacing: 1.5, mb: 1, display: 'block' }}>{t("setting.pratinjauPeta")}</Typography>
                    {formData.contact_maps ? (
                      <Box sx={{ borderRadius: 2, overflow: 'hidden', height: 120, border: '2px solid rgba(255,255,255,0.2)' }}>
                        <iframe
                          src={formData.contact_maps}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      </Box>
                    ) : (
                      <Box sx={{ height: 120, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="caption">{t("setting.urlBelum")}</Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>

                <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontStyle: 'italic' }}>
                    "Perubahan akan langsung tampil di footer dan bagian kontak website publik."
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT SIDE: Form Settings */}
          <Grid item xs={12} lg={8}>
            <Paper 
              sx={{ 
                borderRadius: 5, 
                boxShadow: "0 20px 40px rgba(0,0,0,0.04)", 
                overflow: "hidden",
                border: "1px solid",
                borderColor: "grey.100"
              }}
            >
              <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2, bgcolor: "grey.50" }}>
                <Avatar sx={{ bgcolor: primaryOrange, width: 32, height: 32 }}>
                  <FontAwesomeIcon icon={faAddressCard} style={{ fontSize: '14px' }} />
                </Avatar>
                <Typography variant="h6" fontWeight="800">{t("setting.detailKontak")}</Typography>
              </Box>
              
              <Box component="form" onSubmit={handleSave} sx={{ p: 4 }}>
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, ml: 0.5 }}>{t("setting.emailLabel")}</Typography>
                    <TextField
                      fullWidth
                      name="contact_email"
                      value={formData.contact_email || ""}
                      onChange={handleChange}
                      placeholder="contoh: info@perimatrik.org"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FontAwesomeIcon icon={faEnvelope} style={{ color: primaryOrange, opacity: 0.6 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, ml: 0.5 }}>{t("setting.teleponLabel")}</Typography>
                    <TextField
                      fullWidth
                      name="contact_phone"
                      value={formData.contact_phone || ""}
                      onChange={handleChange}
                      placeholder="contoh: +62 812 3456 7890"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FontAwesomeIcon icon={faPhone} style={{ color: primaryOrange, opacity: 0.6 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, ml: 0.5 }}>{t("setting.alamatLabel")}</Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      name="contact_address"
                      value={formData.contact_address || ""}
                      onChange={handleChange}
                      placeholder="Masukkan alamat lengkap..."
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start" style={{ alignSelf: 'flex-start', marginTop: '14px' }}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} style={{ color: primaryOrange, opacity: 0.6 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" fontWeight="800" sx={{ mb: 1, ml: 0.5 }}>{t("setting.mapsLabel")}</Typography>
                    <TextField
                      fullWidth
                      name="contact_maps"
                      value={formData.contact_maps || ""}
                      onChange={handleChange}
                      placeholder="Tempel URL src dari kode iframe Google Maps..."
                      helperText="Panduan: buka Google Maps > Bagikan > Sematkan peta > salin hanya URL pada atribut src='...'"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <FontAwesomeIcon icon={faMapLocationDot} style={{ color: primaryOrange, opacity: 0.6 }} />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 3 }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        borderColor: "grey.200",
                        bgcolor: formData.allow_member_registration ? "success.50" : "grey.50",
                      }}
                    >
                      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="800">
                            Registrasi Anggota Publik
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Atur apakah pengguna dapat membuat akun dari halaman login publik memakai nomor anggota dan nama anggota.
                          </Typography>
                        </Box>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(formData.allow_member_registration)}
                              onChange={handleChange}
                              name="allow_member_registration"
                              color="warning"
                            />
                          }
                          label={formData.allow_member_registration ? "Aktif" : "Nonaktif"}
                          sx={{ m: 0, '& .MuiFormControlLabel-label': { fontWeight: 700 } }}
                        />
                      </Stack>
                    </Paper>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 1, opacity: 0.6 }} />
                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saving}
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
                        {saving ? <CircularProgress size={24} color="inherit" /> : <><FontAwesomeIcon icon={faSave} style={{ marginRight: '12px' }} /> {t("setting.simpanKonfig")}</>}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

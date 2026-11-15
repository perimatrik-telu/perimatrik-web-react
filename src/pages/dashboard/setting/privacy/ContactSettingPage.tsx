import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack,
  InputAdornment,
  Grid,
  Switch,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faMapLocationDot,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../../../api/api";
import { PageHeader, StatusPill } from "../../../../components/dashboard/PageHeader";
import { SectionCard, FieldLabel } from "../../../../components/dashboard/SectionCard";

const fieldIcon = (icon: IconDefinition, multiline?: boolean) => (
  <InputAdornment position="start" sx={{ color: "text.secondary", ...(multiline && { alignSelf: "flex-start", mt: 1.25 }) }}>
    <FontAwesomeIcon icon={icon} style={{ fontSize: 14 }} />
  </InputAdornment>
);

type PreviewRowProps = { icon: IconDefinition; label: string; value?: string | null };

const PreviewRow = ({ icon, label, value }: PreviewRowProps) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
    <Box
      sx={{
        width: 32, height: 32, borderRadius: 2, flexShrink: 0, display: "grid", placeItems: "center",
        color: "text.secondary", bgcolor: "action.hover", border: "1px solid", borderColor: "divider", fontSize: 13,
      }}
    >
      <FontAwesomeIcon icon={icon} />
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 14, fontWeight: 500, lineHeight: 1.5, overflowWrap: "anywhere", whiteSpace: "pre-line",
          color: value ? "text.primary" : "text.secondary",
        }}
      >
        {value || "Belum diisi"}
      </Typography>
    </Box>
  </Stack>
);

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
    <Stack spacing={3}>
      <PageHeader
        title="Kontak & website"
        description="Kelola informasi kontak publik dan detail organisasi."
      />

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        {/* Form */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box component="form" onSubmit={handleSave}>
            <SectionCard
              title={t("setting.detailKontak")}
              description="Ditampilkan di footer dan bagian kontak website publik."
              footer={
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                >
                  {t("setting.simpanKonfig")}
                </Button>
              }
            >
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel htmlFor="contact-email">{t("setting.emailLabel")}</FieldLabel>
                  <TextField
                    id="contact-email"
                    fullWidth
                    size="small"
                    name="contact_email"
                    value={formData.contact_email || ""}
                    onChange={handleChange}
                    placeholder="contoh: info@perimatrik.org"
                    slotProps={{ input: { startAdornment: fieldIcon(faEnvelope) } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FieldLabel htmlFor="contact-phone">{t("setting.teleponLabel")}</FieldLabel>
                  <TextField
                    id="contact-phone"
                    fullWidth
                    size="small"
                    name="contact_phone"
                    value={formData.contact_phone || ""}
                    onChange={handleChange}
                    placeholder="contoh: +62 812 3456 7890"
                    slotProps={{ input: { startAdornment: fieldIcon(faPhone) } }}
                  />
                </Grid>

                <Grid size={12}>
                  <FieldLabel htmlFor="contact-address">{t("setting.alamatLabel")}</FieldLabel>
                  <TextField
                    id="contact-address"
                    fullWidth
                    size="small"
                    multiline
                    rows={3}
                    name="contact_address"
                    value={formData.contact_address || ""}
                    onChange={handleChange}
                    placeholder="Masukkan alamat lengkap..."
                    slotProps={{ input: { startAdornment: fieldIcon(faMapMarkerAlt, true) } }}
                  />
                </Grid>

                <Grid size={12}>
                  <FieldLabel
                    htmlFor="contact-maps"
                    hint="Panduan: buka Google Maps > Bagikan > Sematkan peta > salin hanya URL pada atribut src='...'"
                  >
                    {t("setting.mapsLabel")}
                  </FieldLabel>
                  <TextField
                    id="contact-maps"
                    fullWidth
                    size="small"
                    name="contact_maps"
                    value={formData.contact_maps || ""}
                    onChange={handleChange}
                    placeholder="Tempel URL src dari kode iframe Google Maps..."
                    slotProps={{ input: { startAdornment: fieldIcon(faMapLocationDot) } }}
                  />
                </Grid>

                <Grid size={12}>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 0.5 }}>
                        <Typography component="label" htmlFor="contact-allow-registration" sx={{ fontSize: 14, fontWeight: 500, cursor: "pointer" }}>
                          Registrasi anggota publik
                        </Typography>
                        <StatusPill tone={formData.allow_member_registration ? "success" : "neutral"}>
                          {formData.allow_member_registration ? "Aktif" : "Nonaktif"}
                        </StatusPill>
                      </Stack>
                      <Typography id="contact-allow-registration-desc" sx={{ mt: 0.25, fontSize: 13, color: "text.secondary" }}>
                        Atur apakah pengguna dapat membuat akun dari halaman login publik memakai nomor anggota dan nama anggota.
                      </Typography>
                    </Box>
                    <Switch
                      id="contact-allow-registration"
                      checked={Boolean(formData.allow_member_registration)}
                      onChange={handleChange}
                      name="allow_member_registration"
                      color="primary"
                      slotProps={{ input: { "aria-describedby": "contact-allow-registration-desc" } }}
                      sx={{ flexShrink: 0 }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </SectionCard>
          </Box>
        </Grid>

        {/* Live preview */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <SectionCard
            title="Pratinjau"
            description="Perubahan akan langsung tampil di footer dan bagian kontak website publik."
            sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}
          >
            <Stack spacing={2.25}>
              <PreviewRow icon={faEnvelope} label={t("setting.emailResmi")} value={formData.contact_email} />
              <PreviewRow icon={faPhone} label="Telepon / WhatsApp" value={formData.contact_phone} />
              <PreviewRow icon={faMapMarkerAlt} label={t("setting.alamatSekretariat")} value={formData.contact_address} />
              <Box>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1 }}>
                  {t("setting.pratinjauPeta")}
                </Typography>
                {formData.contact_maps ? (
                  <Box sx={{ borderRadius: 2, overflow: "hidden", height: 180, border: "1px solid", borderColor: "divider" }}>
                    <iframe
                      src={formData.contact_maps}
                      title={t("setting.pratinjauPeta")}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: "block" }}
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </Box>
                ) : (
                  <Box
                    sx={{
                      height: 180, borderRadius: 2, border: "1px dashed", borderColor: "divider", bgcolor: "action.hover",
                      display: "flex", flexDirection: "column", gap: 1, alignItems: "center", justifyContent: "center", color: "text.secondary",
                    }}
                  >
                    <FontAwesomeIcon icon={faMapLocationDot} />
                    <Typography sx={{ fontSize: 13 }}>{t("setting.urlBelum")}</Typography>
                  </Box>
                )}
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

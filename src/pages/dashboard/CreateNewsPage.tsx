import { useTranslation } from "react-i18next";
import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createNews } from "../../controllers";
import { toast } from "react-toastify";
import {
  Alert,
  Box,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
  Grid,
  Stack,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { FieldLabel, SectionCard } from "../../components/dashboard/SectionCard";
import { useAuth } from "../../hooks/useAuth";
import { RichTextEditor } from "../../components/RichTextEditor.tsx";
import imageCompression from 'browser-image-compression';
import { ImageDropzone } from "../../components/dashboard/ImageDropzone";


export const CreateNewsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [publishedAt, setPublishedAt] = useState<string>("");
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => {
    document.title = t("newsForm.docCreate");
  }, [t]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  
  // Revoke the previous blob: preview when it is replaced, so picked images don't leak memory.
  const replacePreview = (next: string | null) =>
    setPreview((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return next;
    });

  const handleImageFile = async (file: File) => {
    setError("");
    setIsUploading(true);
    
    try {
      const options = {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      setImage(compressedFile as File);
      replacePreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error(err);
      setError(t("newsForm.compressFailed"));
      setImage(null);
      replacePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    replacePreview(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!title || !body || !image) {
      toast.error(t("newsForm.requiredCreate"));
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    if (image) {
      formData.append("image", image);
    }

    if (user?.role === 'admin' && !autoPublish && publishedAt) {
      formData.append("published_at", publishedAt.replace('T', ' ') + ':00');
    }

    try {
      const response = await createNews(formData);

      if (response?.success) {
        toast.success(t("newsForm.created"));
        navigate("/dashboard/news");
      } else {
        toast.error((response as { message?: string } | null)?.message || t("newsForm.createFailed"));
      }
    } catch (error) {
      console.error("Error creating news:", error);
      toast.error(t("newsForm.createError"));
    } finally {
      setLoading(false);
    }
  };

  const actions = (
    <>
      <Button component={RouterLink} to="/dashboard/news" variant="outlined" color="inherit" disabled={loading} sx={{ borderColor: "divider" }}>
        {t("crud.batal")}
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        disabled={loading || isUploading || !title || !body || !image}
        startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon sx={{ fontSize: 16 }} />}
      >
        {loading ? t("newsForm.saving") : t("newsForm.save")}
      </Button>
    </>
  );

  return (
    <Stack spacing={3} sx={(theme) => ({ minWidth: 0, "& input": { colorScheme: theme.palette.mode } })}>
      <Box>
        <Button component={RouterLink} to="/dashboard/news" size="small" color="inherit" startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
          sx={{ mb: 1.5, ml: -1, color: "text.secondary", minHeight: 32 }}>
          {t("newsForm.back")}
        </Button>
        <PageHeader
          title={t("newsForm.createTitle")}
          description={t("newsForm.createDesc")}
          actions={actions}
        />
      </Box>

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <SectionCard>
            <Stack spacing={3}>
              <Box>
                <FieldLabel htmlFor="news-title">{t('form.judul')}</FieldLabel>
                <TextField
                  id="news-title"
                  variant="outlined"
                  placeholder={t('form.masukkanJudul')}
                  fullWidth
                  value={title}
                  onChange={handleTitleChange}
                  sx={{ "& .MuiInputBase-root": { fontSize: 16, fontWeight: 600 } }}
                  slotProps={{ htmlInput: { maxLength: 100, "aria-describedby": "news-title-count" } }}
                />
                <Typography
                  id="news-title-count"
                  sx={{ mt: 0.75, fontSize: 13, textAlign: "right", fontVariantNumeric: "tabular-nums", color: title.length === 100 ? "error.main" : "text.secondary" }}
                >
                  {title.length}/100
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <FieldLabel>{t('form.konten')}</FieldLabel>
                <Box sx={{
                  minWidth: 0,
                  "& .ql-toolbar.ql-snow": { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
                  "& .ql-container.ql-snow": { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, fontFamily: "inherit", fontSize: 15 },
                  "& .ql-editor": { minHeight: { xs: 300, sm: 400 }, lineHeight: 1.75, overflowWrap: "anywhere" },
                  "& .ql-editor a": { color: "primary.main" },
                }}>
                  <RichTextEditor value={body} onChange={setBody} ariaLabel={t('form.konten')} />
                </Box>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <SectionCard title={t('form.gambar')} description={t("newsForm.imageDesc")}>
              <input
                id="news-image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleImageFile(file);
                  event.target.value = "";
                }}
                style={{ display: "none" }}
              />
              <ImageDropzone
                inputId="news-image"
                preview={preview}
                isUploading={isUploading}
                uploadingLabel={t('form.mengunggah')}
                onFile={(file) => void handleImageFile(file)}
                onReject={setError}
              />

              {(!image || (preview && !isUploading)) && (
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {!image && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      component="label"
                      htmlFor="news-image"
                      fullWidth
                      sx={{ borderColor: "divider" }}
                    >{t('form.unggahGambar')}</Button>
                  )}
                  {preview && !isUploading && (
                    <Button
                      fullWidth
                      color="error"
                      onClick={handleRemoveImage}
                    >{t('form.hapusGambar')}</Button>
                  )}
                </Stack>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
              )}
            </SectionCard>

            {user?.role === 'admin' && (
              <SectionCard title={t("newsForm.publishTitle")} description={t("newsForm.publishDesc")}>
                <Stack spacing={2}>
                  <FormControlLabel
                    sx={{ ml: -1, mr: 0, ".MuiFormControlLabel-label": { fontSize: 14 } }}
                    control={
                      <Switch
                        checked={autoPublish}
                        onChange={() => setAutoPublish(!autoPublish)}
                        name="autoPublish"
                        color="primary"
                      />
                    }
                    label={t("newsForm.autoPublish")}
                  />
                  <Box>
                    <FieldLabel htmlFor="news-published-at">{t('form.tanggalPublikasi')}</FieldLabel>
                    <TextField
                      id="news-published-at"
                      fullWidth
                      type="datetime-local"
                      value={publishedAt}
                      onChange={(e) => setPublishedAt(e.target.value)}
                      disabled={autoPublish}
                    />
                  </Box>
                </Stack>
              </SectionCard>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

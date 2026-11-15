import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { createGallery, getGalleryById, updateGallery } from "../../controllers/gallery-controller";
import { useAuth } from "../../hooks/useAuth";
import { useGalleryImage } from "../../hooks/useGalleryImage";
import { GalleryForm } from "./GalleryForm";
import { PageHeader } from "./PageHeader";
import { SectionCard } from "./SectionCard";

type GalleryEditorPageProps = { mode: "create" | "edit"; id?: string };

export const GalleryEditorPage = ({ mode, id }: GalleryEditorPageProps) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const [caption, setCaption] = useState("");
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const imageState = useGalleryImage(existingImage);
  const [showMap, setShowMap] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    document.title = isEdit ? "Ubah Galeri - Dasbor" : "Tambah Galeri - Dasbor";
  }, [isEdit]);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;
    const loadGallery = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const response = id ? await getGalleryById(id) : null;
        if (cancelled) return;
        if (!response?.data) {
          setLoadError(true);
          return;
        }
        const data = response.data;
        setCaption(!data.caption || data.caption === "null" || data.caption === "-" ? "" : data.caption);
        setExistingImage(data.image_url || null);
        setLatitude(data.latitude != null ? String(data.latitude) : "");
        setLongitude(data.longitude != null ? String(data.longitude) : "");
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadGallery();
    return () => { cancelled = true; };
  }, [id, isEdit, retry]);

  if (!user || !["admin", "officer", "member"].includes(user.role)) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography component="h1" sx={{ fontSize: 20, fontWeight: 600, color: "error.main" }}>{t("form.aksesDitolak")}</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>{t("form.kembaliBeranda")}</Button>
      </Box>
    );
  }

  if (loading) {
    return <Stack role="status" spacing={1.5} sx={{ alignItems: "center", py: 10 }}><CircularProgress size={28} /><Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t("galleryForm.loading")}</Typography></Stack>;
  }

  if (loadError) {
    return (
      <Stack spacing={3}>
        <PageHeader title={t("galleryForm.editTitle")} />
        <SectionCard>
          <Alert severity="error">{t("galleryForm.loadError")}</Alert>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.25, mt: 2.5 }}>
            <Button variant="outlined" color="inherit" sx={{ borderColor: "divider" }} onClick={() => navigate("/dashboard/gallery")}>{t("galleryForm.back")}</Button>
            <Button variant="contained" onClick={() => setRetry((value) => value + 1)}>{t("galleryForm.retry")}</Button>
          </Stack>
        </SectionCard>
      </Stack>
    );
  }

  const handleSubmit = async () => {
    if (saving || imageState.isUploading) return;
    setFormError("");
    if (!isEdit && !imageState.image) {
      setFormError(t("galleryForm.imageRequired"));
      return;
    }
    const hasCoordinates = latitude.trim() !== "" || longitude.trim() !== "";
    if (showMap && hasCoordinates && (
      latitude.trim() === "" || longitude.trim() === "" ||
      !Number.isFinite(Number(latitude)) || !Number.isFinite(Number(longitude)) ||
      Math.abs(Number(latitude)) > 90 || Math.abs(Number(longitude)) > 180
    )) {
      setFormError(t("galleryForm.invalidCoordinates"));
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("caption", caption === "null" || caption.trim() === "" ? "-" : caption);
    if (imageState.image) {
      formData.append("image", imageState.image);
    } else if (isEdit && imageState.removedExisting) {
      formData.append("remove_existing_image", "true");
    }
    if (showMap) {
      formData.append("latitude", hasCoordinates ? String(Number(latitude)) : "");
      formData.append("longitude", hasCoordinates ? String(Number(longitude)) : "");
    }

    try {
      const response = isEdit && id ? await updateGallery(id, formData) : await createGallery(formData);
      if (!response.success) {
        setFormError(t("galleryForm.saveError"));
        return;
      }
      toast.success(t(isEdit ? "galleryForm.updated" : "galleryForm.created"));
      navigate("/dashboard/gallery");
    } catch {
      setFormError(t("galleryForm.saveError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <GalleryForm
      mode={mode} caption={caption} image={imageState.image} preview={imageState.preview}
      removedExisting={imageState.removedExisting} isUploading={imageState.isUploading} saving={saving}
      imageError={imageState.error} formError={formError} showMap={showMap} latitude={latitude} longitude={longitude}
      onCaptionChange={setCaption} onSelectImage={imageState.selectImage} onRemoveImage={imageState.removeImage}
      onRestoreImage={imageState.restoreImage} onShowMapChange={setShowMap}
      onLatitudeChange={setLatitude} onLongitudeChange={setLongitude} onSubmit={() => { void handleSubmit(); }}
    />
  );
};

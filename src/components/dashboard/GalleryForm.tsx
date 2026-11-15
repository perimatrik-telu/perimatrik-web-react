import { lazy, Suspense, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert, Box, Button, CircularProgress, FormControlLabel, Grid, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import { PageHeader } from "./PageHeader";
import { FieldLabel, SectionCard } from "./SectionCard";

const GalleryLocationMap = lazy(() => import("./GalleryLocationMap"));

const iconSx = { fontSize: 16 };
const hintSx = { fontSize: 13, color: "text.secondary" };

type GalleryFormProps = {
  mode: "create" | "edit";
  caption: string;
  image: File | null;
  preview: string | null;
  removedExisting: boolean;
  isUploading: boolean;
  saving: boolean;
  imageError: string;
  formError: string;
  showMap: boolean;
  latitude: string;
  longitude: string;
  onCaptionChange: (value: string) => void;
  onSelectImage: (file: File) => Promise<void>;
  onRemoveImage: () => void;
  onRestoreImage: () => void;
  onShowMapChange: (value: boolean) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onSubmit: () => void;
};

export const GalleryForm = (props: GalleryFormProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isEdit = props.mode === "edit";
  const busy = props.saving || props.isUploading;
  const latitudeValid = props.latitude.trim() !== "" && Number.isFinite(Number(props.latitude)) && Math.abs(Number(props.latitude)) <= 90;
  const longitudeValid = props.longitude.trim() !== "" && Number.isFinite(Number(props.longitude)) && Math.abs(Number(props.longitude)) <= 180;
  const position: [number, number] | null = latitudeValid && longitudeValid ? [Number(props.latitude), Number(props.longitude)] : null;
  const coordinates = position ? t("galleryForm.selectedCoordinates", { latitude: position[0].toFixed(5), longitude: position[1].toFixed(5) }) : null;

  const actions = (
    <>
      <Button type="button" component={RouterLink} to="/dashboard/gallery" variant="outlined" color="inherit" disabled={busy} sx={{ borderColor: "divider" }}>{t("crud.batal")}</Button>
      <Button type="submit" variant="contained" disabled={busy || (!isEdit && !props.image)}
        startIcon={props.saving ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon sx={iconSx} />}>
        {t(props.saving ? "galleryForm.saving" : isEdit ? "galleryForm.update" : "galleryForm.save")}
      </Button>
    </>
  );

  return (
    <Stack
      component="form"
      noValidate
      spacing={3}
      onSubmit={(event) => { event.preventDefault(); if (!busy) props.onSubmit(); }}
      sx={(theme) => ({
        minWidth: 0,
        "& input, & textarea": { colorScheme: theme.palette.mode },
        // The Mapbox geocoder widget is always rendered on a light surface, so keep its text dark in both modes.
        "& .mapboxgl-ctrl-top-left": { maxWidth: "100%", width: "100%" },
        "& .mapboxgl-ctrl-geocoder": { minWidth: 0, width: "calc(100% - 20px)", maxWidth: 400, fontFamily: "inherit", boxShadow: "0 1px 3px rgba(16, 24, 40, 0.1)", borderRadius: "8px" },
        "& .mapboxgl-ctrl-geocoder--input": {
          minHeight: 44, paddingRight: "44px", colorScheme: "light", color: "grey.900", fontSize: 14,
          "&::placeholder": { color: "grey.600", opacity: 1 },
        },
        "& .mapboxgl-ctrl-geocoder--button": { width: 44, height: 40, top: 2, right: 0 },
        "& .mapboxgl-ctrl-group button": { width: 36, height: 36 },
      })}
    >
      <Box>
        <Button component={RouterLink} to="/dashboard/gallery" size="small" color="inherit" startIcon={<ArrowBackIcon sx={iconSx} />}
          sx={{ mb: 1.5, ml: -1, color: "text.secondary", minHeight: 32 }}>
          {t("galleryForm.back")}
        </Button>
        <PageHeader
          title={t(isEdit ? "galleryForm.editTitle" : "galleryForm.createTitle")}
          description={t(isEdit ? "galleryForm.editDescription" : "galleryForm.createDescription")}
          actions={actions}
        />
      </Box>

      {props.formError && <Alert severity="error">{props.formError}</Alert>}

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <SectionCard title={t("galleryForm.photoTitle")} description={t("galleryForm.photoHint")}>
            <input ref={inputRef} id="gallery-image" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml" hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file && !busy) void props.onSelectImage(file);
              }}
            />
            <Box
              onDragOver={(event) => { event.preventDefault(); if (!busy) setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault(); setIsDragging(false);
                const file = event.dataTransfer.files[0];
                if (file && !busy) void props.onSelectImage(file);
              }}
              sx={(theme) => ({
                minHeight: { xs: 250, sm: 360 }, border: props.preview ? "1px solid" : "1px dashed",
                borderColor: isDragging ? "primary.main" : "divider", borderRadius: "12px",
                bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.06) : "action.hover",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: props.preview ? 1 : 3,
                transition: "border-color 120ms, background-color 120ms",
                "&:hover": { borderColor: "primary.main" },
              })}
            >
              {props.isUploading ? (
                <Stack spacing={1.5} role="status" sx={{ alignItems: "center" }}>
                  <CircularProgress size={24} />
                  <Typography sx={{ fontSize: 14 }}>{t("galleryForm.processingImage")}</Typography>
                </Stack>
              ) : props.preview ? (
                <Box component="img" src={props.preview} alt={t("galleryForm.preview")} sx={{ width: "100%", height: { xs: 280, sm: 440 }, display: "block", objectFit: "contain", borderRadius: "8px" }} />
              ) : (
                <Stack spacing={0.75} sx={{ alignItems: "center", textAlign: "center" }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", mb: 0.75 }}>
                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{t("galleryForm.emptyPhoto")}</Typography>
                  <Typography sx={hintSx}>{t("galleryForm.dropHint")}</Typography>
                  <Typography sx={{ fontSize: 12, color: "text.secondary" }}>{t("galleryForm.formats")}</Typography>
                </Stack>
              )}
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1, mt: 2 }}>
              <Button type="button" variant="outlined" color="inherit" disabled={busy} onClick={() => inputRef.current?.click()} sx={{ borderColor: "divider" }}>
                {t(props.preview ? "galleryForm.replaceImage" : "form.unggahGambar")}
              </Button>
              {props.preview && <Button type="button" color="error" disabled={busy} onClick={props.onRemoveImage}>{t("form.hapusGambar")}</Button>}
              {props.removedExisting && <Button type="button" color="inherit" disabled={busy} onClick={props.onRestoreImage} sx={{ color: "text.secondary" }}>{t("galleryForm.restoreImage")}</Button>}
            </Stack>
            {props.image && <Typography sx={{ ...hintSx, mt: 1.25, overflowWrap: "anywhere" }}>{props.image.name} ({Math.ceil(props.image.size / 1024)} KB)</Typography>}
            {props.removedExisting && <Alert severity="info" sx={{ mt: 2 }}>{t("galleryForm.removeHint")}</Alert>}
            {props.imageError && <Alert severity="error" sx={{ mt: 2 }}>{props.imageError}</Alert>}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <SectionCard title={t("galleryForm.captionTitle")} description={t("galleryForm.captionHint")}>
            <FieldLabel htmlFor="gallery-caption">{t("galleryForm.captionLabel")}</FieldLabel>
            <TextField id="gallery-caption" fullWidth multiline minRows={5} maxRows={12} disabled={props.saving}
              placeholder={t("galleryForm.captionPlaceholder")} value={props.caption} onChange={(event) => props.onCaptionChange(event.target.value)}
              sx={{ "& .MuiInputBase-root": { fontSize: 14, lineHeight: 1.6 } }} slotProps={{ htmlInput: { "aria-describedby": "gallery-caption-hint" } }}
            />
            <Typography id="gallery-caption-hint" sx={{ ...hintSx, mt: 0.75 }}>{t("galleryForm.captionOptional")}</Typography>
          </SectionCard>
        </Grid>

        <Grid size={12} sx={{ minWidth: 0 }}>
          <SectionCard
            title={t("galleryForm.locationTitle")}
            description={t("galleryForm.locationHint")}
            action={
              <FormControlLabel sx={{ m: 0, ".MuiFormControlLabel-label": { fontSize: 14 } }} label={t("galleryForm.showMap")}
                control={<Switch checked={props.showMap} disabled={busy} onChange={(event) => props.onShowMapChange(event.target.checked)} name="showMap" />} />
            }
          >
            {props.showMap ? (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0, pointerEvents: props.saving ? "none" : "auto" }}>
                  <Suspense fallback={<Stack role="status" direction="row" spacing={1.5} sx={{ py: 5, alignItems: "center" }}><CircularProgress size={20} /><Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t("galleryForm.mapLoading")}</Typography></Stack>}>
                    <GalleryLocationMap position={position} onSelect={(latitude, longitude) => {
                      props.onLatitudeChange(String(latitude)); props.onLongitudeChange(String(longitude));
                    }} />
                  </Suspense>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ minWidth: 0 }}>
                  <Stack spacing={2.5}>
                    <Typography sx={hintSx}>{t("galleryForm.coordinatesHint")}</Typography>
                    <Box>
                      <FieldLabel htmlFor="gallery-latitude">{t("galleryForm.latitude")}</FieldLabel>
                      <TextField id="gallery-latitude" fullWidth value={props.latitude} disabled={props.saving}
                        onChange={(event) => props.onLatitudeChange(event.target.value)}
                        error={props.latitude !== "" && !latitudeValid} helperText={props.latitude !== "" && !latitudeValid ? t("galleryForm.latitudeError") : undefined}
                        slotProps={{ htmlInput: { inputMode: "decimal" }, formHelperText: { sx: { mx: 0, fontSize: 13 } } }} />
                    </Box>
                    <Box>
                      <FieldLabel htmlFor="gallery-longitude">{t("galleryForm.longitude")}</FieldLabel>
                      <TextField id="gallery-longitude" fullWidth value={props.longitude} disabled={props.saving}
                        onChange={(event) => props.onLongitudeChange(event.target.value)}
                        error={props.longitude !== "" && !longitudeValid} helperText={props.longitude !== "" && !longitudeValid ? t("galleryForm.longitudeError") : undefined}
                        slotProps={{ htmlInput: { inputMode: "decimal" }, formHelperText: { sx: { mx: 0, fontSize: 13 } } }} />
                    </Box>
                    {coordinates && <Typography sx={{ ...hintSx, fontVariantNumeric: "tabular-nums" }}>{coordinates}</Typography>}
                  </Stack>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: "8px", border: "1px solid", borderColor: "divider" }}>
                <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t(isEdit ? "galleryForm.mapOffEdit" : "galleryForm.mapOffCreate")}</Typography>
                {coordinates && <Typography sx={{ fontSize: 14, mt: 1, fontVariantNumeric: "tabular-nums" }}>{coordinates}</Typography>}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );
};

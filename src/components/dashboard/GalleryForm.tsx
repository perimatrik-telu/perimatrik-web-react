import { lazy, Suspense, useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert, Box, Button, CircularProgress, FormControlLabel, FormLabel,
  Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

const GalleryLocationMap = lazy(() => import("./GalleryLocationMap"));

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
  const dashboardTheme = useTheme();
  const formTheme = useMemo(() => createTheme(dashboardTheme, {
    palette: {
      primary: {
        main: dashboardTheme.palette.mode === "dark" ? "#e67817" : "#b95608",
        contrastText: dashboardTheme.palette.mode === "dark" ? "#121212" : "#fff",
      },
      text: { secondary: dashboardTheme.palette.mode === "dark" ? "#ccc" : "#5b6b80" },
    },
  }), [dashboardTheme]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isEdit = props.mode === "edit";
  const busy = props.saving || props.isUploading;
  const latitudeValid = props.latitude.trim() !== "" && Number.isFinite(Number(props.latitude)) && Math.abs(Number(props.latitude)) <= 90;
  const longitudeValid = props.longitude.trim() !== "" && Number.isFinite(Number(props.longitude)) && Math.abs(Number(props.longitude)) <= 180;
  const position: [number, number] | null = latitudeValid && longitudeValid ? [Number(props.latitude), Number(props.longitude)] : null;
  const sectionStyle = { p: { xs: 2.5, sm: 3 }, minWidth: 0, borderColor: "divider" };

  return (
    <ThemeProvider theme={formTheme}>
      <Box
        component="form"
        noValidate
        onSubmit={(event) => { event.preventDefault(); if (!busy) props.onSubmit(); }}
        sx={(theme) => ({
          maxWidth: 1440, mx: "auto", minWidth: 0,
          "& .MuiButton-root": { minHeight: 44, borderRadius: 1, textTransform: "none", fontWeight: 700 },
          "& .MuiButton-outlined": { borderColor: "text.secondary" },
          "& .MuiButton-containedPrimary": {
            bgcolor: "primary.main", color: "primary.contrastText",
            "&:hover": { bgcolor: theme.palette.mode === "dark" ? "#f6a554" : "#974507" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" },
          },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "text.secondary" },
          "& input, & textarea": { colorScheme: theme.palette.mode },
          "& input::placeholder, & textarea::placeholder": { color: "text.secondary", opacity: 1 },
          "& .MuiSwitch-track": { bgcolor: "text.secondary", opacity: 1 },
          "& .MuiSwitch-thumb": { bgcolor: "background.paper" },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 1 },
          "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": { bgcolor: "primary.contrastText" },
          "& .MuiButton-root:focus-visible, & .MuiSwitch-input:focus-visible + .MuiSwitch-thumb": {
            outline: `3px solid ${theme.palette.mode === "dark" ? "#f6a554" : "#b95608"}`, outlineOffset: 3,
          },
          "& .mapboxgl-ctrl-top-left": { maxWidth: "100%", width: "100%" },
          "& .mapboxgl-ctrl-geocoder": { minWidth: 0, width: "calc(100% - 20px)", maxWidth: 400 },
          "& .mapboxgl-ctrl-geocoder--input": {
            minHeight: 50, paddingRight: "44px", colorScheme: "light", color: "#1f2933",
            "&::placeholder": { color: "#5b6b80", opacity: 1 },
          },
          "& .mapboxgl-ctrl-geocoder--button": { width: 44, height: 44, top: 3, right: 0 },
          "& .mapboxgl-ctrl-group button": { width: 44, height: 44 },
        })}
      >
        <Button component={RouterLink} to="/dashboard/gallery" color="inherit" startIcon={<ArrowBackIcon />} sx={{ mb: 1.5 }}>
          {t("galleryForm.back")}
        </Button>
        <Box sx={{ mb: { xs: 3, sm: 4 } }}>
          <Typography component="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 800, lineHeight: 1.25, mb: 1 }}>
            {t(isEdit ? "galleryForm.editTitle" : "galleryForm.createTitle")}
          </Typography>
          <Typography color="text.secondary">{t(isEdit ? "galleryForm.editDescription" : "galleryForm.createDescription")}</Typography>
        </Box>

        <Paper variant="outlined" sx={{ ...sectionStyle, mb: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={2.5} sx={{ flexWrap: "wrap" }}>
            <Box sx={{ maxWidth: 480, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>{t("galleryForm.saveTitle")}</Typography>
              <Typography variant="body2" color="text.secondary">{t(isEdit ? "galleryForm.editSaveHint" : "galleryForm.createSaveHint")}</Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ flexShrink: 0, flexWrap: "wrap", maxWidth: "100%" }}>
              <Button type="button" component={RouterLink} to="/dashboard/gallery" variant="outlined" color="inherit" disabled={busy}>{t("crud.batal")}</Button>
              <Button type="submit" variant="contained" disabled={busy || (!isEdit && !props.image)}
                startIcon={props.saving ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}>
                {t(props.saving ? "galleryForm.saving" : isEdit ? "galleryForm.update" : "galleryForm.save")}
              </Button>
            </Stack>
          </Stack>
        </Paper>
        {props.formError && <Alert severity="error" sx={{ mb: 3 }}>{props.formError}</Alert>}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 340px" }, gap: { xs: 2.5, sm: 3 }, alignItems: "start" }}>
          <Paper variant="outlined" sx={sectionStyle}>
            <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: 0.75 }}>{t("galleryForm.photoTitle")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{t("galleryForm.photoHint")}</Typography>
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
                minHeight: { xs: 250, sm: 380 }, border: props.preview ? "1px solid" : "1px dashed",
                borderColor: isDragging ? "primary.main" : "text.secondary", borderRadius: 1,
                bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.08) : "background.default",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: props.preview ? 1 : 3,
              })}
            >
              {props.isUploading ? (
                <Stack alignItems="center" spacing={2} role="status"><CircularProgress size={28} /><Typography variant="body2">{t("galleryForm.processingImage")}</Typography></Stack>
              ) : props.preview ? (
                <Box component="img" src={props.preview} alt={t("galleryForm.preview")} sx={{ width: "100%", height: { xs: 280, sm: 440 }, display: "block", objectFit: "contain", borderRadius: 0.5 }} />
              ) : (
                <Stack alignItems="center" spacing={1.5} sx={{ textAlign: "center" }}>
                  <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 44, color: "text.secondary" }} />
                  <Typography variant="body2" fontWeight={600}>{t("galleryForm.emptyPhoto")}</Typography>
                  <Typography variant="body2" color="text.secondary">{t("galleryForm.dropHint")}</Typography>
                  <Typography variant="caption" color="text.secondary">{t("galleryForm.formats")}</Typography>
                </Stack>
              )}
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} sx={{ mt: 2 }}>
              <Button type="button" variant="outlined" color="inherit" disabled={busy} onClick={() => inputRef.current?.click()}>
                {t(props.preview ? "galleryForm.replaceImage" : "form.unggahGambar")}
              </Button>
              {props.preview && <Button type="button" color="error" disabled={busy} onClick={props.onRemoveImage}>{t("form.hapusGambar")}</Button>}
              {props.removedExisting && <Button type="button" color="inherit" disabled={busy} onClick={props.onRestoreImage}>{t("galleryForm.restoreImage")}</Button>}
            </Stack>
            {props.image && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5, overflowWrap: "anywhere" }}>{props.image.name} ({Math.ceil(props.image.size / 1024)} KB)</Typography>}
            {props.removedExisting && <Alert severity="info" sx={{ mt: 2 }}>{t("galleryForm.removeHint")}</Alert>}
            {props.imageError && <Alert severity="error" sx={{ mt: 2 }}>{props.imageError}</Alert>}
          </Paper>

          <Paper variant="outlined" sx={sectionStyle}>
            <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: 0.75 }}>{t("galleryForm.captionTitle")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{t("galleryForm.captionHint")}</Typography>
            <FormLabel htmlFor="gallery-caption" sx={{ display: "block", color: "text.primary", fontWeight: 700, mb: 1.5 }}>{t("galleryForm.captionLabel")}</FormLabel>
            <TextField id="gallery-caption" fullWidth multiline minRows={5} maxRows={12} disabled={props.saving}
              placeholder={t("galleryForm.captionPlaceholder")} value={props.caption} onChange={(event) => props.onCaptionChange(event.target.value)}
              inputProps={{ "aria-describedby": "gallery-caption-hint" }} sx={{ "& .MuiInputBase-root": { lineHeight: 1.7 } }}
            />
            <Typography id="gallery-caption-hint" variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>{t("galleryForm.captionOptional")}</Typography>
          </Paper>
        </Box>

        <Paper variant="outlined" sx={{ ...sectionStyle, mt: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" gap={2} sx={{ mb: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography component="h2" variant="subtitle1" fontWeight={700} sx={{ mb: 0.75 }}>{t("galleryForm.locationTitle")}</Typography>
              <Typography variant="body2" color="text.secondary">{t("galleryForm.locationHint")}</Typography>
            </Box>
            <FormControlLabel sx={{ m: 0, flexShrink: 0 }} label={t("galleryForm.showMap")}
              control={<Switch checked={props.showMap} disabled={busy} onChange={(event) => props.onShowMapChange(event.target.checked)} name="showMap" />} />
          </Stack>
          {props.showMap ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) 240px" }, gap: 3 }}>
              <Box sx={{ minWidth: 0, pointerEvents: props.saving ? "none" : "auto" }}>
                <Suspense fallback={<Stack role="status" direction="row" spacing={2} sx={{ py: 5 }}><CircularProgress size={24} /><Typography variant="body2">{t("galleryForm.mapLoading")}</Typography></Stack>}>
                  <GalleryLocationMap position={position} onSelect={(latitude, longitude) => {
                    props.onLatitudeChange(String(latitude)); props.onLongitudeChange(String(longitude));
                  }} />
                </Suspense>
              </Box>
              <Stack gap={2} sx={{ minWidth: 0 }}>
                <Typography variant="body2" color="text.secondary">{t("galleryForm.coordinatesHint")}</Typography>
                <TextField id="gallery-latitude" label={t("galleryForm.latitude")} fullWidth value={props.latitude} disabled={props.saving}
                  onChange={(event) => props.onLatitudeChange(event.target.value)}
                  error={props.latitude !== "" && !latitudeValid} helperText={props.latitude !== "" && !latitudeValid ? t("galleryForm.latitudeError") : undefined}
                  inputProps={{ inputMode: "decimal" }} />
                <TextField id="gallery-longitude" label={t("galleryForm.longitude")} fullWidth value={props.longitude} disabled={props.saving}
                  onChange={(event) => props.onLongitudeChange(event.target.value)}
                  error={props.longitude !== "" && !longitudeValid} helperText={props.longitude !== "" && !longitudeValid ? t("galleryForm.longitudeError") : undefined}
                  inputProps={{ inputMode: "decimal" }} />
                {position && <Typography variant="caption" color="text.secondary">{t("galleryForm.selectedCoordinates", { latitude: position[0].toFixed(5), longitude: position[1].toFixed(5) })}</Typography>}
              </Stack>
            </Box>
          ) : (
            <Box sx={{ p: 2.5, bgcolor: "background.default", borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">{t(isEdit ? "galleryForm.mapOffEdit" : "galleryForm.mapOffCreate")}</Typography>
              {position && <Typography variant="body2" sx={{ mt: 1 }}>{t("galleryForm.selectedCoordinates", { latitude: position[0].toFixed(5), longitude: position[1].toFixed(5) })}</Typography>}
            </Box>
          )}
        </Paper>
      </Box>
    </ThemeProvider>
  );
};

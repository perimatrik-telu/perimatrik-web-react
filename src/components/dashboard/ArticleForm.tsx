import { useMemo, useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert, Box, Button, Chip, CircularProgress, Divider, FormControlLabel,
  FormLabel, Paper, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { alpha, createTheme, ThemeProvider, useTheme } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { RichTextEditor } from "../RichTextEditor";

type ArticleStatus = "draft" | "active" | "inactive";

type ArticleFormProps = {
  mode: "create" | "edit";
  title: string;
  body: string;
  image: File | null;
  preview: string | null;
  imageError: string;
  isUploading: boolean;
  loadingStatus: ArticleStatus | null;
  currentStatus?: ArticleStatus;
  isAdmin: boolean;
  autoPublish: boolean;
  publishedAt: string | null;
  onTitleChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onSelectImage: (file: File) => Promise<void>;
  onRemoveImage: () => void;
  onAutoPublishChange: (value: boolean) => void;
  onPublishedAtChange: (value: string) => void;
  onSubmit: (status: ArticleStatus) => void;
};

export const ArticleForm = (props: ArticleFormProps) => {
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
  const busy = Boolean(props.loadingStatus) || props.isUploading;
  const hasBody = Boolean(new DOMParser().parseFromString(props.body, "text/html").body.textContent?.trim())
    || /<img\b/i.test(props.body);
  const canPublish = Boolean(props.title.trim()) && hasBody && (isEdit || Boolean(props.image));
  const status = props.currentStatus ?? "draft";
  const sectionStyle = { p: { xs: 2.5, sm: 3 }, borderColor: "divider", minWidth: 0 };

  return (
    <ThemeProvider theme={formTheme}>
    <Box
      component="form"
      noValidate
      onSubmit={(event) => { event.preventDefault(); if (!busy) props.onSubmit("draft"); }}
      sx={(theme) => ({
        maxWidth: 1440, mx: "auto", minWidth: 0,
        "& .MuiButton-root": { minHeight: 44, borderRadius: 1, textTransform: "none", fontWeight: 700 },
        "& .MuiButton-outlined": { borderColor: "text.secondary" },
        "& .MuiButton-root:focus-visible, & .MuiSwitch-input:focus-visible + .MuiSwitch-thumb": {
          outline: `3px solid ${theme.palette.mode === "dark" ? "#f6a554" : "#b95608"}`, outlineOffset: 3,
        },
        "& .MuiOutlinedInput-notchedOutline": { borderColor: "text.secondary" },
        "& .MuiSwitch-track": { bgcolor: "text.secondary", opacity: 1 },
        "& .MuiSwitch-thumb": { bgcolor: "background.paper" },
        "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: "primary.main", opacity: 1 },
        "& .MuiSwitch-switchBase.Mui-checked .MuiSwitch-thumb": { bgcolor: "primary.contrastText" },
        "& input": { colorScheme: theme.palette.mode },
        "& input::placeholder, & textarea::placeholder": { color: "text.secondary", opacity: 1 },
        "& .MuiButton-containedPrimary": {
          bgcolor: theme.palette.mode === "dark" ? "#e67817" : "#b95608",
          color: theme.palette.mode === "dark" ? "#121212" : "#fff",
          "&:hover": { bgcolor: theme.palette.mode === "dark" ? "#f6a554" : "#974507" },
          "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "action.disabled" },
        },
        "--ck-color-base-background": theme.palette.background.paper,
        "--ck-color-base-foreground": theme.palette.background.default,
        "--ck-color-base-border": theme.palette.text.secondary,
        "--ck-color-text": theme.palette.text.primary,
        "--ck-color-toolbar-background": theme.palette.background.paper,
        "--ck-color-toolbar-border": theme.palette.text.secondary,
        "--ck-color-button-default-hover-background": theme.palette.action.hover,
        "--ck-color-button-default-active-background": theme.palette.action.selected,
        "--ck-color-button-on-background": alpha(theme.palette.primary.main, 0.16),
        "--ck-color-button-on-color": theme.palette.mode === "dark" ? "#f6a554" : "#974507",
        "--ck-color-button-on-hover-background": alpha(theme.palette.primary.main, 0.24),
        "--ck-color-focus-border": theme.palette.mode === "dark" ? "#f6a554" : "#b95608",
        "--ck-color-input-background": theme.palette.background.paper,
        "--ck-color-input-text": theme.palette.text.primary,
        "--ck-color-list-background": theme.palette.background.paper,
        "--ck-color-list-button-hover-background": theme.palette.action.hover,
        "--ck-color-dropdown-panel-background": theme.palette.background.paper,
        "--ck-color-tooltip-background": theme.palette.text.primary,
        "--ck-color-tooltip-text": theme.palette.background.paper,
      })}
    >
      <Button component={RouterLink} to="/dashboard/article" color="inherit" startIcon={<ArrowBackIcon />} sx={{ mb: 1.5 }}>
        {t("articleForm.back")}
      </Button>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", gap: 2, mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" sx={{ fontSize: { xs: "1.75rem", sm: "2rem" }, fontWeight: 800, lineHeight: 1.25, mb: 1 }}>
            {t(isEdit ? "articleForm.editTitle" : "articleForm.createTitle")}
          </Typography>
          <Typography color="text.secondary">{t(isEdit ? "articleForm.editDescription" : "articleForm.createDescription")}</Typography>
        </Box>
        {isEdit && (
          <Chip label={t(`articleForm.status.${status}`)} variant="outlined" sx={{ borderRadius: 1, fontWeight: 700, color: "text.primary", borderColor: "text.secondary", flexShrink: 0 }} />
        )}
      </Stack>

      <Paper variant="outlined" sx={{ mb: 3, p: { xs: 2.5, sm: 3 } }}>
        <Stack direction={{ xs: "column", md: "row" }} sx={{ alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between", gap: 2.5 }}>
          <Box sx={{ maxWidth: 420 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>{t("articleForm.saveTitle")}</Typography>
            <Typography variant="body2" color="text.secondary">{t(isEdit ? "articleForm.editSaveHint" : "articleForm.createSaveHint")}</Typography>
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ gap: 1.5, flexShrink: 0 }}>
            {isEdit && <Button type="button" color="inherit" disabled={busy} onClick={() => props.onSubmit("inactive")}
              startIcon={props.loadingStatus === "inactive" ? <CircularProgress size={18} color="inherit" /> : <VisibilityOffOutlinedIcon />}>
              {t("articleForm.deactivate")}
            </Button>}
            <Button type="submit" variant="outlined" color="inherit" disabled={busy}
              startIcon={props.loadingStatus === "draft" ? <CircularProgress size={18} color="inherit" /> : <SaveOutlinedIcon />}>
              {t("form.simpanDraft")}
            </Button>
            <Button type="button" variant="contained" disabled={busy || !canPublish} onClick={() => props.onSubmit("active")}
              startIcon={props.loadingStatus === "active" ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon />}>
              {t("form.publish")}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 320px" }, gap: { xs: 2.5, sm: 3 }, alignItems: "start" }}>
        <Paper variant="outlined" sx={{ ...sectionStyle, p: { xs: 2.5, sm: 4 } }}>
          <FormLabel htmlFor="article-title" sx={{ display: "block", color: "text.primary", fontWeight: 700, mb: 1.5 }}>
            {t("form.judul")}
          </FormLabel>
          <TextField
            id="article-title" fullWidth multiline maxRows={3} value={props.title}
            placeholder={t("form.masukkanJudul")} onChange={(event) => props.onTitleChange(event.target.value)}
            disabled={Boolean(props.loadingStatus)}
            sx={{ "& .MuiInputBase-root": { fontSize: { xs: "1.25rem", sm: "1.5rem" }, fontWeight: 700, lineHeight: 1.5 } }}
            slotProps={{ htmlInput: { maxLength: 100, "aria-describedby": "article-title-hint" } }}
          />
          <Stack direction="row" sx={{ justifyContent: "space-between", gap: 2, mt: 1, mb: 3.5 }} id="article-title-hint">
            <Typography variant="caption" color="text.secondary">{t("articleForm.titleHint")}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>{props.title.length}/100</Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <FormLabel id="article-body-label" sx={{ display: "block", color: "text.primary", fontWeight: 700, mb: 1 }}>
            {t("form.konten")}
          </FormLabel>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{t("articleForm.bodyHint")}</Typography>
          <Box sx={{
            minWidth: 0,
            "& .ck-editor": { width: "100%", minWidth: 0 },
            "& .ck-editor__editable": { minHeight: { xs: 320, sm: 440 }, px: { xs: 2, sm: 3 }, color: "text.primary", bgcolor: "background.paper", fontSize: "1rem", lineHeight: 1.8, overflowWrap: "anywhere" },
            "& .ck-toolbar": { p: 1, borderRadius: "8px 8px 0 0 !important" },
            "& .ck-button": { minHeight: 44, minWidth: 44 },
            "& .ck.ck-editor__editable_inline": { borderRadius: "0 0 8px 8px" },
            "& .ck-placeholder::before": { color: "text.secondary" },
            "& .ck-content a": { color: "primary.main", textDecoration: "underline" },
          }}>
            <RichTextEditor value={props.body} onChange={props.onBodyChange} disabled={Boolean(props.loadingStatus)} ariaLabel={t("form.konten")} placeholder={t("articleForm.bodyPlaceholder")} />
          </Box>
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", sm: "repeat(2, minmax(0, 1fr))", lg: "minmax(0, 1fr)" }, gap: 3, minWidth: 0 }}>
          <Paper variant="outlined" sx={sectionStyle}>
            <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>{t("articleForm.coverTitle")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{t("articleForm.coverHint")}</Typography>
            <input id="article-image" ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file && !busy) void props.onSelectImage(file);
            }} />
            <Box
              onDragOver={(event) => { event.preventDefault(); if (!busy) setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault(); setIsDragging(false);
                const file = event.dataTransfer.files[0];
                if (file && !busy) void props.onSelectImage(file);
              }}
              sx={(theme) => ({
                border: props.preview ? "1px solid" : "1px dashed", borderColor: isDragging ? "primary.main" : "text.secondary",
                borderRadius: 1, p: props.preview ? 0.75 : 2.5, bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.08) : "background.default",
                textAlign: "center", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              })}
            >
              {props.isUploading ? (
                <Stack spacing={2} role="status" sx={{ alignItems: "center" }}>
                  <CircularProgress size={28} /><Typography variant="body2">{t("articleForm.processingImage")}</Typography>
                </Stack>
              ) : props.preview ? (
                <Box component="img" src={props.preview} alt={t("articleForm.coverPreview")} sx={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: 0.5 }} />
              ) : (
                <>
                  <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 36, color: "text.secondary", mb: 1.5 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{t("articleForm.emptyCover")}</Typography>
                  <Typography variant="caption" color="text.secondary">{t("articleForm.dropHint")}</Typography>
                </>
              )}
            </Box>
            <Button type="button" variant="outlined" color="inherit" fullWidth disabled={busy} onClick={() => inputRef.current?.click()} sx={{ mt: 2 }}>
              {t(props.preview ? "articleForm.replaceImage" : "form.unggahGambar")}
            </Button>
            {props.image && (
              <Button type="button" color="inherit" fullWidth disabled={busy} onClick={props.onRemoveImage} sx={{ mt: 0.5 }}>
                {t("form.hapusGambar")}
              </Button>
            )}
            {props.image && <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere", mt: 1 }}>{props.image.name}</Typography>}
            {props.imageError && <Alert severity="error" sx={{ mt: 2 }}>{props.imageError}</Alert>}
          </Paper>

          <Paper variant="outlined" sx={sectionStyle}>
            <Typography component="h2" variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{t("articleForm.publicationTitle")}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>{t("articleForm.draftHint")}</Typography>
            {props.isAdmin && (
              <>
                <Divider sx={{ mb: 2 }} />
                <FormControlLabel sx={{ ml: -1, mr: 0, alignItems: "center", ".MuiFormControlLabel-label": { fontSize: "0.875rem" } }}
                  control={<Switch checked={props.autoPublish} disabled={busy} onChange={(event) => props.onAutoPublishChange(event.target.checked)} name="autoPublish" />}
                  label={t("form.aturOtomatis")}
                />
                <TextField id="article-published-at" fullWidth type="datetime-local" label={t("form.tanggalPublikasi")}
                  value={props.publishedAt ?? ""} onChange={(event) => props.onPublishedAtChange(event.target.value)}
                  disabled={props.autoPublish || busy} sx={{ mt: 2 }} slotProps={{ inputLabel: { shrink: true }, htmlInput: { style: { minWidth: 0 }, "aria-describedby": "article-publication-hint" } }}
                />
                <Typography id="article-publication-hint" variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>{t("articleForm.dateHint")}</Typography>
              </>
            )}
          </Paper>
        </Box>
      </Box>

    </Box>
    </ThemeProvider>
  );
};

import { useRef, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert, Box, Button, CircularProgress, FormControlLabel, Grid, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { RichTextEditor } from "../RichTextEditor";
import { PageHeader, StatusPill } from "./PageHeader";
import { FieldLabel, SectionCard } from "./SectionCard";

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

const statusTone = { draft: "neutral", active: "success", inactive: "warning" } as const;
const iconSx = { fontSize: 16 };
const hintSx = { fontSize: 13, color: "text.secondary" };

export const ArticleForm = (props: ArticleFormProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isEdit = props.mode === "edit";
  const busy = Boolean(props.loadingStatus) || props.isUploading;
  const hasBody = Boolean(new DOMParser().parseFromString(props.body, "text/html").body.textContent?.trim())
    || /<img\b/i.test(props.body);
  const canPublish = Boolean(props.title.trim()) && hasBody && (isEdit || Boolean(props.image));
  const status = props.currentStatus ?? "draft";

  const actions = (
    <>
      {isEdit && (
        <Button type="button" color="inherit" disabled={busy} onClick={() => props.onSubmit("inactive")} sx={{ color: "text.secondary" }}
          startIcon={props.loadingStatus === "inactive" ? <CircularProgress size={14} color="inherit" /> : <VisibilityOffOutlinedIcon sx={iconSx} />}>
          {t("articleForm.deactivate")}
        </Button>
      )}
      <Button type="submit" variant="outlined" color="inherit" disabled={busy} sx={{ borderColor: "divider" }}
        startIcon={props.loadingStatus === "draft" ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon sx={iconSx} />}>
        {t("form.simpanDraft")}
      </Button>
      <Button type="button" variant="contained" disabled={busy || !canPublish} onClick={() => props.onSubmit("active")}
        startIcon={props.loadingStatus === "active" ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon sx={iconSx} />}>
        {t("form.publish")}
      </Button>
    </>
  );

  return (
    <Stack
      component="form"
      noValidate
      spacing={3}
      onSubmit={(event) => { event.preventDefault(); if (!busy) props.onSubmit("draft"); }}
      sx={(theme) => ({ minWidth: 0, "& input": { colorScheme: theme.palette.mode } })}
    >
      <Box>
        <Button component={RouterLink} to="/dashboard/article" size="small" color="inherit" startIcon={<ArrowBackIcon sx={iconSx} />}
          sx={{ mb: 1.5, ml: -1, color: "text.secondary", minHeight: 32 }}>
          {t("articleForm.back")}
        </Button>
        <PageHeader
          title={t(isEdit ? "articleForm.editTitle" : "articleForm.createTitle")}
          meta={isEdit ? <StatusPill tone={statusTone[status]}>{t(`articleForm.status.${status}`)}</StatusPill> : undefined}
          description={t(isEdit ? "articleForm.editDescription" : "articleForm.createDescription")}
          actions={actions}
        />
      </Box>

      <Grid container spacing={3} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, lg: 8 }} sx={{ minWidth: 0 }}>
          <SectionCard>
            <Stack spacing={3}>
              <Box>
                <FieldLabel htmlFor="article-title">{t("form.judul")}</FieldLabel>
                <TextField
                  id="article-title" fullWidth multiline maxRows={3} value={props.title}
                  placeholder={t("form.masukkanJudul")} onChange={(event) => props.onTitleChange(event.target.value)}
                  disabled={Boolean(props.loadingStatus)}
                  sx={{ "& .MuiInputBase-root": { fontSize: 16, fontWeight: 600, lineHeight: 1.5 } }}
                  slotProps={{ htmlInput: { maxLength: 100, "aria-describedby": "article-title-hint" } }}
                />
                <Stack direction="row" id="article-title-hint" sx={{ justifyContent: "space-between", gap: 2, mt: 0.75 }}>
                  <Typography sx={hintSx}>{t("articleForm.titleHint")}</Typography>
                  <Typography sx={{ ...hintSx, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{props.title.length}/100</Typography>
                </Stack>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <FieldLabel hint={t("articleForm.bodyHint")}>{t("form.konten")}</FieldLabel>
                <Box sx={{
                  minWidth: 0,
                  "& .ql-toolbar.ql-snow": { borderTopLeftRadius: 8, borderTopRightRadius: 8 },
                  "& .ql-container.ql-snow": { borderBottomLeftRadius: 8, borderBottomRightRadius: 8, fontFamily: "inherit", fontSize: 15 },
                  "& .ql-editor": { minHeight: { xs: 320, sm: 440 }, lineHeight: 1.75, overflowWrap: "anywhere" },
                  "& .ql-editor a": { color: "primary.main" },
                }}>
                  <RichTextEditor value={props.body} onChange={props.onBodyChange} disabled={Boolean(props.loadingStatus)} ariaLabel={t("form.konten")} placeholder={t("articleForm.bodyPlaceholder")} />
                </Box>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }} sx={{ minWidth: 0 }}>
          <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <SectionCard title={t("articleForm.coverTitle")} description={t("articleForm.coverHint")}>
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
                  border: props.preview ? "1px solid" : "1px dashed",
                  borderColor: isDragging ? "primary.main" : "divider",
                  borderRadius: "12px", p: props.preview ? 0.75 : 3, minHeight: 180,
                  bgcolor: isDragging ? alpha(theme.palette.primary.main, 0.06) : "action.hover",
                  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center",
                  transition: "border-color 120ms, background-color 120ms",
                  "&:hover": { borderColor: "primary.main" },
                })}
              >
                {props.isUploading ? (
                  <Stack spacing={1.5} role="status" sx={{ alignItems: "center" }}>
                    <CircularProgress size={24} />
                    <Typography sx={{ fontSize: 14 }}>{t("articleForm.processingImage")}</Typography>
                  </Stack>
                ) : props.preview ? (
                  <Box component="img" src={props.preview} alt={t("articleForm.coverPreview")} sx={{ display: "block", width: "100%", aspectRatio: "16 / 10", objectFit: "cover", borderRadius: "8px" }} />
                ) : (
                  <>
                    <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", mb: 1.5 }}>
                      <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
                    </Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, mb: 0.5 }}>{t("articleForm.emptyCover")}</Typography>
                    <Typography sx={hintSx}>{t("articleForm.dropHint")}</Typography>
                  </>
                )}
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                <Button type="button" variant="outlined" color="inherit" fullWidth disabled={busy} onClick={() => inputRef.current?.click()} sx={{ borderColor: "divider" }}>
                  {t(props.preview ? "articleForm.replaceImage" : "form.unggahGambar")}
                </Button>
                {props.image && (
                  <Button type="button" color="inherit" fullWidth disabled={busy} onClick={props.onRemoveImage} sx={{ color: "text.secondary" }}>
                    {t("form.hapusGambar")}
                  </Button>
                )}
              </Stack>
              {props.image && <Typography sx={{ ...hintSx, overflowWrap: "anywhere", mt: 1.25 }}>{props.image.name}</Typography>}
              {props.imageError && <Alert severity="error" sx={{ mt: 2 }}>{props.imageError}</Alert>}
            </SectionCard>

            <SectionCard title={t("articleForm.publicationTitle")} description={t("articleForm.draftHint")}>
              <Stack spacing={2}>
                <Typography sx={hintSx}>{t(isEdit ? "articleForm.editSaveHint" : "articleForm.createSaveHint")}</Typography>
                {props.isAdmin && (
                  <>
                    <FormControlLabel
                      sx={{ ml: -1, mr: 0, ".MuiFormControlLabel-label": { fontSize: 14 } }}
                      control={<Switch checked={props.autoPublish} disabled={busy} onChange={(event) => props.onAutoPublishChange(event.target.checked)} name="autoPublish" />}
                      label={t("form.aturOtomatis")}
                    />
                    <Box>
                      <FieldLabel htmlFor="article-published-at">{t("form.tanggalPublikasi")}</FieldLabel>
                      <TextField id="article-published-at" fullWidth type="datetime-local"
                        value={props.publishedAt ?? ""} onChange={(event) => props.onPublishedAtChange(event.target.value)}
                        disabled={props.autoPublish || busy}
                        slotProps={{ htmlInput: { style: { minWidth: 0 }, "aria-describedby": "article-publication-hint" } }}
                      />
                      <Typography id="article-publication-hint" sx={{ ...hintSx, mt: 0.75 }}>{t("articleForm.dateHint")}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

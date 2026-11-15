import { useState, type DragEvent, type KeyboardEvent } from "react";
import { alpha, Box, CircularProgress, Stack, Typography } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";

type ImageDropzoneProps = {
  /** id of the hidden <input type="file"> the zone opens on click/Enter. */
  inputId: string;
  preview: string | null;
  isUploading?: boolean;
  uploadingLabel?: string;
  /** Called with the dropped image file. */
  onFile: (file: File) => void;
  /** Called with a user-facing message when a dropped file is not an image. */
  onReject?: (message: string) => void;
  emptyTitle?: string;
  emptyHint?: string;
};

/**
 * Clickable, keyboard-accessible drop area for a single image. The parent owns the hidden file input
 * (referenced by `inputId`) and the processing of the file.
 */
export const ImageDropzone = ({
  inputId,
  preview,
  isUploading = false,
  uploadingLabel = "Mengunggah…",
  onFile,
  onReject,
  emptyTitle = "Seret gambar ke sini atau klik untuk memilih",
  emptyHint = "JPG, PNG, atau WebP",
}: ImageDropzoneProps) => {
  const [dragging, setDragging] = useState(false);

  const openPicker = () => {
    if (!isUploading) document.getElementById(inputId)?.click();
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (isUploading) return;
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onReject?.("File harus berupa gambar.");
      return;
    }
    onFile(file);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPicker();
    }
  };

  return (
    <Box
      role="button"
      tabIndex={isUploading ? -1 : 0}
      aria-label={preview ? "Ganti gambar: seret gambar baru ke sini atau tekan Enter" : emptyTitle}
      aria-busy={isUploading || undefined}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={(event) => {
        event.preventDefault();
        if (!isUploading) setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      sx={(theme) => ({
        position: "relative",
        border: "1px dashed",
        borderColor: dragging ? "primary.main" : "divider",
        borderRadius: "12px",
        bgcolor: dragging ? alpha(theme.palette.primary.main, 0.06) : "action.hover",
        p: preview && !isUploading ? 0.75 : 3,
        minHeight: 180,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: isUploading ? "progress" : "pointer",
        transition: "border-color 120ms ease, background-color 120ms ease",
        "&:hover": { borderColor: "primary.main" },
        "&:focus-visible": { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 },
      })}
    >
      {isUploading ? (
        <Stack spacing={1.5} role="status" sx={{ alignItems: "center" }}>
          <CircularProgress size={24} color="primary" />
          <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{uploadingLabel}</Typography>
        </Stack>
      ) : preview ? (
        <Box component="img" src={preview} alt="Pratinjau gambar" sx={{ display: "block", width: "100%", height: "auto", borderRadius: "8px" }} />
      ) : (
        <>
          <Box sx={{ width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", mb: 1.5 }}>
            <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20, color: "text.secondary" }} />
          </Box>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{dragging ? "Lepaskan untuk mengunggah" : emptyTitle}</Typography>
          <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>{emptyHint}</Typography>
        </>
      )}
    </Box>
  );
};

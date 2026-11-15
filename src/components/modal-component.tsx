import React from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ModalComponentProps {
  isOpen: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  onSave: () => void;
  saveButtonLabel?: string;
  cancelButtonLabel?: string;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  /** Shows a spinner on the save button and disables it. */
  saving?: boolean;
  /** Renders the save button as a destructive (error) action. */
  destructive?: boolean;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onSave,
  saveButtonLabel = "Simpan perubahan",
  cancelButtonLabel = "Batal",
  maxWidth = "sm",
  fullWidth = true,
  saving = false,
  destructive = false,
}) => (
  <Dialog
    open={isOpen}
    onClose={onClose}
    maxWidth={maxWidth}
    fullWidth={fullWidth}
    slotProps={{
      paper: {
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)",
        },
      },
    }}
  >
    <DialogTitle
      component="div"
      sx={{ px: 3, py: 2.25, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: "1px solid", borderColor: "divider" }}
    >
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, lineHeight: 1.4 }}>{title}</h2>
      <IconButton aria-label="Tutup" onClick={onClose} size="small" sx={{ color: "text.secondary", "&:hover": { color: "text.primary", bgcolor: "action.hover" } }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </DialogTitle>

    <DialogContent sx={{ px: 3, py: "24px !important" }}>{children}</DialogContent>

    <DialogActions sx={{ px: 3, py: 2, gap: 1, borderTop: "1px solid", borderColor: "divider" }}>
      <Button onClick={onClose} variant="outlined" color="inherit" sx={{ borderColor: "divider" }}>
        {cancelButtonLabel}
      </Button>
      <Button
        variant="contained"
        color={destructive ? "error" : "primary"}
        onClick={onSave}
        disabled={saving}
        startIcon={saving ? <CircularProgress size={14} color="inherit" /> : undefined}
      >
        {saveButtonLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ModalComponent;

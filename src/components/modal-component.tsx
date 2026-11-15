import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Typography,
  Box,
  Divider,
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
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  isOpen,
  title,
  children,
  onClose,
  onSave,
  saveButtonLabel = "Simpan Perubahan",
  cancelButtonLabel = "Batal",
  maxWidth = "sm",
  fullWidth = true,
}) => {
  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose} 
      maxWidth={maxWidth} 
      fullWidth={fullWidth}
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" component="div" fontWeight="bold">
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Divider />
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mt: 1 }}>
          {children}
        </Box>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button 
          onClick={onClose} 
          variant="text" 
          sx={{ 
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            borderRadius: 2
          }}
        >
          {cancelButtonLabel}
        </Button>
        <Button 
          variant="contained" 
          onClick={onSave}
          sx={{ 
            textTransform: 'none',
            fontWeight: 'bold',
            px: 4,
            borderRadius: 2,
            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
          }}
        >
          {saveButtonLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalComponent;

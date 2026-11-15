import React from "react";
import { Modal, Box, IconButton, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
// import Image from "next/image"; // Removed Next.js Image

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: { id: string; image: string; title: string; body: string }[];
  currentIndex: number;
  onNavigate: (direction: "prev" | "next") => void;
}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 900,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  outline: "none",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  maxHeight: "90vh",
};

const GalleryModal: React.FC<GalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}) => {
  const currentImage = images[currentIndex];

  if (!currentImage) return null;

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "white",
            bgcolor: "rgba(0,0,0,0.5)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            zIndex: 10,
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </IconButton>

        <Box sx={{ position: "relative", width: "100%", height: "70vh", mb: 2 }}>
          {/* Replaced Next.js Image with standard img tag */}
          <img
            src={currentImage.image}
            alt={currentImage.title}
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        </Box>

        <Typography variant="h6" component="h2" sx={{ mt: 2 }}>
          {currentImage.title}
        </Typography>
        <Typography sx={{ mt: 1, color: "text.secondary" }}>
          {currentImage.body}
        </Typography>

        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <IconButton
            onClick={() => onNavigate("prev")}
            disabled={currentIndex === 0}
            sx={{ color: "primary.main" }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </IconButton>
          <IconButton
            onClick={() => onNavigate("next")}
            disabled={currentIndex === images.length - 1}
            sx={{ color: "primary.main" }}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </IconButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default GalleryModal;

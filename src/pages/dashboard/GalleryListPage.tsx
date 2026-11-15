import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Grid,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  CircularProgress,
  Pagination,
} from "@mui/material";
import { Stack } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/useAuth";
import {
  getAllGalleries,
  deleteGallery,
} from "../../controllers/gallery-controller";
import type { GalleryModel } from "@/types/models";

export const GalleryListPage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [galleries, setGalleries] = useState<GalleryModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // =============================
  // Handlers
  // =============================
  const openMenu = (event: React.MouseEvent<HTMLElement>, id: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setIsDeleting(true);
    try {
      await deleteGallery(selectedId);
      toast.success("Gambar berhasil dihapus");
      closeMenu();
      // Refetch galleries
      if (user) {
        const response = await getAllGalleries(page, 12, user.id);
        if (response) setGalleries(response);
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menghapus gambar");
    } finally {
      setIsDeleting(false);
    }
  };

  // =============================
  // Fetch
  // =============================
  useEffect(() => {
    const fetchGalleries = async () => {
      setLoading(true);
      try {
        if (user) {
          const response = await getAllGalleries(page, 12, user.id);
          if (response) setGalleries(response);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, [user, page]); // Add user and page to dependency array

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  // =============================
  // Loading
  // =============================
  if (isLoading || loading) {
    return (
      <Grid container spacing={3}>
        {[...Array(12)].map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton variant="rectangular" height={260} />
            <Skeleton height={28} sx={{ mt: 1 }} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!user) return null;

  // =============================
  // Authorization
  // =============================
  if (user.role !== "admin" && user.role !== "officer" && user.role !== "member") {
    return (
      <Box sx={{ textAlign: "center", mt: 6 }}>
        <Typography variant="h4" color="error">
          Akses Ditolak
        </Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          Anda tidak memiliki izin untuk mengakses halaman ini.
        </Typography>
        <Button
          sx={{ mt: 3 }}
          variant="contained"
          onClick={() => navigate("/")}
        >
          Kembali ke Beranda
        </Button>
      </Box>
    );
  }

  // =============================
  // Render
  // =============================
  return (
    <>
      {/* ================= HEADER ================= */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}
      >
        <Typography variant="h4">Gallery</Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          component={Link}
          to="/dashboard/gallery/create"
        >
          Tambah Foto
        </Button>
      </Box>

      {/* ================= SEARCH ================= */}
      <TextField
        fullWidth
        placeholder="Cari berdasarkan caption"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 4 }}
        slotProps={{ input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        } }}
      />

      {/* ================= EMPTY ================= */}
      {galleries && galleries.data.length === 0 && (
        <Box sx={{ textAlign: "center", mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Gallery tidak ditemukan
          </Typography>
        </Box>
      )}

      {/* ================= GRID ================= */}
      <Grid container spacing={3}>
        {galleries &&
          galleries.data.map((gallery) => (
            <Grid key={gallery.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  transition: "all .35s ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,.15)",
                  },
                  "&:hover img": { transform: "scale(1.1)" },
                  "&:hover .overlay": { opacity: 1 },
                }}
              >
                {/* MENU */}
                <IconButton
                  onClick={(e) => openMenu(e, gallery.id)}
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 10,
                    bgcolor: "rgba(0,0,0,.5)",
                    color: "white",
                  }}
                >
                  <MoreVertIcon />
                </IconButton>

                <Box
                  component="img"
                  src={gallery.image_url}
                  alt={gallery.caption}
                  sx={{
                    width: "100%",
                    height: 260,
                    objectFit: "cover",
                    transition: "transform .5s ease",
                  }}
                />

                {/* OVERLAY */}
                <Box
                  className="overlay"
                  sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: 0,
                    transition: "opacity .3s",
                    background:
                      "linear-gradient(to top, rgba(0,0,0,.85), rgba(0,0,0,.1))",
                    display: "flex",
                    alignItems: "flex-end",
                    p: 2,
                  }}
                >
                  <Typography color="white" noWrap sx={{ fontWeight: 600 }}>
                    {gallery.caption}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
      </Grid>
      {galleries && galleries.meta.last_page > 1 && (
        <Stack
          spacing={2}
          sx={{ mt: 4, display: "flex", justifyContent: "center" }}
        >
          <Pagination
            count={galleries.meta.last_page}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      )}

      {/* ================= MENU ================= */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem component={Link} to={`/dashboard/gallery/edit/${selectedId}`}>{t('crud.edit')}</MenuItem>
        <MenuItem onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <CircularProgress size={18} /> : "Delete"}
        </MenuItem>
      </Menu>
    </>
  );
};
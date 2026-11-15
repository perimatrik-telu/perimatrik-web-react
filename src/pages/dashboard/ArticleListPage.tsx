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
  Chip,
} from "@mui/material";
import { Stack } from "@mui/system";
import SearchIcon from "@mui/icons-material/Search";
import AddBoxIcon from "@mui/icons-material/AddBox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/useAuth";
import {
  getAllArticles,
  deleteArticle,
} from "../../controllers/article-controller";
import type { ArticleModel } from "@/types/models";

export const ArticleListPage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [articles, setArticles] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // =============================
  // Fetch
  // =============================
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const userIdFilter = user?.role !== 'admin' ? user?.id : undefined;
        const response = await getAllArticles({ page, limit: 12, userId: userIdFilter });
        if (response) setArticles(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchArticles();
    }
  }, [page, user]);

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
        {[...Array(8)].map((_, i) => (
          <Grid item key={i} xs={12} sm={6} md={4} lg={3}>
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
  if (user.role !== "admin" && user.role !== "member") {
    return (
      <Box textAlign="center" mt={6}>
        <Typography variant="h4" color="error">
          Akses Ditolak
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
  // Filter
  // =============================
  const filtered =
    articles?.data.filter((a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // =============================
  // Menu handlers
  // =============================
  const openMenu = (e: React.MouseEvent<HTMLButtonElement>, id: string) => {
    setAnchorEl(e.currentTarget);
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
      await deleteArticle(selectedId);
      toast.success("Article deleted successfully");
      setArticles((prev) =>
        prev
          ? { ...prev, data: prev.data.filter((a) => a.id !== selectedId) }
          : prev
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete article");
    } finally {
      setIsDeleting(false);
      closeMenu();
    }
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{
          mb: 4,
          p: 2,
          borderRadius: 3,
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.6)",
          boxShadow: "0 10px 30px rgba(0,0,0,.05)",
        }}
      >
        <TextField
          fullWidth
          placeholder="Cari artikel..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: 99 } }}
        />

        <Button
          component={Link}
          to="/dashboard/article/create"
          variant="contained"
          startIcon={<AddBoxIcon />}
          sx={{
            borderRadius: 99,
            px: 4,
            boxShadow: "0 8px 20px rgba(25,118,210,.3)",
          }}
        >
          Add
        </Button>
      </Stack>

      {/* ================= EMPTY ================= */}
      {filtered.length === 0 && (
        <Box textAlign="center" mt={8}>
          <Typography variant="h6" color="text.secondary">
            Artikel tidak ditemukan
          </Typography>
        </Box>
      )}

      {/* ================= GRID ================= */}
      <Grid container spacing={3}>
        {filtered.map((article) => (
          <Grid item key={article.id} xs={12} sm={6} md={4} lg={3}>
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
                onClick={(e) => openMenu(e, article.id)}
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

              <Chip
                label={article.status === "draft" ? "Draft" : article.status === "inactive" ? "Inactive" : "Published"}
                color={article.status === "draft" ? "default" : article.status === "inactive" ? "error" : "success"}
                size="small"
                sx={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  bgcolor: (article.status === "draft" || article.status === "inactive") ? "rgba(255,255,255,.9)" : undefined,
                  fontWeight: 600,
                }}
              />

              <Box
                component="img"
                src={article.image}
                alt={article.title}
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
                <Typography color="white" fontWeight={600} noWrap>
                  {article.title}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {articles && articles.meta.last_page > 1 && (
        <Stack spacing={2} sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={articles.meta.last_page}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      )}

      {/* ================= MENU ================= */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem component={Link} to={`/dashboard/article/edit/${selectedId}`}>{t('crud.edit')}</MenuItem>
        <MenuItem onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <CircularProgress size={18} /> : "Delete"}
        </MenuItem>
      </Menu>
    </>
  );
};

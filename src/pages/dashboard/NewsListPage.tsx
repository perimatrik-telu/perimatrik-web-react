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
import AddBoxIcon from "@mui/icons-material/AddBox";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { toast } from "react-toastify";

import { useAuth } from "../../hooks/useAuth";
import {
  getAllNews,
  deleteNews,
} from "../../controllers/news-controller";
import type { ArticleModel } from "../../types/models";

export const NewsListPage = () => {
  const { t } = useTranslation();
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [news, setNews] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const userIdFilter = user?.role !== 'admin' ? user?.id : undefined;
        const response = await getAllNews(page, 12, userIdFilter);
        if (response) setNews(response);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNews();
    }
  }, [page, user]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

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

  if (user.role !== "admin" && user.role !== "officer") {
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

  const filtered =
    news?.data.filter((n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

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
      await deleteNews(selectedId);
      toast.success("News deleted successfully");
      setNews((prev) =>
        prev
          ? { ...prev, data: prev.data.filter((n) => n.id !== selectedId) }
          : prev
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete news");
    } finally {
      setIsDeleting(false);
      closeMenu();
    }
  };

  return (
    <>
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
          placeholder="Cari berita..."
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
          to="/dashboard/news/create"
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

      {filtered.length === 0 && (
        <Box textAlign="center" mt={8}>
          <Typography variant="h6" color="text.secondary">
            Berita tidak ditemukan
          </Typography>
        </Box>
      )}

      <Grid container spacing={3}>
        {filtered.map((item) => (
          <Grid item key={item.id} xs={12} sm={6} md={4} lg={3}>
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
              <IconButton
                onClick={(e) => openMenu(e, item.id as string)}
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
                src={item.image}
                alt={item.title}
                sx={{
                  width: "100%",
                  height: 260,
                  objectFit: "cover",
                  transition: "transform .5s ease",
                }}
              />

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
                  {item.title}
                </Typography>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {news && news.meta.last_page > 1 && (
        <Stack spacing={2} sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Pagination
            count={news.meta.last_page}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Stack>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem component={Link} to={`/dashboard/news/edit/${selectedId}`}>{t('crud.edit')}</MenuItem>
        <MenuItem onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? <CircularProgress size={18} /> : "Delete"}
        </MenuItem>
      </Menu>
    </>
  );
};

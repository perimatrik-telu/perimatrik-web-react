import { useTranslation } from "react-i18next";
import { getNewsById, updateNews } from "../../controllers";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { NoDataWidget, Loading } from "../../components";
import { toast } from "react-toastify";
import {
  Box,
  FormLabel,
  TextField,
  Typography,
  Button,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import type { ArticleDetailModel } from "../../types/models";
import { RichTextEditor } from "../../components/RichTextEditor.tsx";
import imageCompression from 'browser-image-compression';


export const EditNewsPage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [newsData, setNewsData] = useState<ArticleDetailModel | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [publishedAt, setPublishedAt] = useState<string>("");
  const [autoPublish, setAutoPublish] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const newsResponse = await getNewsById(id);

        if (newsResponse && newsResponse.data) {
          setNewsData(newsResponse);
          setTitle(newsResponse.data.title || "");
          setBody(newsResponse.data.body || "");
          if (newsResponse.data.image) {
            setPreview(newsResponse.data.image);
          }
          
          if (newsResponse.data.published_at) {
            const date = new Date(newsResponse.data.published_at);
            const formattedDate = date.toISOString().slice(0, 16);
            setPublishedAt(formattedDate);
            setAutoPublish(false);
          } else {
            setAutoPublish(true);
          }
        } else {
          toast.error("Berita tidak ditemukan.");
        }
      } catch (err) {
        console.error("Error fetching news:", err);
        toast.error("Gagal memuat data berita.");
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [id]);

  useEffect(() => {
    if (newsData && newsData.data && newsData.data.title) {
      document.title = `Ubah Berita: ${newsData.data.title} - Dasbor`;
    } else {
      document.title = "Ubah Berita - Dasbor";
    }
  }, [newsData]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      setImage(null);
      setPreview(null);
      return;
    }
    
    let file = files[0];
    setError("");
    setIsUploading(true);
    
    try {
      const options = {
        maxSizeMB: 1, // Max 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      setImage(compressedFile as File);
      setPreview(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error(err);
      setError("Gagal mengompres gambar.");
      setImage(null);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview(null);
    setError("");
  };

  if (loading && !newsData) {
    return <Loading />;
  }

  if (!newsData) {
    return (
      <NoDataWidget
        imageSrc="/images/empty-image.webp"
        message="Berita tidak ditemukan."
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!id) {
      toast.error("ID berita tidak ditemukan.");
      setLoading(false);
      return;
    }

    if (!title || !body) {
      toast.error("Lengkapi semua kolom.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("title", title);
    formData.append("body", body);
    if (image) {
      formData.append("image", image);
    }

    if (user?.role === 'admin' && !autoPublish && publishedAt) {
      formData.append("published_at", publishedAt.replace('T', ' ') + ':00');
    } else if (user?.role === 'admin' && autoPublish) {
      formData.append("published_at", "");
    }

    try {
      const response = await updateNews(id, formData);

      if (response?.success) {
        toast.success("Berita berhasil diperbarui.");
        navigate("/dashboard/news");
      } else {
        toast.error((response as { message?: string } | null)?.message || "Berita gagal diperbarui.");
      }
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error("Terjadi kesalahan saat memperbarui berita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ mb: 3 }}>
        <FormLabel
          htmlFor="news-image"
          sx={{ mb: 1, display: "block", fontWeight: "bold" }}
        >{t('form.gambar')}</FormLabel>

        <Box
          sx={{
            border: "2px dashed #1976d2",
            padding: 2,
            borderRadius: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <input
            id="news-image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: "none" }}
          />
          {!image && (
            <>
              <Button
                variant="contained"
                component="label"
                htmlFor="news-image"
                sx={{ mb: 1 }}
              >{t('form.unggahGambar')}</Button>
              <Typography variant="body2" color="text.secondary">
                Seret dan lepas atau klik untuk memilih gambar
              </Typography>
            </>
          )}

          {isUploading ? (
            <Box sx={{ mt: 2 }}>
              <CircularProgress size={40} color="primary" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{t('form.mengunggah')}</Typography>
            </Box>
          ) : preview && !isUploading ? (
            <Box sx={{ mt: 2 }}>
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "8px",
                  marginBottom: "8px",
                }}
              />
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleRemoveImage}
              >{t('form.hapusGambar')}</Button>
            </Box>
          ) : null}

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ mb: 1, width: "100%" }}>
        <FormLabel
          htmlFor="news-title"
          sx={{ mb: 1, display: "block", fontWeight: "bold" }}
        >{t('form.judul')}</FormLabel>
        <TextField
          id="news-title"
          variant="outlined"
          placeholder={t('form.masukkanJudul')}
          fullWidth
          value={title}
          onChange={handleTitleChange}
          slotProps={{ htmlInput: {
            maxLength: 100,
          }, input: {
            sx: {
              height: 44,
              padding: 0,
            },
          } }}
        />
        <Typography
          variant="body2"
          color={title.length === 100 ? "error" : "text.secondary"}
          sx={{ mt: 1, textAlign: "right" }}
        >
          {title.length}/100
        </Typography>
      </Box>

      <Box>
        <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>{t('form.konten')}</FormLabel>
        <Box sx={{ ".ck-editor__editable": { minHeight: "300px" } }}>
          <RichTextEditor value={body} onChange={setBody} />
        </Box>
      </Box>

      {user?.role === 'admin' && (
        <Box sx={{ mt: 3 }}>
          <FormLabel sx={{ mb: 1, display: "block", fontWeight: "bold" }}>
            Tanggal Terbit
          </FormLabel>
          <FormControlLabel
            control={
              <Switch
                checked={autoPublish}
                onChange={() => setAutoPublish(!autoPublish)}
                name="autoPublish"
                color="primary"
              />
            }
            label="Atur otomatis (sekarang)"
          />
          <TextField
            fullWidth
            type="datetime-local"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            disabled={autoPublish}
            sx={{ mt: 2 }}
            slotProps={{ inputLabel: {
              shrink: true,
            } }}
          />
        </Box>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || isUploading || !title || !body}
        >
          {loading ? "Memperbarui..." : "Simpan"}
        </Button>
      </Box>
    </Box>
  );
};

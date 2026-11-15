import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createArticle } from "../../controllers/index.ts";
import { toast } from "react-toastify";
import { Box, Typography, Button } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useArticleImage } from "../../hooks/useArticleImage";
import { ArticleForm } from "../../components/dashboard/ArticleForm";

type ArticleStatus = "draft" | "active" | "inactive";

export const CreateArticlePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { image, preview, isUploading, error, selectImage, removeImage } = useArticleImage();
  const [loadingStatus, setLoadingStatus] = useState<ArticleStatus | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => { document.title = "Tambah Artikel - Dasbor"; }, []);

  if (!user || (user.role !== "admin" && user.role !== "member")) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography component="h1" sx={{ fontSize: 20, fontWeight: 600, color: "error.main" }}>{t("form.aksesDitolak")}</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>{t("form.kembaliBeranda")}</Button>
      </Box>
    );
  }

  const handleSubmit = async (status: ArticleStatus) => {
    if (loadingStatus || isUploading || status === "inactive") return;
    const isPublishing = status === "active";
    if (isPublishing && (!title.trim() || !body || !image)) {
      toast.error(t("form.lengkapiKolom"));
      return;
    }
    if (isPublishing && user.role === "admin" && !autoPublish && !publishedAt) {
      toast.error(t("form.pilihTanggal"));
      return;
    }
    setLoadingStatus(status);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("body", body);
    formData.append("status", status);
    if (image) formData.append("image", image);
    if (isPublishing && user.role === "admin" && !autoPublish && publishedAt) {
      formData.append("published_at", publishedAt.replace("T", " ") + ":00");
    }
    try {
      const response = await createArticle(formData);
      if (response?.success) {
        toast.success(isPublishing ? "Artikel berhasil dipublish" : "Artikel berhasil disimpan sebagai draft");
        navigate("/dashboard/article");
      } else {
        toast.error(response?.message || "Gagal membuat artikel.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat membuat artikel.");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <ArticleForm
      mode="create" title={title} body={body} image={image} preview={preview}
      imageError={error} isUploading={isUploading} loadingStatus={loadingStatus}
      isAdmin={user.role === "admin"} autoPublish={autoPublish} publishedAt={publishedAt}
      onTitleChange={setTitle} onBodyChange={setBody} onSelectImage={selectImage} onRemoveImage={removeImage}
      onAutoPublishChange={setAutoPublish} onPublishedAtChange={setPublishedAt}
      onSubmit={(status) => { void handleSubmit(status); }}
    />
  );
};

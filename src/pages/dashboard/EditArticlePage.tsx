import { useTranslation } from "react-i18next";
import { getArticleById, updateArticle } from "../../controllers/index.ts";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Alert, Box, Typography, Button, CircularProgress, Stack } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useArticleImage } from "../../hooks/useArticleImage";
import { ArticleForm } from "../../components/dashboard/ArticleForm";
import { PageHeader } from "../../components/dashboard/PageHeader";
import { SectionCard } from "../../components/dashboard/SectionCard";
import type { ArticleDetailModel } from "../../types/models";

type ArticleStatus = "draft" | "active" | "inactive";

export const EditArticlePage = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [articleData, setArticleData] = useState<ArticleDetailModel | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { image, preview, isUploading, error, selectImage, removeImage } = useArticleImage(articleData?.data.image);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retry, setRetry] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState<ArticleStatus | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [autoPublish, setAutoPublish] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      if (!id) { setLoading(false); return; }
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getArticleById(id);
        if (cancelled) return;
        if (response?.data) {
          setArticleData(response);
          setTitle(response.data.title || "");
          setBody(response.data.body || "");
          const date = response.data.published_at;
          setPublishedAt(date ? new Date(date).toISOString().slice(0, 16) : null);
          setAutoPublish(!date);
        } else {
          setArticleData(null);
          setLoadError(true);
        }
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchData();
    return () => { cancelled = true; };
  }, [id, retry]);

  useEffect(() => {
    document.title = articleData?.data.title ? `Ubah Artikel: ${articleData.data.title} - Dasbor` : "Ubah Artikel - Dasbor";
  }, [articleData]);

  if (!user || (user.role !== "admin" && user.role !== "member")) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography component="h1" sx={{ fontSize: 20, fontWeight: 600, color: "error.main" }}>{t("form.aksesDitolak")}</Typography>
        <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate("/")}>{t("form.kembaliBeranda")}</Button>
      </Box>
    );
  }

  if (loading) {
    return <Stack role="status" spacing={1.5} sx={{ alignItems: "center", py: 10 }}><CircularProgress size={28} /><Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t("articleForm.loading")}</Typography></Stack>;
  }

  if (!articleData || loadError) {
    return (
      <Stack spacing={3}>
        <PageHeader title={t("articleForm.editTitle")} />
        <SectionCard>
          <Alert severity={loadError ? "error" : "info"}>{t(loadError ? "articleForm.loadError" : "articleForm.notFound")}</Alert>
          <Stack direction="row" sx={{ gap: 1.25, mt: 2.5, flexWrap: "wrap" }}>
            <Button variant="outlined" color="inherit" sx={{ borderColor: "divider" }} onClick={() => navigate("/dashboard/article")}>{t("articleForm.back")}</Button>
            {loadError && <Button variant="contained" onClick={() => setRetry((value) => value + 1)}>{t("articleForm.retry")}</Button>}
          </Stack>
        </SectionCard>
      </Stack>
    );
  }

  const handleSubmit = async (status: ArticleStatus) => {
    if (!id || loadingStatus || isUploading) return;
    const isPublishing = status === "active";
    if (isPublishing && (!title.trim() || !body)) {
      toast.error(t("articleForm.completeContent"));
      return;
    }
    if (isPublishing && user.role === "admin" && !autoPublish && !publishedAt) {
      toast.error(t("form.pilihTanggal"));
      return;
    }
    setLoadingStatus(status);
    const formData = new FormData();
    // Laravel accepts multipart updates through POST with a method override.
    formData.append("_method", "PUT");
    formData.append("title", title);
    formData.append("body", body);
    formData.append("status", status);
    if (image) formData.append("image", image);
    if (isPublishing && user.role === "admin" && !autoPublish && publishedAt) {
      formData.append("published_at", publishedAt.replace("T", " ") + ":00");
    } else if (isPublishing && user.role === "admin" && autoPublish) {
      formData.append("published_at", "");
    }
    try {
      const response = await updateArticle(id, formData);
      if (response?.success) {
        const messages = { active: "Artikel berhasil dipublish", draft: "Artikel berhasil disimpan sebagai draft", inactive: "Artikel berhasil dinonaktifkan" };
        toast.success(messages[status]);
        navigate("/dashboard/article");
      } else {
        toast.error(response?.message || "Gagal memperbarui artikel.");
      }
    } catch {
      toast.error("Terjadi kesalahan saat memperbarui artikel.");
    } finally {
      setLoadingStatus(null);
    }
  };

  return (
    <ArticleForm
      mode="edit" title={title} body={body} image={image} preview={preview}
      imageError={error} isUploading={isUploading} loadingStatus={loadingStatus} currentStatus={articleData.data.status}
      isAdmin={user.role === "admin"} autoPublish={autoPublish} publishedAt={publishedAt}
      onTitleChange={setTitle} onBodyChange={setBody} onSelectImage={selectImage} onRemoveImage={removeImage}
      onAutoPublishChange={setAutoPublish} onPublishedAtChange={setPublishedAt}
      onSubmit={(status) => { void handleSubmit(status); }}
    />
  );
};

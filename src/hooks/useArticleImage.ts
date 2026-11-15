import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import { useTranslation } from "react-i18next";

export const useArticleImage = (existingImage?: string | null) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!image) {
      setLocalPreview(null);
      return;
    }
    const url = URL.createObjectURL(image);
    setLocalPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  const selectImage = async (file: File) => {
    setError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError(t("articleForm.invalidImage"));
      return;
    }
    setIsUploading(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });
      setImage(compressed);
    } catch {
      setError(t("form.gagalKompres"));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setError("");
  };

  return {
    image,
    preview: image ? localPreview : existingImage || null,
    isUploading,
    error,
    selectImage,
    removeImage,
  };
};

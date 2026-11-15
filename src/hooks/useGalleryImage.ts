import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import imageCompression from "browser-image-compression";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

export const useGalleryImage = (existingImage: string | null) => {
  const { t } = useTranslation();
  const [image, setImage] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [removedExisting, setRemovedExisting] = useState(false);
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
    if (!acceptedTypes.includes(file.type)) {
      setError(t("galleryForm.invalidImage"));
      return;
    }
    setIsUploading(true);
    try {
      if (file.type === "image/gif" || file.type === "image/svg+xml") {
        if (file.size > 2024 * 1024) {
          setError(t("galleryForm.largeImage"));
          return;
        }
        setImage(file);
      } else {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          // The gallery API accepts PNG but does not accept WebP uploads.
          fileType: file.type === "image/webp" ? "image/png" : file.type,
        });
        const name = file.type === "image/webp" ? `${file.name.replace(/\.[^.]+$/, "")}.png` : file.name;
        setImage(new File([compressed], name, { type: compressed.type }));
      }
      setRemovedExisting(false);
    } catch {
      setError(t("form.gagalKompres"));
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setRemovedExisting(Boolean(existingImage));
    setError("");
  };

  const restoreImage = () => {
    setImage(null);
    setRemovedExisting(false);
    setError("");
  };

  return {
    image,
    preview: image ? localPreview : removedExisting ? null : existingImage,
    removedExisting,
    isUploading,
    error,
    selectImage,
    removeImage,
    restoreImage,
  };
};

import { useParams } from "react-router-dom";
import { GalleryEditorPage } from "../../components/dashboard/GalleryEditorPage";

export const EditGalleryPage = () => {
  const { id } = useParams<{ id: string }>();
  return <GalleryEditorPage key={id} mode="edit" id={id} />;
};

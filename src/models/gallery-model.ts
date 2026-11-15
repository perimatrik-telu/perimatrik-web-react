export interface GalleryModel {
  success: boolean;
  message: string;
  data: GalleryItem[];
}

export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  isHeader: boolean;
  category: string;
  body: string;
}

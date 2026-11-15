// perimatrik-web-react/src/types/models.ts

// Define GalleryData interface for a single gallery item
export interface GalleryData {
  id: string;
  image: string; // the filename
  image_url: string; // the full url
  caption: string;
  latitude?: number;
  longitude?: number;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
}

// Define GalleryModel interface
export interface GalleryModel {
  data: GalleryData[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Define GalleryDetailModel interface for a single gallery
export interface GalleryDetailModel {
  data: GalleryData;
}

// Define ArticleModel interface for lists of articles
export interface ArticleModel {
  data: {
    id: string;
    image: string;
    title: string;
    body: string;
    slug: string;
    status: "draft" | "active" | "inactive";
    postingAt: string;
    author: string;
    views: number; // Added views property
    published_at: string | null; // Add published_at
  }[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

// Define ArticleDetailModel interface for a single article

export interface ArticleDetailModel {

  data: {

    id: string;

    image: string;

    title: string;

    body: string;

    slug: string;
    status: "draft" | "active" | "inactive";

    postingAt: string;

    author: string;
    published_at: string | null; // Add published_at
    views: number; // Add views property

  };

  // Add other properties if available in your API response

}



// Define User interface
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null; // Added avatar property
  role: 'admin' | 'member' | 'officer';
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleModel {
  success: boolean;
  message: string;
  data: ArticleItem[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface ArticleDetailModel {
  success: boolean;
  message: string;
  data: ArticleItem;
}

export interface ArticleItem {
  id: string;
  image: string;
  title: string;
  body: string;
  slug: string;
  status: "draft" | "active" | "inactive";
  views: number;
  author: string;
  tags?: Array<string>;
  postingAt: string;
  published_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

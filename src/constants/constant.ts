export const API_DOMAIN =
  import.meta.env.VITE_IS_PRODUCTION === "true"
    ? "https://api.perimatrik.org"
    : "http://127.0.0.1:8000";

export const MAIN_URL = `${API_DOMAIN}/api/v1/`;

export const GALLERY_DATA_URL = "content/gallery";

export const ARTICLE_DATA_URL = "content/article";
export const DETAIL_ARTICLE_DATA_URL = "content/article";
export const ARTICLE_BY_ID_DATA_URL = "content/article/id";

export const NEWS_DATA_URL = "content/news";
export const DETAIL_NEWS_DATA_URL = "content/news";
export const NEWS_BY_ID_DATA_URL = "content/news/id";

// Route Constants
export const HOME_ROUTE = "/";
export const ABOUT_ROUTE = "/about";
export const ARTICLE_ROUTE = "/article";
export const ARTICLE_DETAIL_ROUTE = "/article/detail/:slug";
export const NEWS_ROUTE = "/news";
export const NEWS_DETAIL_ROUTE = "/news/detail/:slug";
export const GALLERY_ROUTE = "/gallery";
export const LOGIN_ROUTE = "/login";
export const DASHBOARD_ROUTE = "/dashboard";
export const ARTICLE_LIST_ROUTE = "/dashboard/article";
export const CREATE_ARTICLE_ROUTE = "/dashboard/article/create";
export const EDIT_ARTICLE_ROUTE = "/dashboard/article/edit/:slug";
export const NEWS_LIST_ROUTE = "/dashboard/news";
export const CREATE_NEWS_ROUTE = "/dashboard/news/create";
export const EDIT_NEWS_ROUTE = "/dashboard/news/edit/:id";
export const GALLERY_LIST_ROUTE = "/dashboard/gallery";
export const GALLERY_POSITION_ROUTE = "/dashboard/gallery/position";
export const BANNER_ROUTE = "/dashboard/setting/content/banner";
export const FORCE_ROUTE = "/dashboard/setting/content/force";
export const ACCESS_ROUTE = "/dashboard/setting/privacy/access";

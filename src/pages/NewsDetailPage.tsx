import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faLinkedinIn,
  faXTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCalendarDays,
  faEye,
  faPerson,
} from "@fortawesome/free-solid-svg-icons";

import { getNewsBySlug, getRelatedNews } from "../controllers";
import { Loading, NoDataWidget, CommentSection } from "../components";
import type { ArticleDetailModel, ArticleModel } from "../types/models";
import { useThemeContext } from "../context/theme-context";
import { API_DOMAIN } from "../constants/constant";
import { BackToTopPartial } from "../partials";

import "../../public/css/article-detail.css";

export const NewsDetailPage = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { mode } = useThemeContext();
  const [newsData, setNewsData] = useState<ArticleDetailModel | null>(null);
  const [relatedNews, setRelatedNews] = useState<ArticleModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  useEffect(() => {
    if (newsData) {
      document.title = `${newsData.data.title} - PERIMATRIK`;
    }
  }, [newsData]);

  const fetchData = async () => {
    if (!slug) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [newsResponse, relatedResponse] = await Promise.all([
        getNewsBySlug(slug),
        getRelatedNews(slug),
      ]);

      if (!newsResponse) {
        toast.error("News not found");
        navigate("/news");
        return;
      }

      setNewsData(newsResponse);
      setRelatedNews(relatedResponse);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  if (!newsData) {
    return (
      <NoDataWidget
        imageSrc="/images/empty-image.webp"
        message="News not found"
      />
    );
  }

  const { id, title, author, postingAt, views, image, body } = newsData.data;
  
  const shareUrl = `${API_DOMAIN}/share/news/${slug}`;


  const shareButtonsNode = (className: string) => (
    <div className={`card share-card mb-4 ${className}`}>
      <div className="card-body text-center">
        <h5 className="mb-3">{t('detail.shareNews')}</h5>
        <div className="share-buttons">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              `*${title}*\n\nBaca selengkapnya di:\n${shareUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faWhatsapp} />
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              shareUrl
            )}&text=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faXTwitter} />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              shareUrl
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
              shareUrl
            )}&title=${encodeURIComponent(title)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="article-detail-page" data-theme={mode}>
      <div className="container">
        <div className="row">
          {/* ================= MAIN CONTENT ================= */}
          <div className="col-lg-8">
            {/* HEADER */}
            <header className="article-header">
              <h1 className="article-title">{title}</h1>

              <div className="article-meta">
                <span>
                  <FontAwesomeIcon icon={faPerson} /> {author}
                </span>
                <span>
                  <FontAwesomeIcon icon={faCalendarDays} />{" "}
                  {format(new Date(postingAt), "MMMM dd, yyyy")}
                </span>
                <span>
                  <FontAwesomeIcon icon={faEye} /> {views} views
                </span>
              </div>
            </header>

            {/* MOBILE SHARE */}
            {shareButtonsNode("d-block d-lg-none")}

            {/* HERO IMAGE */}
            <figure className="article-hero-image">
              <img src={image} alt={title} />
            </figure>

            {/* CONTENT */}
            <article
              className="article-detail-content"
              dangerouslySetInnerHTML={{ __html: body }}
            />

            {/* DISCUSSION SECTION */}
            <CommentSection newsId={id} />
          </div>

          {/* ================= SIDEBAR ================= */}
          <div className="col-lg-4">
            <aside className="sidebar">
              {/* SHARE */}
              {shareButtonsNode("d-none d-lg-block")}

              {/* RELATED */}
              <div className="card related-card">
                <div className="card-header">{t('detail.otherNews')}</div>
                <div className="card-body">
                  {relatedNews?.data?.length ? (
                    relatedNews.data.map((item, index) => (
                      <Link
                        to={`/news/detail/${item.slug}`}
                        key={index}
                        className="related-article"
                      >
                        <img src={item.image} alt={item.title} />
                        <div>
                          <h6>{item.title}</h6>
                          <span>
                            {format(new Date(item.postingAt), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted small">
                      No related news found.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <BackToTopPartial />
    </div>
  );
};

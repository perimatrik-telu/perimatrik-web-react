import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import "../../public/css/article-list.css";

import { getAllArticles } from "../controllers";
import { Loading, NoDataWidget } from "../components";
import { Box, Pagination } from "@mui/material";
import { useThemeContext } from "../context/theme-context";

interface ArticleItem {
  id: string | number;
  image: string;
  title: string;
  slug: string;
  postingAt: string;
  author: string;
  body: string;
}

interface ArticleResponse {
  data: ArticleItem[];
  meta: {
    current_page: number;
    last_page: number;
  };
}

export const ArticlePage = () => {
  const { t } = useTranslation();
  const { mode } = useThemeContext();
  useEffect(() => {
    document.title = "Articles - PERIMATRIK";
  }, []);

  const [articlesData, setArticlesData] = useState<ArticleResponse | null>(
    null
  );
  const [allArticles, setAllArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAllArticlesForYearFilter = async () => {
      try {
        const response = await getAllArticles({ page: 1, limit: 1000 });
        if (response) setAllArticles(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllArticlesForYearFilter();
    fetchArticles(currentPage, itemsPerPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const fetchArticles = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await getAllArticles({ page, limit });
      setArticlesData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const yearsSet = new Set<number>();
  allArticles.forEach((article) => {
    const year = new Date(article.postingAt).getFullYear();
    if (!isNaN(year)) {
      yearsSet.add(year);
    }
  });

  const articleYearsList = Array.from(yearsSet);
  const minYear =
    articleYearsList.length > 0
      ? Math.min(...articleYearsList)
      : new Date().getFullYear();
  const maxYear = new Date().getFullYear();

  const articleYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const filteredArticles =
    articlesData?.data
      .filter((article) =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((article) =>
        selectedYear
          ? new Date(article.postingAt).getFullYear() === parseInt(selectedYear)
          : true
      ) || [];

  if (loading) return <Loading />;

  return (
    <div className="article-page" data-theme={mode}>
      {/* ================= HERO ================= */}
      <section className="article-hero">
        <div className="container text-center">
          <h1>Artikel & Cerita</h1>
          <p>
            Cerita perjalanan, kegiatan, dan nilai-nilai yang kami bawa dari
            alam bebas
          </p>
        </div>
      </section>

      {/* ================= LIST ================= */}
      <section className="article-list-content">
        <div className="container">
          {/* FILTER BAR */}
          <div className="article-filter-bar mb-5">
            <div className="article-search">
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="article-year-filter">
              <select
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(e.target.value || null)}
              >
                <option value="">{t("form.semuaTahun")}</option>
                {articleYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="row g-4">
              {filteredArticles.map((item) => (
                <div
                  key={item.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <Link
                    to={`/article/detail/${item.slug}`}
                    className="text-decoration-none"
                  >
                    <article className="article-card-new">
                      <div className="article-image">
                        <img src={item.image} alt={item.title} loading="lazy" />
                        <div className="article-image-overlay" />
                        <div className="article-date">
                          {format(new Date(item.postingAt), "MMM dd, yyyy")}
                        </div>
                      </div>

                      <div className="article-info">
                        <div className="article-author">{item.author}</div>

                        <h3>{item.title}</h3>

                        <div
                          className="article-excerpt"
                          dangerouslySetInnerHTML={{
                            __html: item.body,
                          }}
                        />
                      </div>
                    </article>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <Box
              minHeight="20vh"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <NoDataWidget
                imageSrc="/images/empty-image.webp"
                message={t("article.noArticle")}
              />
            </Box>
          )}

          {/* PAGINATION */}
          {articlesData && articlesData.meta.last_page > 1 && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginTop={5}
              marginBottom={2}
            >
              <Pagination
                count={articlesData.meta.last_page}
                page={currentPage}
                onChange={(_event, value) => setCurrentPage(value)}
                color="primary"
              />
            </Box>
          )}
        </div>
      </section>
    </div>
  );
};

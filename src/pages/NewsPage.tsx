import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import "../../public/css/article-list.css";

import { getAllNews } from "../controllers";
import { Loading, NoDataWidget } from "../components";
import { Box, Pagination } from "@mui/material";
import { useThemeContext } from "../context/theme-context";

interface NewsItem {
  id: string | number;
  image: string;
  title: string;
  slug: string;
  postingAt: string;
  author: string;
  body: string;
}

interface NewsResponse {
  data: NewsItem[];
  meta: {
    current_page: number;
    last_page: number;
  };
}

export const NewsPage = () => {
  const { t } = useTranslation();
  const { mode } = useThemeContext();
  useEffect(() => {
    document.title = "News - PERIMATRIK";
  }, []);

  const [newsData, setNewsData] = useState<NewsResponse | null>(null);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  useEffect(() => {
    const fetchAllNewsForYearFilter = async () => {
      try {
        const response = await getAllNews(1, 1000);
        if (response) setAllNews(response.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAllNewsForYearFilter();
    fetchNews(currentPage, itemsPerPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear]);

  const fetchNews = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await getAllNews(page, limit);
      setNewsData(response);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const yearsSet = new Set<number>();
  allNews.forEach((item) => {
    const year = new Date(item.postingAt).getFullYear();
    if (!isNaN(year)) {
      yearsSet.add(year);
    }
  });

  const newsYearsList = Array.from(yearsSet);
  const minYear =
    newsYearsList.length > 0
      ? Math.min(...newsYearsList)
      : new Date().getFullYear();
  const maxYear = new Date().getFullYear();

  const newsYears = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => maxYear - i
  );

  const filteredNews =
    newsData?.data
      .filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((item) =>
        selectedYear
          ? new Date(item.postingAt).getFullYear() === parseInt(selectedYear)
          : true
      ) || [];

  if (loading) return <Loading />;

  return (
    <div className="article-page" data-theme={mode}>
      <section className="article-hero">
        <div className="container text-center">
          <h1>Berita & Informasi</h1>
          <p>
            Kumpulan berita terkini seputar lingkungan, kepencintaalaman, 
            dan informasi umum lainnya.
          </p>
        </div>
      </section>

      <section className="article-list-content">
        <div className="container">
          <div className="article-filter-bar mb-5">
            <div className="article-search">
              <input
                type="text"
                placeholder="Cari berita..."
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
                {newsYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredNews.length > 0 ? (
            <div className="row g-4">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  className="col-12 col-sm-6 col-md-4 col-lg-3"
                >
                  <Link
                    to={`/news/detail/${item.slug}`}
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
                message={t("news.noNews")}
              />
            </Box>
          )}

          {newsData && newsData.meta.last_page > 1 && (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginTop={5}
              marginBottom={2}
            >
              <Pagination
                count={newsData.meta.last_page}
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

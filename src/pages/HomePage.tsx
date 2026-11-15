import { useTranslation } from "react-i18next";
import { Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import Masonry from "react-masonry-css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../../public/css/home.css";
import "../../public/css/article-list.css";
import { useEffect, useState } from "react";
import { getAllArticles } from "../controllers";
import type { ArticleItem } from "../models/article-model";
import { useThemeContext } from "../context/theme-context";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faUsers,
  faTree,
  faPenNib,
} from "@fortawesome/free-solid-svg-icons";
import { NoDataWidget } from "../components";
import { motion } from "framer-motion";
import { Paper, Typography, Box } from "@mui/material";

const HomePage = () => {
  const { t } = useTranslation();
  const { mode } = useThemeContext();
  useEffect(() => {
    document.title = "Welcome Home - PERIMATRIK";
  }, []);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getAllArticles({ page: 1, limit: 4 });
        if (response) {
          setArticles(response.data);
        }
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);
  const banners = [
    {
      id: 1,
      image: "/images/hightlight/1.webp",
      title: "PERIMATRIK TELKOM UNIVERSITY",
    },
    { id: 2, image: "/images/hero-image.webp", title: "SALAM RIMBA LESTARI" },
  ];

  const renderPrevButton = () => (
    <div className="swiper-button-prev">
      <FontAwesomeIcon icon={faChevronLeft} />
    </div>
  );

  const renderNextButton = () => (
    <div className="swiper-button-next">
      <FontAwesomeIcon icon={faChevronRight} />
    </div>
  );

  return (
    <div data-theme={mode}>
      {/* ================= HERO ================= */}
      <Carousel className="hero-carousel" controls indicators>
        {banners.map((item) => (
          <Carousel.Item key={item.id} className="hero-item">
            <img src={item.image} className="hero-image" />
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1>{item.title}</h1>
              <p>{t('home.heroTagline')}</p>
              <Link to="/about" className="btn btn-hero">
                Jelajahi Kami
              </Link>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* ================= ABOUT ================= */}
      <section className="section about-home-section overflow-hidden position-relative" style={{ backgroundColor: 'var(--background-default)' }}>
        {/* Abstract Background Elements with Theme Colors */}
        <div className="position-absolute d-none d-lg-block" style={{ top: '10%', left: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(230, 120, 23, 0.08) 0%, transparent 70%)', zIndex: 0 }} />
        <div className="position-absolute d-none d-lg-block" style={{ bottom: '10%', right: '-5%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 152, 0, 0.05) 0%, transparent 70%)', zIndex: 0 }} />

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.175, 0.885, 0.32, 1.275] }}
              >
                <div className="position-relative d-inline-block">
                  {/* Main Image with Premium Frame and Colored Shadow */}
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <img
                      src="/images/image-peri.webp"
                      className="img-fluid rounded-4"
                      alt="PERIMATRIK Experience"
                      style={{ 
                        border: '8px solid white',
                        boxShadow: '0 40px 80px rgba(230, 120, 23, 0.15)',
                        maxWidth: '100%',
                        height: 'auto',
                        filter: 'contrast(1.05)'
                      }}
                    />
                    
                    {/* Floating Experience Badge with Gradient */}
                    <motion.div 
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                      className="position-absolute d-none d-md-block" 
                      style={{ bottom: '-20px', right: '-20px', zIndex: 3 }}
                    >
                      <Paper 
                        elevation={15} 
                        sx={{ 
                          p: 3, 
                          borderRadius: 5, 
                          background: 'linear-gradient(135deg, #e67817 0%, #ff9800 100%)', 
                          color: 'white', 
                          textAlign: 'center', 
                          minWidth: '180px',
                          boxShadow: '0 15px 30px rgba(230, 120, 23, 0.4)'
                        }}
                      >
                        <Typography variant="h3" fontWeight="900" sx={{ mb: -0.5, letterSpacing: -1 }}>22+</Typography>
                        <Typography variant="caption" sx={{ fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.9 }}>{t('home.established')}</Typography>
                      </Paper>
                    </motion.div>
                  </div>

                  {/* Geometric Background Decoration */}
                  <div className="position-absolute" style={{ top: '-30px', left: '-30px', width: '100%', height: '100%', border: '2px dashed rgba(230, 120, 23, 0.3)', borderRadius: '32px', zIndex: 1 }} />
                </div>
              </motion.div>
            </div>

            <div className="col-lg-6">
              <div className="ps-lg-5">
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{ width: 40, height: 2, bgcolor: '#e67817' }} />
                    <Typography variant="overline" sx={{ color: '#e67817', fontWeight: 900, letterSpacing: 3, fontSize: '0.75rem' }}>
                      UKM PECINTA ALAM
                    </Typography>
                  </Box>

                  <Typography variant="h2" fontWeight="900" sx={{ mb: 4, letterSpacing: '-2px', lineHeight: 1, color: 'var(--text-primary)' }}>
                    Menempa Karakter di <br/>
                    <span style={{ 
                      background: 'linear-gradient(90deg, #e67817 0%, #ffb74d 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}>{t('home.membersHighlight')}</span>
                  </Typography>
                  
                  <Typography variant="body1" sx={{ mb: 5, fontSize: '1.15rem', color: 'text.secondary', lineHeight: 1.8, textAlign: 'justify' }}>
                    <span dangerouslySetInnerHTML={{ __html: t('home.membersDesc') }} />
                  </Typography>
                </motion.div>

                <div className="row g-4 mt-2">
                  {[
                    { icon: faUsers, title: "Persaudaraan", desc: "Ikatan kuat lintas angkatan.", color: '#e67817' },
                    { icon: faTree, title: "Pelestarian", desc: "Dedikasi menjaga alam tetap hijau.", color: '#4caf50' }
                  ].map((item, i) => (
                    <div className="col-sm-6" key={i}>
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            borderRadius: 4,
                            bgcolor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white',
                            border: '1px solid',
                            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            borderBottom: `4px solid ${item.color}`,
                            height: '100%',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)'
                            }
                          }}
                        >
                          <Box sx={{ 
                            width: 45, 
                            height: 45, 
                            borderRadius: 2, 
                            bgcolor: `${item.color}20`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            mb: 2 
                          }}>
                            <FontAwesomeIcon icon={item.icon} style={{ color: item.color }} size="lg" />
                          </Box>
                          <Typography variant="subtitle1" fontWeight="800" sx={{ mb: 0.5, color: 'var(--text-primary)' }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {item.desc}
                          </Typography>
                        </Paper>
                      </motion.div>
                    </div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-5"
                >
                  <Link 
                    to="/about" 
                    className="btn btn-primary rounded-pill px-5 py-3 shadow-lg"
                    style={{ 
                      fontWeight: '900',
                      background: 'linear-gradient(135deg, #e67817 0%, #ff9800 100%)',
                      border: 'none',
                      fontSize: '1rem',
                      letterSpacing: '1px',
                      boxShadow: '0 15px 35px rgba(230, 120, 23, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    PELAJARI JEJAK KAMI &rarr;
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DIVISI ================= */}
      <section className="section division-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">{t('home.divisionTitle')}</h2>
            <p className="section-subtitle">
              {t('home.divisionSubtitle')}
            </p>
          </div>

          <div className="division-grid">
            {[
              {
                name: "Gunung Hutan",
                desc: "Eksplorasi dan survival di alam bebas",
                img: "gunung-hutan",
              },
              {
                name: "Arus Deras",
                desc: "Jeram, rafting, dan penyelamatan air",
                img: "arus-deras",
              },
              {
                name: "Rock Climbing",
                desc: "Panjat tebing & vertical rescue",
                img: "rock-climbing",
              },
              {
                name: "Konservasi",
                desc: "Pelestarian lingkungan & edukasi alam",
                img: "konservasi",
              },
              {
                name: "Jurnalistik",
                desc: "Dokumentasi & cerita perjalanan",
                img: "jurnalistik",
              },
            ].map((item, i) => (
              <div className="division-card" key={i}>
                <div className="division-icon">
                  <img
                    src={`/images/division/${item.img}.webp`}
                    alt={item.name}
                    loading="lazy"
                  />
                </div>
                <h5>{item.name}</h5>
                <p>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= ARTIKEL ================= */}
      <section className="section section-light">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title text-start">{t('home.articleTitle')}</h2>
            <Link
              to="/article"
              className={mode === "dark" ? "link-light" : "link-dark"}
            >
              Lihat Semua
            </Link>
          </div>

          {loading ? (
            /* Skeleton sederhana, tidak bikin layout loncat */
            <div className="row g-4">
              {[1, 2, 3].map((i) => (
                <div className="col-md-4" key={i}>
                  <div
                    style={{
                      height: 260,
                      borderRadius: 20,
                      background:
                        mode === "dark"
                          ? "rgba(255, 255, 255, 0.06)"
                          : "#eaeaea",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : articles.length === 0 ? (
            <NoDataWidget
              compact
              icon={faPenNib}
              message={t("home.noArticle")}
              description={t("home.noArticleDesc")}
            />
          ) : (
            <div className="swiper-container-wrapper">
              <Swiper
                modules={[Navigation]}
                spaceBetween={24}
                slidesPerView={1}
                navigation={{
                  prevEl: ".swiper-button-prev",
                  nextEl: ".swiper-button-next",
                }}
                breakpoints={{
                  768: { slidesPerView: 2 },
                  1200: { slidesPerView: 3 },
                }}
              >
                {articles.map((article) => (
                  <SwiperSlide key={article.id}>
                    <Link
                      to={`/article/detail/${article.slug}`}
                      className="text-decoration-none"
                    >
                      <article className="article-card-new">
                        <div className="article-image">
                          <img src={article.image} alt={article.title} loading="lazy" />
                          <div className="article-image-overlay" />
                          <div className="article-date">
                            {format(
                              new Date(article.postingAt),
                              "MMM dd, yyyy",
                            )}
                          </div>
                        </div>

                        <div className="article-info">
                          <div className="article-author">{article.author}</div>

                          <h3>{article.title}</h3>

                          <div
                            className="article-excerpt"
                            dangerouslySetInnerHTML={{
                              __html: article.body,
                            }}
                          />
                        </div>
                      </article>
                    </Link>
                  </SwiperSlide>
                ))}
                {renderPrevButton()}
                {renderNextButton()}
              </Swiper>
            </div>
          )}
        </div>
      </section>

      {/* ================= LEARN TO BE US ================= */}
      <section className="section home-image-section">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-title">{t('home.learnToBeUs')}</h2>
          </div>

          <Masonry
            breakpointCols={{
              default: 3,
              1200: 3,
              992: 2,
              576: 1,
            }}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {[
              "/images/hightlight/1.webp",
              "/images/hightlight/2.webp",
              "/images/hightlight/3.webp",
              "/images/hightlight/4.webp",
              "/images/hightlight/5.webp",
              "/images/hightlight/6.webp",
              "/images/hightlight/7.webp",
              "/images/hightlight/8.webp",
            ].map((img, i) => (
              <div key={i}>
                <img
                  src={img}
                  alt={`Learn To Be Us ${i + 1}`}
                  className="learn-image"
                  loading="lazy"
                />
              </div>
            ))}
          </Masonry>
        </div>
      </section>

      {/* ================= VIDEO ================= */}
      <section className="section section-dark">
        <div className="container text-center">
          <h2 className="video-title">
            Salam Rimba Lestari <br />
            <span>{t('home.liar')}</span>
          </h2>

          <div className="video-wrapper">
            <iframe
              src="https://www.youtube.com/embed/p4aH444DzUU"
              allowFullScreen
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

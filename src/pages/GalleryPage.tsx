import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "react-bootstrap";
import Masonry from "react-masonry-css";
import { getAllGalleries } from "../controllers/gallery-controller";
import type { GalleryData } from "@/types/models";
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "../../public/css/gallery.css";
import { Box } from "@mui/material";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import NoDataWidget from "@/components/no-data-widget";
import InfiniteScroll from "react-infinite-scroll-component";
import * as LazyLoadImageModule from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Loading } from "@/components";
import { useThemeContext } from "../context/theme-context";
import MapboxView from "@/components/MapboxView";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import PublicIcon from "@mui/icons-material/Public";
import MapIcon from "@mui/icons-material/Map";

interface LazyLoadImageProps {
  src: string;
  alt?: string;
  effect?: string;
  className?: string;
  width?: string | number;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const LazyLoadImage = (
  (LazyLoadImageModule as unknown as { LazyLoadImage?: React.ComponentType<LazyLoadImageProps> }).LazyLoadImage ??
  (LazyLoadImageModule as unknown as { default?: { LazyLoadImage?: React.ComponentType<LazyLoadImageProps> } }).default?.LazyLoadImage
) as React.ComponentType<LazyLoadImageProps>;

export const GalleryPage: React.FC = () => {
  const { t } = useTranslation();
  const { mode } = useThemeContext();
  const [galleries, setGalleries] = useState<GalleryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);
  const [lightboxController, setLightboxController] = useState({
    toggler: false,
    slide: 1,
  });

  function openLightboxOnSlide(number: number) {
    setLightboxController({
      toggler: !lightboxController.toggler,
      slide: number,
    });
  }

  const fetchGalleries = async () => {
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    const currentPage = pageRef.current;

    try {
      const response = await getAllGalleries(currentPage, 12);
      const nextGalleries = response?.data ?? [];

      if (nextGalleries.length > 0) {
        setGalleries((prevGalleries) => {
          const existingIds = new Set(prevGalleries.map((item) => item.id));
          const uniqueGalleries = nextGalleries.filter(
            (item) => !existingIds.has(item.id)
          );

          return [...prevGalleries, ...uniqueGalleries];
        });
        pageRef.current = currentPage + 1;
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Gallery - PERIMATRIK";
    fetchGalleries();
  }, []);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const sources = galleries ? galleries.map((item) => item.image_url) : [];

  return (
    <Container fluid className="my-5 px-5" data-theme={mode}>
      <Row className="mb-4">
        <Col className="text-center">
          <h1 className="mb-2">{t("gallery.title")}</h1>
          <p style={{ color: "var(--text-secondary)" }}>{t('gallery.subtitle')}</p>        
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 2 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, val) => { if(val) setViewMode(val); }}
              aria-label="view mode"
              color="primary"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon sx={{ mr: 1 }} /> Grid
              </ToggleButton>
              <ToggleButton value="map" aria-label="map view">
                <PublicIcon sx={{ mr: 1 }} /> Peta
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Col>
      </Row>
      {loading ? (
        <Loading />
      ) : (
        <>
          {galleries.length === 0 ? (
            <Box
              sx={{ minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}
            >
              <NoDataWidget
                icon={faImages}
                message={t("gallery.noGallery")}
                description={t("gallery.noGalleryDesc")}
              />
            </Box>
          ) : (
            viewMode === "grid" ? (
              <InfiniteScroll
                dataLength={galleries.length}
                next={fetchGalleries}
                hasMore={hasMore}
                loader={<Loading />}
              >
                <Masonry
                  breakpointCols={breakpointColumnsObj}
                  className="my-masonry-grid"
                  columnClassName="my-masonry-grid_column"
                >
                  {galleries.map((item, i) => (
                    <div
                      key={`${item.id}-${item.image_url}-${i}`}
                      className="mb-4 gallery-item"
                      onClick={() => openLightboxOnSlide(i + 1)}
                    >
                      <LazyLoadImage
                        alt={item.caption}
                        effect="blur"
                        src={item.image_url}
                        width="100%"
                        style={{
                          display: "block",
                          borderRadius: "8px",
                        }}
                      />
                      <div className="caption">
                        {item.caption}
                        <p className="uploader-name">
                          Uploaded by: {item.user ? item.user.name : "Unknown"}
                        </p>
                      </div>
                    </div>
                  ))}
                </Masonry>
              </InfiniteScroll>
            ) : (
              <Box sx={{ mb: 5, minHeight: 400 }}>
                <MapboxView galleries={galleries} onPinClick={openLightboxOnSlide} mode={mode} />
              </Box>
            )
          )}
        </>
      )}
      <Lightbox
        open={lightboxController.toggler}
        close={() => setLightboxController(prev => ({ ...prev, toggler: false }))}
        index={lightboxController.slide - 1}
        slides={galleries.map(item => ({
          src: item.image_url,
          description: (
            <div style={{ textAlign: "center" }}>
              {item.caption && (
                <div style={{ fontSize: "1.25rem", fontWeight: "bold", marginBottom: "4px" }}>
                  {item.caption}
                </div>
              )}
              <div style={{ fontSize: "0.9rem", color: "#ccc" }}>
                Uploaded by: {item.user ? item.user.name : "Unknown"}
              </div>
            </div>
          ),
        }))}
        plugins={[Captions]}
        captions={{ descriptionTextAlign: "center", descriptionMaxLines: 5 }}
      />
    </Container>
  );
};

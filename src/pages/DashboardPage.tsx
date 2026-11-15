import { useEffect, useState } from "react";
import {
  alpha, Avatar, Box, Button, CircularProgress, Grid, Paper, Skeleton, Stack, Typography, useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRight, faChevronRight, faImages, faNewspaper, faPlus, faUsers, faUserFriends, faBullhorn,
  faUserShield, faPen,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosResponse } from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { getAllArticles } from "../controllers/article-controller";
import { getAllGalleries } from "../controllers/gallery-controller";
import { getAllNews } from "../controllers/news-controller";
import api from "../api/api";
import { PageHeader, StatusPill } from "../components/dashboard/PageHeader";
import type { ArticleModel } from "../types/models";
import { formatDate } from "../utils/format";

type CountMetaResponse = { meta?: { total?: number } };
type AxiosListResponse = AxiosResponse<{ data?: unknown[] }>;
type Metric = { title: string; value: number; icon: IconDefinition; to: string; caption: string };
type QuickAction = { name: string; icon: IconDefinition; to: string };
type RecentItem = ArticleModel["data"][number] & { status?: string; published_at?: string | null };

const getMetaTotal = (result: PromiseSettledResult<CountMetaResponse | null>) =>
  result.status === "fulfilled" ? result.value?.meta?.total ?? 0 : 0;

const getAxiosDataLength = (result: PromiseSettledResult<AxiosListResponse | null>) =>
  result.status === "fulfilled" ? result.value?.data.data?.length ?? 0 : 0;

const cardSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
} as const;

const SectionTitle = ({ title, action }: { title: string; action?: React.ReactNode }) => (
  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", px: 2.5, py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
    <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>{title}</Typography>
    {action}
  </Stack>
);

const DashboardPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, isLoading: isUserLoading } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ articles: 0, galleries: 0, angkatans: 0, members: 0, news: 0 });
  const [isCountsLoading, setIsCountsLoading] = useState(true);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [isRecentLoading, setIsRecentLoading] = useState(true);

  const canArticle = !!user && ["admin", "member"].includes(user.role);
  const canNews = !!user && ["admin", "officer"].includes(user.role);
  const canGallery = !!user && ["admin", "member", "officer"].includes(user.role);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isUserLoading && !user) navigate("/login");
  }, [user, isUserLoading, navigate]);

  useEffect(() => {
    if (!user) {
      setIsCountsLoading(false);
      setIsRecentLoading(false);
      return;
    }
    const userIdFilter = user.role !== "admin" ? user.id : undefined;

    const fetchCounts = async () => {
      setIsCountsLoading(true);
      const none = Promise.resolve(null);
      const [articleRes, galleryRes, newsRes, angkatanRes, memberRes] = await Promise.allSettled([
        canArticle ? getAllArticles({ page: 1, limit: 1, userId: userIdFilter }) : none,
        canGallery ? getAllGalleries(1, 1, userIdFilter) : none,
        canNews ? getAllNews(1, 1, userIdFilter) : none,
        isAdmin ? api.get("/content/angkatan") : none,
        isAdmin ? api.get("/content/member") : none,
      ]);
      setCounts({
        articles: getMetaTotal(articleRes as PromiseSettledResult<CountMetaResponse | null>),
        galleries: getMetaTotal(galleryRes as PromiseSettledResult<CountMetaResponse | null>),
        news: getMetaTotal(newsRes as PromiseSettledResult<CountMetaResponse | null>),
        angkatans: getAxiosDataLength(angkatanRes as PromiseSettledResult<AxiosListResponse | null>),
        members: getAxiosDataLength(memberRes as PromiseSettledResult<AxiosListResponse | null>),
      });
      setIsCountsLoading(false);
    };

    const fetchRecent = async () => {
      setIsRecentLoading(true);
      const response = canArticle
        ? await getAllArticles({ page: 1, limit: 5, userId: userIdFilter })
        : canNews
          ? await getAllNews(1, 5, userIdFilter)
          : null;
      setRecent((response?.data as RecentItem[] | undefined) ?? []);
      setIsRecentLoading(false);
    };

    void fetchCounts();
    void fetchRecent();
  }, [user, canArticle, canGallery, canNews, isAdmin]);

  if (isUserLoading) {
    return (
      <Box role="status" aria-label={t("dashboard.loading")} sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return null;

  const metrics: Metric[] = [];
  const quickActions: QuickAction[] = [];
  if (canArticle) {
    metrics.push({ title: t("article.title"), value: counts.articles, icon: faNewspaper, to: "/dashboard/article", caption: t("dashboard.captionArticle") });
    quickActions.push({ name: t("dashboard.tambahArtikel"), icon: faPen, to: "/dashboard/article/create" });
  }
  if (canNews) {
    metrics.push({ title: t("news.title"), value: counts.news, icon: faBullhorn, to: "/dashboard/news", caption: t("dashboard.captionNews") });
    quickActions.push({ name: t("dashboard.tambahBerita"), icon: faBullhorn, to: "/dashboard/news/create" });
  }
  if (canGallery) {
    metrics.push({ title: t("gallery.title"), value: counts.galleries, icon: faImages, to: "/dashboard/gallery", caption: t("dashboard.captionGallery") });
    quickActions.push({ name: t("dashboard.tambahGaleri"), icon: faImages, to: "/dashboard/gallery/create" });
  }
  if (isAdmin) {
    metrics.push(
      { title: t("dashboard.titleAngkatan"), value: counts.angkatans, icon: faUserFriends, to: "/dashboard/angkatan", caption: t("dashboard.captionAngkatan") },
      { title: t("dashboard.titleAnggota"), value: counts.members, icon: faUsers, to: "/dashboard/member", caption: t("dashboard.captionAnggota") },
    );
    quickActions.push(
      { name: t("dashboard.addAnggota"), icon: faUsers, to: "/dashboard/member/create" },
      { name: t("dashboard.titleSetting"), icon: faUserShield, to: "/dashboard/setting/privacy/access" },
    );
  }

  const firstName = user.name.split(" ")[0];
  const roleLabel = { admin: t("dashboard.roleAdmin"), officer: t("dashboard.roleOfficer"), member: t("dashboard.roleMember") }[user.role] ?? user.role;
  const primaryAction = quickActions[0];
  const recentTitle = canArticle ? t("dashboard.recentArticles") : t("dashboard.recentNews");
  const recentBase = canArticle ? "/dashboard/article" : "/dashboard/news";

  return (
    <Stack spacing={4}>
      <PageHeader
        title={t("dashboard.welcomeBack", { name: firstName })}
        description={t("dashboard.heroDescription")}
        actions={
          <>
            <Button component={Link} to="/dashboard/profile" variant="outlined" color="inherit" sx={{ borderColor: "divider", color: "text.primary" }}>
              {t("dashboard.viewProfile")}
            </Button>
            {primaryAction && (
              <Button component={Link} to={primaryAction.to} variant="contained" startIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 13 }} />}>
                {primaryAction.name}
              </Button>
            )}
          </>
        }
      />

      {metrics.length > 0 && (
        <Grid container spacing={2.5} component="section" aria-label={t("dashboard.summaryTitle")}>
          {metrics.map((metric) => (
            <Grid key={metric.to} size={{ xs: 12, sm: 6, lg: 12 / Math.min(Math.max(metrics.length, 2), 5) }}>
              <Paper elevation={0} sx={{ ...cardSx, height: "100%", display: "flex", flexDirection: "column" }}>
                <Box sx={{ p: 2.5, flexGrow: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 500, color: "text.secondary" }}>{metric.title}</Typography>
                    <Box sx={{ width: 36, height: 36, borderRadius: 2, display: "grid", placeItems: "center", flexShrink: 0, fontSize: 15, color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <FontAwesomeIcon icon={metric.icon} />
                    </Box>
                  </Stack>
                  {isCountsLoading ? (
                    <Skeleton width={64} height={44} />
                  ) : (
                    <Typography sx={{ fontSize: 30, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, mt: 0.5 }}>
                      {metric.value.toLocaleString("id-ID")}
                    </Typography>
                  )}
                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>{metric.caption}</Typography>
                </Box>
                <Box
                  component={Link}
                  to={metric.to}
                  sx={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", px: 2.5, py: 1.5,
                    borderTop: "1px solid", borderColor: "divider", fontSize: 14, fontWeight: 600, color: "text.primary", textDecoration: "none",
                    "&:hover": { color: "primary.main" }, "&:hover svg": { transform: "translateX(2px)" },
                    "& svg": { fontSize: 12, transition: "transform 120ms ease" },
                  }}
                >
                  {t("dashboard.viewAll")}
                  <FontAwesomeIcon icon={faArrowRight} />
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={2.5}>
        {(canArticle || canNews) && (
          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={{ ...cardSx, height: "100%", overflow: "hidden" }}>
              <SectionTitle
                title={recentTitle}
                action={
                  <Button component={Link} to={recentBase} size="small" endIcon={<FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 11 }} />}>
                    {t("dashboard.viewAll")}
                  </Button>
                }
              />
              {isRecentLoading ? (
                <Stack sx={{ p: 2.5 }} spacing={2}>
                  {[0, 1, 2].map((i) => <Skeleton key={i} height={44} />)}
                </Stack>
              ) : recent.length === 0 ? (
                <Box sx={{ px: 2.5, py: 6, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t("dashboard.recentEmpty")}</Typography>
                </Box>
              ) : (
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
                  {recent.map((item) => {
                    const status = item.status ?? (item.published_at ? "active" : "draft");
                    return (
                      <Box component="li" key={item.id} sx={{ "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" } }}>
                        <Box
                          component={Link}
                          to={`${recentBase}/edit/${item.id}`}
                          sx={{ display: "flex", alignItems: "center", gap: 1.75, px: 2.5, py: 1.5, color: "inherit", textDecoration: "none", "&:hover": { bgcolor: "action.hover" } }}
                        >
                          <Box component="img" src={item.image || "/images/empty-image.webp"} alt="" sx={{ width: 48, height: 48, borderRadius: 2, objectFit: "cover", flexShrink: 0, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }} />
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>{item.title}</Typography>
                            <Typography noWrap sx={{ fontSize: 13, color: "text.secondary" }}>
                              {item.author || "—"} · {formatDate(item.published_at ?? item.postingAt)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: { xs: "none", sm: "block" } }}>
                            {status === "active" ? (
                              <StatusPill tone="success">{t("dashboard.statusActive")}</StatusPill>
                            ) : status === "inactive" ? (
                              <StatusPill tone="warning">{t("dashboard.statusInactive")}</StatusPill>
                            ) : (
                              <StatusPill>{t("dashboard.statusDraft")}</StatusPill>
                            )}
                          </Box>
                          <Box sx={{ color: "text.disabled", fontSize: 12 }}><FontAwesomeIcon icon={faChevronRight} /></Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          </Grid>
        )}

        <Grid size={{ xs: 12, lg: canArticle || canNews ? 4 : 12 }}>
          <Stack spacing={2.5} sx={{ height: "100%" }}>
            <Paper elevation={0} sx={{ ...cardSx, p: 2.5 }}>
              <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>{t("dashboard.account")}</Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Avatar src={user.avatar || "/images/default-avatar.webp"} alt={user.name} sx={{ width: 48, height: 48 }} />
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography noWrap sx={{ fontSize: 15, fontWeight: 600 }}>{user.name}</Typography>
                  <Typography noWrap sx={{ fontSize: 13, color: "text.secondary" }}>{user.email}</Typography>
                </Box>
              </Stack>
              <Stack direction="row" sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider", justifyContent: "space-between", alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{t("dashboard.statusLabel")}</Typography>
                <StatusPill tone={user.role === "admin" ? "warning" : user.role === "officer" ? "info" : "success"}>{roleLabel}</StatusPill>
              </Stack>
            </Paper>

            {quickActions.length > 0 && (
              <Paper elevation={0} sx={{ ...cardSx, overflow: "hidden", flexGrow: 1 }}>
                <SectionTitle title={t("dashboard.quickActions")} />
                <Box component="ul" sx={{ listStyle: "none", m: 0, p: 1 }}>
                  {quickActions.map((action) => (
                    <li key={action.to}>
                      <Box
                        component={Link}
                        to={action.to}
                        sx={{
                          display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.25, borderRadius: 2,
                          color: "text.primary", textDecoration: "none", fontSize: 14, fontWeight: 500,
                          "&:hover": { bgcolor: "action.hover" }, "&:hover .qa-chevron": { color: "text.secondary", transform: "translateX(2px)" },
                        }}
                      >
                        <Box sx={{ width: 32, height: 32, borderRadius: 2, display: "grid", placeItems: "center", fontSize: 13, color: "text.secondary", border: "1px solid", borderColor: "divider" }}>
                          <FontAwesomeIcon icon={action.icon} />
                        </Box>
                        <Box component="span" sx={{ flexGrow: 1 }}>{action.name}</Box>
                        <Box className="qa-chevron" sx={{ color: "text.disabled", fontSize: 11, transition: "transform 120ms ease, color 120ms ease" }}>
                          <FontAwesomeIcon icon={faChevronRight} />
                        </Box>
                      </Box>
                    </li>
                  ))}
                </Box>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export { DashboardPage };

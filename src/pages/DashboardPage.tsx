import { useEffect, useState } from "react";
import {
  alpha, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress,
  Grid, Stack, Typography,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faCog, faEye, faImages, faNewspaper,
  faPlus, faShieldHalved, faUsers, faUserFriends, faBullhorn,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import type { AxiosResponse } from "axios";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { getAllArticles } from "../controllers/article-controller";
import { getAllGalleries } from "../controllers/gallery-controller";
import { getAllNews } from "../controllers/news-controller";
import api from "../api/api";

type CountMetaResponse = { meta?: { total?: number } };
type AxiosListResponse = AxiosResponse<{ data?: unknown[] }>;
type DashboardMetric = { title: string; value: number | string; icon: typeof faNewspaper; color: string; to: string; caption: string };
type QuickAction = { name: string; icon: typeof faPlus; to: string; tone: string };

const green = "#1f7a6b";

const getMetaTotal = (result: PromiseSettledResult<CountMetaResponse | null>) =>
  result.status === "fulfilled" ? result.value?.meta?.total ?? 0 : 0;

const getAxiosDataLength = (result: PromiseSettledResult<AxiosListResponse | null>) =>
  result.status === "fulfilled" ? result.value?.data.data?.length ?? 0 : 0;

const DashboardPage = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, isLoading: isUserLoading } = useAuth();
  const navigate = useNavigate();
  const orange = theme.palette.mode === "dark" ? "#e67817" : "#b95608";
  const [counts, setCounts] = useState({ articles: 0, galleries: 0, angkatans: 0, members: 0, news: 0 });
  const [isCountsLoading, setIsCountsLoading] = useState(true);

  useEffect(() => {
    if (!isUserLoading && !user) navigate("/login");
  }, [user, isUserLoading, navigate]);

  useEffect(() => {
    const fetchCounts = async () => {
      if (!user) {
        setIsCountsLoading(false);
        return;
      }

      setIsCountsLoading(true);
      try {
        const promises: [
          Promise<CountMetaResponse | null>, Promise<CountMetaResponse | null>, Promise<CountMetaResponse | null>,
          Promise<AxiosListResponse | null>, Promise<AxiosListResponse | null>,
        ] = [Promise.resolve(null), Promise.resolve(null), Promise.resolve(null), Promise.resolve(null), Promise.resolve(null)];
        const userIdFilter = user.role !== "admin" ? user.id : undefined;

        if (["admin", "member"].includes(user.role)) {
          promises[0] = getAllArticles({ page: 1, limit: 1, userId: userIdFilter });
        }
        if (["admin", "member", "officer"].includes(user.role)) {
          promises[1] = getAllGalleries(1, 1, userIdFilter);
        }
        if (["admin", "officer"].includes(user.role)) {
          promises[2] = getAllNews(1, 1, userIdFilter);
        }
        if (user.role === "admin") {
          promises[3] = api.get("/content/angkatan");
          promises[4] = api.get("/content/member");
        }

        const [articleRes, galleryRes, newsRes, angkatanRes, memberRes] = await Promise.allSettled(promises);
        setCounts({
          articles: getMetaTotal(articleRes),
          galleries: getMetaTotal(galleryRes),
          news: getMetaTotal(newsRes),
          angkatans: getAxiosDataLength(angkatanRes),
          members: getAxiosDataLength(memberRes),
        });
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);
      } finally {
        setIsCountsLoading(false);
      }
    };

    void fetchCounts();
  }, [user]);

  if (isUserLoading) {
    return (
      <Box role="status" aria-label={t("dashboard.loading")} sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) return null;

  const contentSummary: DashboardMetric[] = [];
  const quickActions: QuickAction[] = [];
  if (["admin", "member"].includes(user.role)) {
    contentSummary.push({ title: t("article.title"), value: isCountsLoading ? "..." : counts.articles, icon: faNewspaper, color: orange, to: "/dashboard/article", caption: t("dashboard.captionArticle") });
    quickActions.push({ name: t("dashboard.tambahArtikel"), icon: faPlus, to: "/dashboard/article/create", tone: orange });
  }
  if (["admin", "officer"].includes(user.role)) {
    contentSummary.push({ title: t("news.title"), value: isCountsLoading ? "..." : counts.news, icon: faBullhorn, color: orange, to: "/dashboard/news", caption: t("dashboard.captionNews") });
    quickActions.push(
      { name: t("dashboard.tambahBerita"), icon: faPlus, to: "/dashboard/news/create", tone: orange },
      { name: t("dashboard.viewAllNews"), icon: faEye, to: "/dashboard/news", tone: green },
    );
  }
  if (["admin", "member", "officer"].includes(user.role)) {
    contentSummary.push({ title: t("gallery.title"), value: isCountsLoading ? "..." : counts.galleries, icon: faImages, color: green, to: "/dashboard/gallery", caption: t("dashboard.captionGallery") });
    quickActions.push({ name: t("dashboard.tambahGaleri"), icon: faPlus, to: "/dashboard/gallery/create", tone: green });
  }
  if (user.role === "admin") {
    contentSummary.push(
      { title: t("dashboard.titleAngkatan"), value: isCountsLoading ? "..." : counts.angkatans, icon: faUserFriends, color: green, to: "/dashboard/angkatan", caption: t("dashboard.captionAngkatan") },
      { title: t("dashboard.titleAnggota"), value: isCountsLoading ? "..." : counts.members, icon: faUsers, color: green, to: "/dashboard/member", caption: t("dashboard.captionAnggota") },
      { title: t("dashboard.titleSetting"), value: t("dashboard.manage"), icon: faCog, color: green, to: "/dashboard/setting/privacy/access", caption: t("dashboard.captionSetting") },
    );
    quickActions.push(
      { name: t("dashboard.addAngkatan"), icon: faPlus, to: "/dashboard/angkatan/create", tone: green },
      { name: t("dashboard.addAnggota"), icon: faPlus, to: "/dashboard/member/create", tone: green },
    );
  }

  const welcomeTitle = `${t("dashboard.hello")} ${user.name}`;
  const roleLabel = {
    admin: t("dashboard.roleAdmin"),
    officer: t("dashboard.roleOfficer"),
    member: t("dashboard.roleMember"),
  }[user.role] ?? user.role;
  const primaryAction = quickActions[0];
  const secondaryActions = primaryAction ? quickActions.slice(1) : quickActions;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 3, md: 4 }, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ overflow: "hidden", border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
        <Grid container sx={{ alignItems: "stretch" }}>
          <Grid size={{ xs: 12, md: 7.5 }}>
            <Stack spacing={{ xs: 2.5, md: 3 }} sx={{ height: "100%", justifyContent: "center", p: { xs: 2.5, sm: 3.5, lg: 5 } }}>
              <Stack direction="row" spacing={1.25} useFlexGap sx={{ alignItems: "center", flexWrap: "wrap" }}>
                <Typography variant="overline" sx={{ color: orange, fontWeight: 800, letterSpacing: 0.4 }}>
                  {t("dashboard.heroEyebrow")}
                </Typography>
                <Chip
                  icon={<FontAwesomeIcon icon={faShieldHalved} />}
                  label={roleLabel}
                  size="small"
                  sx={{ borderRadius: 1, fontWeight: 700, color: "text.primary", bgcolor: alpha(green, 0.1), "& .MuiChip-icon": { color: green, fontSize: 13 } }}
                />
              </Stack>
              <Box>
                <Typography component="h1" variant="h3" sx={{ fontWeight: 850, letterSpacing: "-0.025em", lineHeight: 1.15, mb: 1.5, fontSize: { xs: "2rem", sm: "2.5rem", lg: "3rem" } }}>
                  {welcomeTitle}
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 540, lineHeight: 1.75 }}>
                  {t("dashboard.heroDescription")}
                </Typography>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                {primaryAction && (
                  <Button component={Link} to={primaryAction.to} variant="contained" startIcon={<FontAwesomeIcon icon={primaryAction.icon} />} sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minHeight: 46, px: 2.25, fontWeight: 700 }}>
                    {primaryAction.name}
                  </Button>
                )}
                <Button component={Link} to="/dashboard/profile" variant="outlined" color="inherit" sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minHeight: 46, borderColor: "divider", bgcolor: "background.paper" }}>
                  {t("dashboard.viewProfile")}
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid sx={{ minHeight: { xs: 220, sm: 280, md: 360 } }} size={{ xs: 12, md: 4.5 }}>
            <Box component="img" src="/images/hightlight/1.webp" alt="" aria-hidden="true" sx={{ width: "100%", height: "100%", minHeight: { xs: 220, sm: 280, md: 360 }, maxHeight: { md: 520 }, display: "block", objectFit: "cover", objectPosition: "center 48%" }} />
          </Grid>
        </Grid>
      </Box>

      {contentSummary.length > 0 && (
        <Box component="section" aria-labelledby="dashboard-summary-title">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "flex-end" }, mb: 2 }}>
            <Box>
              <Typography id="dashboard-summary-title" component="h2" variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
                {t("dashboard.summaryTitle")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("dashboard.summaryDescription")}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 700 }}>
              {t("dashboard.activeModules", { count: contentSummary.length })}
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {contentSummary.map((item) => (
              <Grid key={item.to} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  component={Link}
                  to={item.to}
                  sx={{
                    display: "block", height: "100%", borderRadius: 1.5,
                    textDecoration: "none", boxShadow: "none",
                    transition: "border-color 140ms ease, background-color 140ms ease",
                    "&:hover": { borderColor: item.color, bgcolor: alpha(item.color, 0.035) },
                    "&:focus-visible": { outline: `3px solid ${item.color}`, outlineOffset: 2 },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Avatar sx={{ width: 48, height: 48, flex: "0 0 auto", color: item.color, bgcolor: alpha(item.color, 0.1), borderRadius: 1.5 }}>
                        <FontAwesomeIcon icon={item.icon} />
                      </Avatar>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 0.25 }}>{item.title}</Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{item.value}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>{item.caption}</Typography>
                      </Box>
                      <FontAwesomeIcon icon={faArrowRight} color={item.color} aria-hidden="true" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {secondaryActions.length > 0 && (
        <Box component="section" aria-labelledby="dashboard-actions-title">
          <Box sx={{ mb: 2 }}>
            <Typography id="dashboard-actions-title" component="h2" variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
              {t("dashboard.quickActions")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.quickActionsDescription")}
            </Typography>
          </Box>
          <Grid container spacing={1.5}>
            {secondaryActions.map((action) => (
              <Grid key={action.to} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Button
                  component={Link}
                  to={action.to}
                  variant="outlined"
                  color="inherit"
                  fullWidth
                  startIcon={<FontAwesomeIcon icon={action.icon} />}
                  endIcon={<FontAwesomeIcon icon={faArrowRight} />}
                  sx={{
                    minHeight: 56, justifyContent: "space-between", borderRadius: 1.5,
                    px: 2, textAlign: "left", color: "text.primary",
                    bgcolor: "background.paper", borderColor: "divider",
                    "& .MuiButton-startIcon": { color: action.tone },
                    "&:hover": { bgcolor: alpha(action.tone, 0.04), borderColor: action.tone },
                    "&:focus-visible": { outline: `3px solid ${action.tone}`, outlineOffset: 2 },
                  }}
                >
                  <Typography component="span" variant="body2" sx={{ fontWeight: 700, flexGrow: 1, textAlign: "left" }}>
                    {action.name}
                  </Typography>
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export { DashboardPage };

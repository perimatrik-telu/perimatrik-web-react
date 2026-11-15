import { useMemo, type ReactNode } from "react";
import {
  Admin,
  CustomRoutes,
  type AuthProvider,
  type DataProvider,
  type DeleteParams,
  type GetListParams,
  type Identifier,
  type QueryFunctionContext,
  type RaRecord,
} from "react-admin";
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Navigate, Route } from "react-router-dom";
import Cookies from "js-cookie";
import { DashboardPage } from "../DashboardPage";
import DashboardLayout from "./DashboardLayout";
import { ProfilePage } from "./ProfilePage";
import { CreateArticlePage } from "./CreateArticlePage";
import { EditArticlePage } from "./EditArticlePage";
import { RAArticleListPage } from "./RAArticleListPage";
import { RANewsListPage } from "./RANewsListPage";
import { CreateNewsPage } from "./CreateNewsPage";
import { EditNewsPage } from "./EditNewsPage";
import { RAGalleryListPage } from "./RAGalleryListPage";
import { CreateGalleryPage } from "./CreateGalleryPage";
import { EditGalleryPage } from "./EditGalleryPage";
import AngkatanListPage from "./AngkatanListPage";
import MemberListManagePage from "./MemberListManagePage";
import AngkatanFormPage from "./AngkatanFormPage";
import MemberFormPage from "./MemberFormPage";
import { AccessPage } from "./setting/privacy/AccessPage";
import { ContactSettingPage } from "./setting/privacy/ContactSettingPage";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../types/models";
import { fetchApi } from "../../utils/api";
import {
  ARTICLE_DATA_URL,
  GALLERY_DATA_URL,
  NEWS_DATA_URL,
} from "../../constants/constant";

type Role = User["role"];

type ApiListRecord = RaRecord & Record<string, unknown>;

type ApiListResponse = {
  data: ApiListRecord[];
  meta?: {
    total?: number;
  };
};

const emptyRecord = <RecordType extends RaRecord = RaRecord>(
  id: Identifier = "",
) => ({ id } as RecordType);

const resourceRoles: Record<string, Role[]> = {
  dashboard: ["admin", "member", "officer"],
  profile: ["admin", "member", "officer"],
  article: ["admin", "member"],
  news: ["admin", "officer"],
  gallery: ["admin", "member", "officer"],
  angkatan: ["admin"],
  member: ["admin"],
  access: ["admin"],
  contact: ["admin"],
};

const getCookieDomain = () => {
  const hostname = window.location.hostname;

  if (hostname.includes("localhost") || hostname === "127.0.0.1") {
    return undefined;
  }

  if (hostname.includes("perimatrik.org")) {
    return ".perimatrik.org";
  }

  return undefined;
};

const RoleGuard = ({
  allowedRoles,
  children,
}: {
  allowedRoles?: Role[];
  children: ReactNode;
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AdminErrorPage = ({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: (args?: unknown) => void;
}) => {
  console.error("[DashboardAdminApp] react-admin error", error);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        p: 3,
      }}
    >
      <Paper variant="outlined" sx={{ width: "100%", maxWidth: 720, p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Dasbor gagal dimuat
          </Typography>
          <Alert severity="error">
            {error.message || "Terjadi error saat memuat halaman dasbor."}
          </Alert>
          {error.stack && (
            <Box
              component="pre"
              sx={{
                m: 0,
                p: 2,
                fontSize: 12,
                overflow: "auto",
                borderRadius: 2,
                bgcolor: "grey.100",
              }}
            >
              {error.stack}
            </Box>
          )}
          <Box>
            <Button variant="contained" onClick={() => resetErrorBoundary()}>
              Coba lagi
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

const DashboardAdminApp = () => {
  const { user, token, logout } = useAuth();

  const authProvider = useMemo<AuthProvider>(
    () => ({
      login: async () => ({ redirectTo: "/dashboard" }),
      logout: async () => {
        try {
          await logout();
        } catch {
          Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
        }

        return "/login";
      },
      checkAuth: async () => {
        if (token && user) {
          return;
        }

        return Promise.reject();
      },
      checkError: async (error) => {
        const status = error?.status ?? error?.response?.status;
        if (status === 401 || status === 403) {
          Cookies.remove("auth_token", { domain: getCookieDomain(), path: "/" });
          return Promise.reject();
        }
      },
      getIdentity: async () => {
        if (user) {
          return {
            id: user.id,
            fullName: user.name,
            avatar: user.avatar ?? undefined,
          };
        }

        const response = (await fetchApi("auth/current-user")) as { data: User };
        return {
          id: response.data.id,
          fullName: response.data.name,
          avatar: response.data.avatar ?? undefined,
        };
      },
      getPermissions: async () => user?.role ?? null,
      canAccess: async ({ resource }) => {
        if (!user) {
          return false;
        }

        const allowedRoles = resourceRoles[resource];
        if (!allowedRoles) {
          return true;
        }

        return allowedRoles.includes(user.role);
      },
    }),
    [logout, token, user],
  );

  const dataProvider = useMemo<DataProvider>(
    () => ({
      getList: async <RecordType extends RaRecord = RaRecord>(
        resource: string,
        params: GetListParams & QueryFunctionContext,
      ) => {
        if (resource === "article") {
          const page = params.pagination?.page ?? 1;
          const perPage = params.pagination?.perPage ?? 12;
          const userIdFilter = user?.role !== "admin" ? user?.id : undefined;

          let endpoint = `${ARTICLE_DATA_URL}?page=${page}&limit=${perPage}`;
          if (userIdFilter) {
            endpoint += `&user_id=${userIdFilter}`;
          }

          const response = await fetchApi<ApiListResponse>(endpoint);

          return {
            data: response.data as RecordType[],
            total: response.meta?.total ?? response.data.length,
          };
        }

        if (resource === "news") {
          const page = params.pagination?.page ?? 1;
          const perPage = params.pagination?.perPage ?? 12;
          const userIdFilter = user?.role !== "admin" ? user?.id : undefined;

          let endpoint = `${NEWS_DATA_URL}?page=${page}&limit=${perPage}`;
          if (userIdFilter) {
            endpoint += `&user_id=${userIdFilter}`;
          }

          const response = await fetchApi<ApiListResponse>(endpoint);

          return {
            data: response.data as RecordType[],
            total: response.meta?.total ?? response.data.length,
          };
        }

        if (resource === "gallery") {
          const page = params.pagination?.page ?? 1;
          const perPage = params.pagination?.perPage ?? 12;
          const userIdFilter = user?.role !== "admin" ? user?.id : undefined;

          let endpoint = `${GALLERY_DATA_URL}?page=${page}&limit=${perPage}`;
          if (userIdFilter) {
            endpoint += `&user_id=${userIdFilter}`;
          }

          const response = await fetchApi<ApiListResponse>(endpoint);

          return {
            data: response.data as RecordType[],
            total: response.meta?.total ?? response.data.length,
          };
        }

        return { data: [], total: 0 };
      },
      getOne: async <RecordType extends RaRecord = RaRecord>() => ({
        data: emptyRecord<RecordType>(),
      }),
      getMany: async () => ({ data: [] }),
      getManyReference: async () => ({ data: [], total: 0 }),
      create: async <
        _RecordType extends Omit<RaRecord, "id"> = Omit<RaRecord, "id">,
        ResultRecordType extends RaRecord = _RecordType & { id: Identifier },
      >() => ({ data: emptyRecord<ResultRecordType>() }),
      update: async <RecordType extends RaRecord = RaRecord>() => ({
        data: emptyRecord<RecordType>(),
      }),
      updateMany: async () => ({ data: [] }),
      delete: async <RecordType extends RaRecord = RaRecord>(
        resource: string,
        params: DeleteParams<RecordType>,
      ) => {
        if (resource === "article") {
          await fetchApi(`${ARTICLE_DATA_URL}/${params.id}`, {
            method: "DELETE",
          });

          return { data: params.previousData ?? emptyRecord<RecordType>(params.id) };
        }

        if (resource === "news") {
          await fetchApi(`${NEWS_DATA_URL}/${params.id}`, {
            method: "DELETE",
          });

          return { data: params.previousData ?? emptyRecord<RecordType>(params.id) };
        }

        if (resource === "gallery") {
          await fetchApi(`${GALLERY_DATA_URL}/${params.id}`, {
            method: "DELETE",
          });

          return { data: params.previousData ?? emptyRecord<RecordType>(params.id) };
        }

        return { data: params.previousData ?? emptyRecord<RecordType>(params.id) };
      },
      deleteMany: async () => ({ data: [] }),
    }),
    [user],
  );

  return (
    <Admin
      basename="/dashboard"
      dashboard={DashboardPage}
      authProvider={authProvider}
      dataProvider={dataProvider}
      layout={DashboardLayout}
      error={AdminErrorPage}
      requireAuth={false}
    >
      <CustomRoutes>
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/article"
          element={
            <RoleGuard allowedRoles={resourceRoles.article}>
              <RAArticleListPage />
            </RoleGuard>
          }
        />
        <Route
          path="/article/create"
          element={
            <RoleGuard allowedRoles={resourceRoles.article}>
              <CreateArticlePage />
            </RoleGuard>
          }
        />
        <Route
          path="/article/edit/:id"
          element={
            <RoleGuard allowedRoles={resourceRoles.article}>
              <EditArticlePage />
            </RoleGuard>
          }
        />
        <Route
          path="/news"
          element={
            <RoleGuard allowedRoles={resourceRoles.news}>
              <RANewsListPage />
            </RoleGuard>
          }
        />
        <Route
          path="/news/create"
          element={
            <RoleGuard allowedRoles={resourceRoles.news}>
              <CreateNewsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/news/edit/:id"
          element={
            <RoleGuard allowedRoles={resourceRoles.news}>
              <EditNewsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/gallery"
          element={
            <RoleGuard allowedRoles={resourceRoles.gallery}>
              <RAGalleryListPage />
            </RoleGuard>
          }
        />
        <Route
          path="/gallery/create"
          element={
            <RoleGuard allowedRoles={resourceRoles.gallery}>
              <CreateGalleryPage />
            </RoleGuard>
          }
        />
        <Route
          path="/gallery/edit/:id"
          element={
            <RoleGuard allowedRoles={resourceRoles.gallery}>
              <EditGalleryPage />
            </RoleGuard>
          }
        />
        <Route
          path="/angkatan"
          element={
            <RoleGuard allowedRoles={resourceRoles.angkatan}>
              <AngkatanListPage />
            </RoleGuard>
          }
        />
        <Route
          path="/angkatan/create"
          element={
            <RoleGuard allowedRoles={resourceRoles.angkatan}>
              <AngkatanFormPage />
            </RoleGuard>
          }
        />
        <Route
          path="/angkatan/edit/:id"
          element={
            <RoleGuard allowedRoles={resourceRoles.angkatan}>
              <AngkatanFormPage />
            </RoleGuard>
          }
        />
        <Route
          path="/member"
          element={
            <RoleGuard allowedRoles={resourceRoles.member}>
              <MemberListManagePage />
            </RoleGuard>
          }
        />
        <Route
          path="/member/create"
          element={
            <RoleGuard allowedRoles={resourceRoles.member}>
              <MemberFormPage />
            </RoleGuard>
          }
        />
        <Route
          path="/member/edit/:id"
          element={
            <RoleGuard allowedRoles={resourceRoles.member}>
              <MemberFormPage />
            </RoleGuard>
          }
        />
        <Route path="/setting" element={<Navigate to="/setting/privacy/access" replace />} />
        <Route
          path="/setting/privacy/access"
          element={
            <RoleGuard allowedRoles={resourceRoles.access}>
              <AccessPage />
            </RoleGuard>
          }
        />
        <Route
          path="/setting/privacy/contact"
          element={
            <RoleGuard allowedRoles={resourceRoles.contact}>
              <ContactSettingPage />
            </RoleGuard>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </CustomRoutes>
    </Admin>
  );
};

export default DashboardAdminApp;

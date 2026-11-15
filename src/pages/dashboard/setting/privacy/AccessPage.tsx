import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLink,
  faPlus,
  faUser as faUserIcon,
  faUserGear,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";
import ModalComponent from "../../../../components/modal-component";
import api from "../../../../api/api";
import { toast } from "react-toastify";
import { useAuth } from "../../../../hooks/useAuth";
import type { User } from "../../../../types/models";
import {
  DashboardRowActions,
  DashboardTable,
  type DashboardTableColumn,
} from "../../../../components/dashboard/DashboardTable";
import { StatusPill } from "../../../../components/dashboard/PageHeader";
import { useConfirm } from "../../../../components/dashboard/confirm-context";

type UserRole = User["role"];
type RoleFilter = "All" | UserRole;

type LinkedMember = {
  id: string;
  no_anggota: string;
  nama_lengkap?: string;
};

type AccessUser = User & {
  member?: LinkedMember | null;
};

type MemberOption = LinkedMember & {
  user_id?: string | null;
};

type AccessFormData = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  member_id: string;
};

type ValidationErrorResponse = {
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
};

const roles: UserRole[] = ["admin", "officer", "member"];

const roleLabel = (role: string) => {
  switch (role) {
    case "admin":
      return "Administrator";
    case "officer":
      return "Pengurus";
    case "member":
      return "Anggota";
    default:
      return role;
  }
};

type RoleTone = "warning" | "info" | "success" | "neutral";

/** Consistent role colours across the dashboard: admin = warning, officer = info, member = success. */
const getRoleTone = (role: string): RoleTone => {
  switch (role) {
    case "admin":
      return "warning";
    case "officer":
      return "info";
    case "member":
      return "success";
    default:
      return "neutral";
  }
};

const sectionLabelSx = { fontSize: 14, fontWeight: 600, color: "text.primary", mb: 1.25 } as const;

const roleOption = (icon: typeof faUserIcon, label: string, hint: string) => (
  <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
    <Box component="span" sx={{ color: "text.secondary", display: "inline-flex", width: 16, justifyContent: "center", fontSize: 13 }}>
      <FontAwesomeIcon icon={icon} />
    </Box>
    <Box>
      <Typography sx={{ fontSize: 14, color: "text.primary", lineHeight: 1.4 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12, color: "text.secondary", lineHeight: 1.4 }}>{hint}</Typography>
    </Box>
  </Stack>
);

const defaultFormData: AccessFormData = {
  name: "",
  email: "",
  password: "",
  role: "member",
  member_id: "",
};

export const AccessPage = () => {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AccessFormData>(defaultFormData);
  const [saving, setSaving] = useState(false);
  // Show inline required-field errors only after the first save attempt.
  const [showErrors, setShowErrors] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, memberRes] = await Promise.all([
        api.get("system/users"),
        api.get("content/member"),
      ]);
      setUsers(userRes.data.data);
      setMembers(memberRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Gagal memuat data akses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Pengaturan Akses - Dasbor";
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleModalToggle = (edit = false, user: AccessUser | null = null) => {
    setIsEditing(edit);
    setSelectedUser(user);
    setShowErrors(false);

    if (edit && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
        member_id: user.member?.id || "",
      });
    } else {
      setFormData(defaultFormData);
    }

    setIsModalOpen((prev) => !prev);
  };

  const handleInputChange = (
    event:
      | ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | SelectChangeEvent<string>,
  ) => {
    const { name, value } = event.target;

    if (name === "member_id" && value && !isEditing) {
      const selectedMember = members.find((member) => member.id === value);
      if (selectedMember) {
        setFormData((prev) => ({
          ...prev,
          member_id: value,
          name: selectedMember.nama_lengkap || prev.name,
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email || (!isEditing && !formData.password)) {
      setShowErrors(true);
      toast.error("Lengkapi semua data wajib");
      return;
    }

    setSaving(true);
    try {
      if (isEditing && selectedUser) {
        await api.put(`system/users/${selectedUser.id}`, formData);
        toast.success("Pengguna berhasil diperbarui");
      } else {
        await api.post("system/users", formData);
        toast.success("Akun pengguna berhasil dibuat");
      }
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to save user:", error);
      const apiError = error as ValidationErrorResponse;
      const validationErrors = apiError.response?.data?.errors;

      if (validationErrors) {
        Object.keys(validationErrors).forEach((key) => {
          validationErrors[key].forEach((message) => toast.error(message));
        });
      } else {
        toast.error(apiError.response?.data?.message || "Gagal menyimpan pengguna");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: AccessUser) => {
    if (user.id === currentUser?.id) {
      toast.error("Anda tidak dapat menghapus akun sendiri");
      return;
    }

    if (!(await confirm({ title: `Hapus akses untuk ${user.name}?`, description: "Akun ini tidak akan bisa masuk ke dasbor lagi. Tindakan ini tidak dapat dibatalkan." }))) {
      return;
    }

    setDeletingId(user.id);
    try {
      await api.delete(`system/users/${user.id}`);
      toast.success("Pengguna berhasil dihapus");
      await fetchData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast.error("Gagal menghapus pengguna");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.member?.no_anggota?.toLowerCase().includes(query);
      const matchesRole = selectedRole === "All" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [searchTerm, selectedRole, users]);

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const availableMembers = useMemo(
    () =>
      members.filter(
        (member) =>
          !member.user_id ||
          (isEditing && selectedUser && member.user_id === selectedUser.id),
      ),
    [isEditing, members, selectedUser],
  );

  const columns: DashboardTableColumn<AccessUser>[] = [
    {
      key: "user",
      label: "Pengguna",
      render: (user) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", minWidth: 0 }}>
          <Avatar
            src={user.avatar || undefined}
            alt=""
            sx={{ width: 36, height: 36, fontSize: 14, fontWeight: 600, bgcolor: "action.selected", color: "text.secondary" }}
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 14, fontWeight: 600, color: "text.primary", maxWidth: 320 }}>
              {user.name}
            </Typography>
            <Typography noWrap sx={{ fontSize: 13, color: "text.secondary", maxWidth: 320 }}>
              {user.email}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: "role",
      label: "Hak akses",
      width: 160,
      render: (user) => <StatusPill tone={getRoleTone(user.role)}>{roleLabel(user.role)}</StatusPill>,
    },
    {
      key: "member",
      label: "Anggota tertaut",
      width: 210,
      render: (user) =>
        user.member ? (
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
            <Box component="span" aria-hidden sx={{ color: "text.disabled", fontSize: 12, display: "inline-flex" }}>
              <FontAwesomeIcon icon={faLink} />
            </Box>
            <Typography noWrap sx={{ fontSize: 14, color: "text.primary", fontVariantNumeric: "tabular-nums" }}>
              {user.member.no_anggota}
            </Typography>
          </Stack>
        ) : (
          <Typography component="span" sx={{ fontSize: 13, color: "text.disabled" }}>
            Belum tertaut
          </Typography>
        ),
    },
  ];

  return (
    <>
      <DashboardTable
        title="Manajemen Akses Pengguna"
        description="Kelola akun sistem dan hubungkan dengan profil anggota."
        columns={columns}
        rows={paginatedUsers}
        loading={loading}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={filteredUsers.length}
        searchValue={searchTerm}
        searchPlaceholder="Cari nama, email, atau nomor anggota..."
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(0);
        }}
        filters={
          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 168 } }}>
            <InputLabel id="access-role-filter-label">Peran</InputLabel>
            <Select
              labelId="access-role-filter-label"
              id="access-role-filter"
              value={selectedRole}
              onChange={(event) => {
                setSelectedRole(event.target.value as RoleFilter);
                setPage(0);
              }}
              label="Peran"
              sx={{ bgcolor: "background.paper" }}
            >
              <MenuItem value="All">{t("setting.semuaPeran")}</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role} value={role}>
                  {roleLabel(role)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        }
        actions={[
          {
            label: "Tambah Pengguna",
            onClick: () => handleModalToggle(false),
            icon: <FontAwesomeIcon icon={faPlus} />,
          },
        ]}
        emptyTitle="Pengguna tidak ditemukan"
        emptyDescription="Tidak ada pengguna yang cocok dengan pencarian dan filter peran."
        minWidth={860}
        onPageChange={setPage}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setPage(0);
        }}
        renderRowActions={(user) => (
          <DashboardRowActions
            editLabel="Ubah"
            deleteLabel="Hapus"
            onEdit={() => handleModalToggle(true, user)}
            onDelete={() => handleDelete(user)}
            deleting={deletingId === user.id}
            deleteDisabled={
              user.id === currentUser?.id ||
              Boolean(deletingId && deletingId !== user.id)
            }
          />
        )}
      />

      <ModalComponent
        isOpen={isModalOpen}
        title={isEditing ? "Perbarui Hak Akses Pengguna" : "Daftarkan Akun Baru"}
        onClose={() => {
          if (!saving) setIsModalOpen(false);
        }}
        onSave={handleSave}
        saving={saving}
        saveButtonLabel={saving ? "Menyimpan…" : isEditing ? "Simpan perubahan" : "Daftarkan akun"}
      >
        {saving ? (
          <Box role="status" sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 5 }}>
            <CircularProgress size={28} sx={{ mb: 1.5 }} />
            <Typography sx={{ fontSize: 14, color: "text.secondary" }}>Memproses permintaan...</Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {!isEditing && (
              <Box>
                <Typography component="h3" id="access-member-label" sx={sectionLabelSx}>
                  Pilih Anggota Terdaftar (Opsional)
                </Typography>
                <Autocomplete
                  options={availableMembers}
                  getOptionLabel={(option) =>
                    `${option.nama_lengkap || "-"} (${option.no_anggota})`
                  }
                  onChange={(_event, newValue) => {
                    if (newValue) {
                      setFormData((prev) => ({
                        ...prev,
                        member_id: newValue.id,
                        name: newValue.nama_lengkap || prev.name,
                      }));
                    } else {
                      setFormData((prev) => ({
                        ...prev,
                        member_id: "",
                        name: "",
                      }));
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Cari nama atau nomor anggota..."
                      variant="outlined"
                      slotProps={{ ...params.slotProps, htmlInput: { ...params.slotProps.htmlInput, "aria-labelledby": "access-member-label" } }}
                      helperText="Pilih anggota untuk mengisi nama otomatis dan menautkan akun ini"
                    />
                  )}
                  fullWidth
                />
              </Box>
            )}

            {formData.member_id && (
              <Alert severity="success" variant="outlined" sx={{ fontSize: 14 }}>
                Ditautkan ke{" "}
                <b>{members.find((member) => member.id === formData.member_id)?.nama_lengkap}</b>.
                Informasi profil akan tersinkron otomatis.
              </Alert>
            )}

            <Divider />

            <Box>
              <Typography component="h3" sx={sectionLabelSx}>
                Informasi Login
              </Typography>
              <Grid container spacing={2}>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    disabled={Boolean(formData.member_id)}
                    error={showErrors && !formData.name}
                    helperText={
                      showErrors && !formData.name
                        ? "Nama wajib diisi."
                        : formData.member_id
                          ? "Nama otomatis tersinkron dari profil anggota tertaut."
                          : ""
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Alamat Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    error={showErrors && !formData.email}
                    helperText={showErrors && !formData.email ? "Email wajib diisi." : undefined}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={isEditing ? "Ubah Password" : "Password Akun"}
                    name="password"
                    type="password"
                    placeholder={isEditing ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!isEditing}
                    error={showErrors && !isEditing && !formData.password}
                    helperText={showErrors && !isEditing && !formData.password ? "Password wajib diisi untuk akun baru." : undefined}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box>
              <Typography component="h3" sx={sectionLabelSx}>
                Akses Sistem
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="access-role-label">{t("setting.peranSistem")}</InputLabel>
                <Select
                  labelId="access-role-label"
                  id="access-role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  label="Peran Sistem"
                >
                  <MenuItem value="member">
                    {roleOption(faUserIcon, t("setting.member"), "Mengelola Artikel & Galeri")}
                  </MenuItem>
                  <MenuItem value="officer">
                    {roleOption(faUserGear, t("setting.officer"), "Mengelola Berita & Galeri")}
                  </MenuItem>
                  <MenuItem value="admin">
                    {roleOption(faUserShield, t("setting.admin"), "Akses penuh sistem")}
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        )}
      </ModalComponent>
    </>
  );
};

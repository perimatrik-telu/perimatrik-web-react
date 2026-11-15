import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import {
  DashboardRowActions,
  DashboardTable,
  type DashboardTableColumn,
} from "../../components/dashboard/DashboardTable";
import { useAuth } from "../../hooks/useAuth";
import { useConfirm } from "../../components/dashboard/confirm-context";

type PagedResponse<T> = {
  data: T[];
  meta?: {
    total?: number;
  };
};

type FetchContentRows<T> = (options: {
  page: number;
  limit: number;
  userId?: string;
}) => Promise<PagedResponse<T> | null>;

type ContentTablePageProps<T extends { id: string }> = {
  title: string;
  description: string;
  createLabel: string;
  createPath: string;
  getEditPath: (row: T) => string;
  columns: DashboardTableColumn<T>[];
  fetchRows: FetchContentRows<T>;
  deleteRow: (id: string) => Promise<unknown>;
  searchPlaceholder: string;
  filterRow: (row: T, query: string) => boolean;
  emptyTitle: string;
  forceUserFilter?: boolean;
};

export const ContentTablePage = <T extends { id: string }>({
  title,
  description,
  createLabel,
  createPath,
  getEditPath,
  columns,
  fetchRows,
  deleteRow,
  searchPlaceholder,
  filterRow,
  emptyTitle,
  forceUserFilter,
}: ContentTablePageProps<T>) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadRows = async () => {
    if (!user) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetchRows({
        page: page + 1,
        limit: rowsPerPage,
        userId: forceUserFilter ? user.id : (user.role !== "admin" ? user.id : undefined),
      });
      setRows(response?.data ?? []);
      setTotal(response?.meta?.total ?? response?.data?.length ?? 0);
    } catch (error) {
      console.error(`Failed to fetch ${title}:`, error);
      toast.error(`Gagal memuat ${title.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadRows();
    }, 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, user?.id, user?.role]);

  const visibleRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return rows;
    }

    return rows.filter((row) => filterRow(row, query));
  }, [filterRow, rows, searchQuery]);

  const handleDelete = async (row: T) => {
    const confirmed = await confirm({
      title: `Hapus ${title.toLowerCase()} ini?`,
      description: "Tindakan ini tidak dapat dibatalkan.",
    });
    if (!confirmed) {
      return;
    }

    setDeletingId(row.id);
    try {
      await deleteRow(row.id);
      toast.success(`${title} berhasil dihapus`);
      await loadRows();
    } catch (error) {
      console.error(`Failed to delete ${title}:`, error);
      toast.error(`${title} gagal dihapus`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardTable
      title={title}
      description={description}
      columns={columns}
      rows={visibleRows}
      loading={loading}
      page={searchQuery ? 0 : page}
      rowsPerPage={rowsPerPage}
      totalCount={searchQuery ? visibleRows.length : total}
      searchValue={searchQuery}
      searchPlaceholder={searchPlaceholder}
      onSearchChange={(value) => {
        setSearchQuery(value);
        setPage(0);
      }}
      actions={[
        {
          label: createLabel,
          onClick: () => navigate(createPath),
          icon: <FontAwesomeIcon icon={faPlus} />,
        },
      ]}
      emptyTitle={emptyTitle}
      minWidth={920}
      onPageChange={setPage}
      onRowsPerPageChange={(value) => {
        setRowsPerPage(value);
        setPage(0);
      }}
      renderRowActions={(row) => (
        <DashboardRowActions
          onEdit={() => navigate(getEditPath(row))}
          onDelete={() => handleDelete(row)}
          deleting={deletingId === row.id}
          deleteDisabled={Boolean(deletingId && deletingId !== row.id)}
        />
      )}
    />
  );
};

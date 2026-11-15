import type { ReactNode } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { CountBadge, PageHeader } from "./PageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

const visuallyHidden = {
  // Explicit px: in MUI `sx`, numeric width/height <= 1 mean percentages.
  border: 0, clip: "rect(0 0 0 0)", height: "1px", margin: "-1px", overflow: "hidden", padding: 0, position: "absolute", whiteSpace: "nowrap", width: "1px",
} as const;

const ButtonText = ({ children }: { children: ReactNode }) => (
  <Box
    component="span"
    sx={{
      minWidth: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      display: "block",
    }}
  >
    {children}
  </Box>
);

export type DashboardTableColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  width?: number | string;
  render?: (row: T, index: number) => ReactNode;
};

export type DashboardTableAction = {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning" | "inherit";
  disabled?: boolean;
  loading?: boolean;
};

type DashboardTableProps<T extends { id: string | number }> = {
  title: string;
  description?: string;
  columns: DashboardTableColumn<T>[];
  rows: T[];
  getRowId?: (row: T) => string | number;
  loading?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  actions?: DashboardTableAction[];
  filters?: ReactNode;
  renderRowActions?: (row: T, index: number) => ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  page: number;
  rowsPerPage: number;
  totalCount: number;
  rowsPerPageOptions?: number[];
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  minWidth?: number;
};

export const DashboardTable = <T extends { id: string | number }>({
  title,
  description,
  columns,
  rows,
  getRowId = (row) => row.id,
  loading = false,
  searchValue = "",
  searchPlaceholder = "Cari data...",
  onSearchChange,
  actions = [],
  filters,
  renderRowActions,
  emptyTitle = "Data tidak ditemukan",
  emptyDescription = "Tidak ada data yang cocok dengan filter saat ini.",
  page,
  rowsPerPage,
  totalCount,
  rowsPerPageOptions = [5, 10, 25],
  onPageChange,
  onRowsPerPageChange,
  minWidth = 860,
}: DashboardTableProps<T>) => {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
  const colSpan = columns.length + (renderRowActions ? 1 : 0);
  const options = rowsPerPageOptions.includes(rowsPerPage)
    ? rowsPerPageOptions
    : [...rowsPerPageOptions, rowsPerPage].sort((a, b) => a - b);
  const hasToolbar = Boolean(onSearchChange || filters);

  return (
    <Stack spacing={3}>
      <PageHeader
        title={title}
        description={description}
        meta={<CountBadge>{totalCount} data</CountBadge>}
        actions={actions.length > 0 ? actions.map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={action.variant ?? "contained"}
            color={action.color ?? "primary"}
            disabled={action.disabled || action.loading}
            onClick={action.onClick}
            startIcon={action.loading ? <CircularProgress size={14} color="inherit" /> : action.icon}
            sx={{ minWidth: 0, maxWidth: { sm: 220 }, "& .MuiButton-startIcon svg": { fontSize: 13 } }}
          >
            <ButtonText>{action.label}</ButtonText>
          </Button>
        )) : undefined}
      />

      <Paper
        variant="outlined"
        sx={{ overflow: "hidden", borderRadius: 3, borderColor: "divider", bgcolor: "background.paper", boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)" }}
      >
        {hasToolbar && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            sx={{
              px: { xs: 2, md: 2.5 },
              py: 2,
              alignItems: { xs: "stretch", sm: "center" },
              borderBottom: "1px solid",
              borderColor: "divider",
              flexWrap: "wrap",
              rowGap: 1.25,
            }}
          >
            {onSearchChange && (
              <TextField
                size="small"
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={(event) => onSearchChange(event.target.value)}
                sx={{ flex: { xs: "1 1 auto", sm: "0 1 360px" }, "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start" sx={{ color: "text.disabled", fontSize: 14 }}>
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                      </InputAdornment>
                    ),
                  },
                  htmlInput: { "aria-label": searchPlaceholder },
                }}
              />
            )}
            {filters}
          </Stack>
        )}

        {isCompact ? (
          // Small screens: stacked rows instead of a wide table (a wide table widens the mobile viewport).
          loading ? (
            <Stack spacing={2} sx={{ p: 2 }}>
              {Array.from({ length: Math.min(rowsPerPage, 4) }).map((_, i) => <Skeleton key={i} variant="rounded" height={64} />)}
            </Stack>
          ) : rows.length === 0 ? (
          <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
            <Box
              sx={{
                width: 48, height: 48, mx: "auto", mb: 2, borderRadius: 2.5, display: "grid", placeItems: "center",
                color: "text.secondary", border: "1px solid", borderColor: "divider", bgcolor: "background.paper",
                boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
              }}
            >
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{emptyTitle}</Typography>
            <Typography sx={{ mt: 0.5, fontSize: 14, color: "text.secondary" }}>{emptyDescription}</Typography>
          </Box>
          ) : (
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
              {rows.map((row, index) => {
                const [primary, ...rest] = columns;
                return (
                  <Box component="li" key={getRowId(row)} sx={{ px: 2, py: 1.75, "&:not(:last-child)": { borderBottom: "1px solid", borderColor: "divider" } }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                      <Box sx={{ minWidth: 0, flexGrow: 1, fontSize: 14, color: "text.primary", "& *": { maxWidth: "100%" } }}>
                        {primary.render ? primary.render(row, index) : String(row[primary.key as keyof T] ?? "-")}
                      </Box>
                      {renderRowActions && <Box sx={{ flexShrink: 0, mt: -0.5 }}>{renderRowActions(row, index)}</Box>}
                    </Stack>
                    {rest.length > 0 && (
                      <Box component="dl" sx={{ m: 0, mt: 1.25, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 1.25 }}>
                        {rest.map((column) => (
                          <Box key={column.key} sx={{ minWidth: 0 }}>
                            <Box component="dt" sx={{ fontSize: 12, color: "text.disabled", fontWeight: 500 }}>{column.label}</Box>
                            <Box component="dd" sx={{ m: 0, mt: 0.25, fontSize: 13, color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {column.render ? column.render(row, index) : String(row[column.key as keyof T] ?? "-")}
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          )
        ) : (
        <TableContainer sx={{ maxWidth: "100%" }}>
          <Table sx={{ minWidth }}>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align ?? "left"} sx={{ width: column.width, py: 1.25, whiteSpace: "nowrap" }}>
                    {column.label}
                  </TableCell>
                ))}
                {renderRowActions && (
                  <TableCell align="right" sx={{ width: 112, py: 1.25 }}>
                    <Box component="span" sx={visuallyHidden}>Aksi</Box>
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: Math.min(rowsPerPage, 6) }).map((_, rowIndex) => (
                  <TableRow key={`loading-${rowIndex}`}>
                    {Array.from({ length: colSpan }).map((__, cellIndex) => (
                      <TableCell key={`${rowIndex}-${cellIndex}`} sx={{ py: 2 }}>
                        <Skeleton height={20} sx={{ maxWidth: cellIndex === 0 ? 220 : 120 }} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={colSpan} align="center" sx={{ py: 8, borderBottom: 0 }}>
                    <Box
                      sx={{
                        width: 48, height: 48, mx: "auto", mb: 2, borderRadius: 2.5, display: "grid", placeItems: "center",
                        color: "text.secondary", border: "1px solid", borderColor: "divider", bgcolor: "background.paper",
                        boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
                      }}
                    >
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </Box>
                    <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{emptyTitle}</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: 14, color: "text.secondary" }}>{emptyDescription}</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <TableRow key={getRowId(row)} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                    {columns.map((column) => (
                      <TableCell key={column.key} align={column.align ?? "left"} sx={{ py: 1.5, fontSize: 14, color: "text.secondary", verticalAlign: "middle" }}>
                        {column.render ? column.render(row, index) : String(row[column.key as keyof T] ?? "-")}
                      </TableCell>
                    ))}
                    {renderRowActions && (
                      <TableCell align="right" sx={{ py: 1.5, verticalAlign: "middle" }}>
                        {renderRowActions(row, index)}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}

        <TablePagination
          rowsPerPageOptions={options}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          labelRowsPerPage={isCompact ? "Baris" : "Baris per halaman"}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
          onPageChange={(_, nextPage) => onPageChange(nextPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          sx={{ borderTop: "1px solid", borderColor: "divider", color: "text.secondary", "& .MuiTablePagination-toolbar": { minHeight: 56 } }}
        />
      </Paper>
    </Stack>
  );
};

export const DashboardRowActions = ({
  onEdit,
  onDelete,
  editLabel = "Ubah",
  deleteLabel = "Hapus",
  deleting = false,
  deleteDisabled = false,
}: {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
  deleting?: boolean;
  deleteDisabled?: boolean;
}) => (
  <Stack direction="row" spacing={0.5} sx={{ justifyContent: "flex-end", alignItems: "center" }}>
    <Tooltip title={editLabel}>
      <IconButton aria-label={editLabel} size="small" onClick={onEdit} sx={rowActionSx}>
        <FontAwesomeIcon icon={faPen} />
      </IconButton>
    </Tooltip>
    <Tooltip title={deleteLabel}>
      <span>
        <IconButton
          aria-label={deleteLabel}
          size="small"
          disabled={deleteDisabled || deleting}
          onClick={onDelete}
          sx={{ ...rowActionSx, "&:hover": { color: "error.main", bgcolor: "action.hover" } }}
        >
          {deleting ? <CircularProgress size={14} color="inherit" /> : <FontAwesomeIcon icon={faTrash} />}
        </IconButton>
      </span>
    </Tooltip>
  </Stack>
);

const rowActionSx = {
  width: 34,
  height: 34,
  fontSize: 14,
  borderRadius: 2,
  color: "text.secondary",
  "&:hover": { color: "text.primary", bgcolor: "action.hover" },
} as const;

export const TableImage = ({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) => (
  <Box
    component="img"
    src={src || "/images/empty-image.webp"}
    alt={alt}
    sx={{
      width: 64,
      height: 44,
      flexShrink: 0,
      objectFit: "cover",
      borderRadius: 1.5,
      display: "block",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "action.hover",
    }}
  />
);

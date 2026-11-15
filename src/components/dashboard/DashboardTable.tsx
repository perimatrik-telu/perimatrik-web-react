import type { ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
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
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

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
  const colSpan = columns.length + (renderRowActions ? 1 : 0);
  const options = rowsPerPageOptions.includes(rowsPerPage)
    ? rowsPerPageOptions
    : [...rowsPerPageOptions, rowsPerPage].sort((a, b) => a - b);

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: "hidden",
        borderRadius: 1,
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Box
        sx={{
          p: { xs: 2, md: 2.5 },
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.025),
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Chip
                label={`${totalCount} data`}
                size="small"
                sx={{
                  height: 22,
                  borderRadius: 1,
                  fontWeight: 800,
                  color: "primary.dark",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              />
            </Stack>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{
              minWidth: { lg: 520 },
              width: { xs: "100%", lg: "auto" },
              flexWrap: "wrap",
              rowGap: 1.25,
              "& .MuiTextField-root": {
                flex: { xs: "1 1 100%", sm: "1 1 220px" },
                minWidth: 0,
              },
              "& .MuiFormControl-root": {
                flexShrink: 0,
              },
            }}
          >
            {onSearchChange && (
              <TextField
                size="small"
                fullWidth
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={(event) => onSearchChange(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1,
                    bgcolor: "background.paper",
                  },
                }}
              />
            )}

            {filters}

            {actions.map((action) => (
              <Button
                key={action.label}
                type="button"
                variant={action.variant ?? "contained"}
                color={action.color ?? "primary"}
                disabled={action.disabled || action.loading}
                onClick={action.onClick}
                sx={{
                  gap: 1,
                  minWidth: 0,
                  maxWidth: { xs: "100%", sm: 180 },
                  flexShrink: 0,
                  justifyContent: "center",
                  px: 1.5,
                }}
              >
                {action.loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  action.icon
                )}
                <ButtonText>{action.label}</ButtonText>
              </Button>
            ))}
          </Stack>
        </Stack>
      </Box>

      <TableContainer sx={{ maxWidth: "100%" }}>
        <Table size="small" sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align ?? "left"}
                  sx={{ width: column.width, py: 1.6 }}
                >
                  {column.label}
                </TableCell>
              ))}
              {renderRowActions && (
                <TableCell align="right" sx={{ width: 220, py: 1.6 }}>
                  Aksi
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: Math.min(rowsPerPage, 6) }).map((_, rowIndex) => (
                <TableRow key={`loading-${rowIndex}`}>
                  {Array.from({ length: colSpan }).map((__, cellIndex) => (
                    <TableCell key={`${rowIndex}-${cellIndex}`} sx={{ py: 1.5 }}>
                      <Skeleton height={24} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={colSpan} align="center" sx={{ py: 7 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {emptyTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {emptyDescription}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={getRowId(row)}
                  hover
                  sx={{
                    "&:last-child td": {
                      borderBottom: 0,
                    },
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      align={column.align ?? "left"}
                      sx={{ py: 1.35, verticalAlign: "middle" }}
                    >
                      {column.render ? column.render(row, index) : String(row[column.key as keyof T] ?? "-")}
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell
                      align="right"
                      sx={{ width: 220, py: 1.35, verticalAlign: "middle" }}
                    >
                      {renderRowActions(row, index)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={options}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      />
    </Paper>
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
  <Stack
    direction="row"
    spacing={1}
    justifyContent="flex-end"
    alignItems="center"
    sx={{ flexWrap: "wrap", rowGap: 1, maxWidth: 220, ml: "auto" }}
  >
    <Button
      type="button"
      size="small"
      variant="outlined"
      onClick={onEdit}
      sx={{ gap: 0.75, minWidth: 0, maxWidth: 96, px: 1 }}
    >
      <FontAwesomeIcon icon={faPen} />
      <ButtonText>{editLabel}</ButtonText>
    </Button>
    <Button
      type="button"
      size="small"
      variant="outlined"
      color="error"
      disabled={deleteDisabled || deleting}
      onClick={onDelete}
      sx={{ gap: 0.75, minWidth: 0, maxWidth: 108, px: 1 }}
    >
      {deleting ? <CircularProgress size={14} color="inherit" /> : <FontAwesomeIcon icon={faTrash} />}
      <ButtonText>{deleteLabel}</ButtonText>
    </Button>
  </Stack>
);

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
      width: 76,
      height: 54,
      objectFit: "cover",
      borderRadius: 1,
      display: "block",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "grey.100",
    }}
  />
);

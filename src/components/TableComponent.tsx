import { useTranslation } from "react-i18next";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { ReactSortable } from "react-sortablejs";

type TableRowData = { id: string | number } & Record<string, ReactNode>;

type Column<T = TableRowData> = {
  key: string;
  label: string;
  render?: (row: T, index: number) => ReactNode;
};

type TableComponentProps<T extends TableRowData = TableRowData> = {
  columns: Column<T>[];
  data: T[];
  renderRowActions?: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  setList?: (newState: T[]) => void;
};

export const TableComponent = <T extends TableRowData = TableRowData>({
  columns,
  data,
  renderRowActions,
  sortable = false,
  setList,
}: TableComponentProps<T>) => {
  const { t } = useTranslation();
  const tableRows = data.map((row, index) => (
    <TableRow key={row.id || index}
      sx={{
        cursor: sortable ? "grab" : "default",
        "&:nth-of-type(odd)": {
          backgroundColor: (theme) => theme.palette.action.hover,
        },
      }}
    >
      {columns.map((column) => (
        <TableCell key={column.key} size="small" sx={{ py: 1, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>
          {column.render ? column.render(row, index) : row[column.key]}
        </TableCell>
      ))}
      {renderRowActions && (
        <TableCell align="center" size="small" sx={{ py: 1, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>
          {renderRowActions(row, index)}
        </TableCell>
      )}
    </TableRow>
  ));

  const renderTableBodyContent = () => {
    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length + (renderRowActions ? 1 : 0)}
            align="center"
            size="small"
            sx={{ py: 1, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}
          >
            <Typography>{t("crud.noResults")}</Typography>
          </TableCell>
        </TableRow>
      );
    }
    return tableRows;
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      <Table sx={{ whiteSpace: "nowrap", mt: 2 }} size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} size="small" sx={{ py: 1, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {column.label}
                </Typography>
              </TableCell>
            ))}
            {renderRowActions && <TableCell align="center" size="small" sx={{ py: 1, borderBottom: "1px solid rgba(224, 224, 224, 1)" }}>{t("crud.actions")}</TableCell>}
          </TableRow>
        </TableHead>
        {sortable && setList ? (
          <ReactSortable
            list={data}
            setList={setList}
            tag="tbody"
            style={{ display: "table-row-group" }}
          >
            {renderTableBodyContent()}
          </ReactSortable>
        ) : (
          <TableBody>{renderTableBodyContent()}</TableBody>
        )}
      </Table>
    </Box>
  );
};

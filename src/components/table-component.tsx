import { useTranslation } from "react-i18next";
"use client";


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

const TableComponent = <T extends TableRowData = TableRowData>({
  columns,
  data,
  renderRowActions,
  sortable = false,
  setList,
}: TableComponentProps<T>) => {
  const { t } = useTranslation();
  const renderTableBody = () => {
    if (data.length === 0) {
      return (
        <TableRow>
          <TableCell
            colSpan={columns.length + (renderRowActions ? 1 : 0)}
            align="center"
          >
            <Typography>{t("crud.noResults")}</Typography>
          </TableCell>
        </TableRow>
      );
    }

    const rows = data.map((row, index) => (
      <TableRow key={row.id || index} sx={{ cursor: sortable ? "grab" : "default" }}>
        {columns.map((column) => (
          <TableCell key={column.key}>
            {column.render ? column.render(row, index) : row[column.key]}
          </TableCell>
        ))}
        {renderRowActions && (
          <TableCell align="center">
            {renderRowActions(row, index)}
          </TableCell>
        )}
      </TableRow>
    ));

    if (sortable && setList) {
      return (
        <ReactSortable
          list={data}
          setList={setList}
          tag="tbody"
          style={{ display: "table-row-group" }}
        >
          {rows}
        </ReactSortable>
      );
    }
    return <TableBody>{rows}</TableBody>;
  };

  return (
    <Box sx={{ overflow: "auto" }}>
      <Table sx={{ whiteSpace: "nowrap", mt: 2 }}>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {column.label}
                </Typography>
              </TableCell>
            ))}
            {renderRowActions && <TableCell align="center">{t("crud.actions")}</TableCell>}
          </TableRow>
        </TableHead>
        {renderTableBody()}
      </Table>
    </Box>
  );
};

export default TableComponent;

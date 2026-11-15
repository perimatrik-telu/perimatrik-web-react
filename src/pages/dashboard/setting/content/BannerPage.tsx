import { useState, useEffect } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash, faEye } from "@fortawesome/free-solid-svg-icons";
import { TableComponent } from "../../../../components/TableComponent"; // Adjusted import path

type BannerItem = {
  id: number;
  name: string;
  description: string;
};

export const BannerPage = () => {
  const [items, setItems] = useState<BannerItem[]>([
    { id: 1, name: "Banner 1", description: "This is Banner 1" },
    { id: 2, name: "Banner 2", description: "This is Banner 2" },
    { id: 3, name: "Banner 3", description: "This is Banner 3" },
    { id: 4, name: "Banner 4", description: "This is Banner 4" },
  ]);

  useEffect(() => {
    document.title = "Settings - Dashboard";
  }, []);

  const columns = [
    { key: "name", label: "Banner Name" },
    { key: "description", label: "Description" },
  ];

  const handleEdit = () => {
    //console.log("Edit");
  };

  const handleDelete = () => {
    //console.log("Delete");
  };

  const handleView = () => {
    //console.log("View");
  };

  const renderRowActions = () => (
    <Box>
      <IconButton onClick={handleEdit} size="small">
        <FontAwesomeIcon icon={faEdit} />
      </IconButton>
      <IconButton onClick={handleDelete} size="small">
        <FontAwesomeIcon icon={faTrash} />
      </IconButton>
      <IconButton onClick={handleView} size="small">
        <FontAwesomeIcon icon={faEye} />
      </IconButton>
    </Box>
  );

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sortable Banners Table
      </Typography>
      <TableComponent
        columns={columns}
        data={items}
        setList={setItems}
        sortable={true}
        renderRowActions={renderRowActions}
      />
    </Box>
  );
};

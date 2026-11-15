import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical, faPlus } from "@fortawesome/free-solid-svg-icons";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Menu,
  MenuItem,
  TextField,
  Avatar,
  Select,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import ModalComponent from "../../../../components/modal-component"; // Adjusted import path to MUI ModalComponent

const products = [
  {
    id: "1",
    name: "Muhammad Idris",
    post: "AP.KMP.XXX",
    angkatan: "Ksatria Halintang",
    role: "Anggota",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8M….webp",
  },
];

const roles = ["All", "Anggota", "Admin", "User"];

export const ForcePage = () => {
  const { t } = useTranslation();
  // Renamed component
  // State Management
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [, setSelectedProduct] = useState<(typeof products)[number] | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedAngkatan, setSelectedAngkatan] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", post: "" });

  useEffect(() => {
    document.title = "Force Settings - Dashboard";
  }, []);

  const uniqueAngkatans = [
    ...new Set(products.map((product) => product.angkatan)),
  ];

  // Handlers
  const handleMenuOpen = (
    event: React.MouseEvent<SVGSVGElement | HTMLElement>,
    product: (typeof products)[number],
  ) => {
    setAnchorEl(event.currentTarget as HTMLElement);
    setSelectedProduct(product);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleModalToggle = () => {
    setIsModalOpen((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = () => {
    handleModalToggle();
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || product.role === selectedRole;
    const matchesAngkatan =
      selectedAngkatan === "All" || product.angkatan === selectedAngkatan;
    return matchesSearch && matchesRole && matchesAngkatan;
  });

  return (
    <>
      {/* Search and Add User */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{
            height: "44px",
            "& .MuiOutlinedInput-root": {
              height: "100%",
              padding: "0",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={handleModalToggle}
          sx={{ height: "44px", minWidth: "56px" }}
        >
          <FontAwesomeIcon icon={faPlus} size="lg" />
        </Button>
      </Box>

      {/* Modal */}
      <ModalComponent
        isOpen={isModalOpen}
        title="Add New User"
        onClose={handleModalToggle}
        onSave={handleSave}
      >
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          margin="normal"
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Post"
          name="post"
          value={formData.post}
          onChange={handleInputChange}
          margin="normal"
          variant="outlined"
        />
      </ModalComponent>

      {/* Filters */}
      <Box sx={{ mb: 2, display: "flex", gap: 2 }}>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label={t("form.role")}
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Angkatan</InputLabel>
          <Select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            label={t("form.angkatan")}
          >
            <MenuItem value="All">{t("setting.all")}</MenuItem>
            {uniqueAngkatans.map((angkatan) => (
              <MenuItem key={angkatan} value={angkatan}>
                {angkatan}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Box sx={{ overflow: "auto" }}>
        <Table sx={{ whiteSpace: "nowrap", mt: 2 }}>
          <TableHead>
            <TableRow>
              {["No", "Anggota", "Angkatan", "Role", "Action"].map(
                (heading) => (
                  <TableCell key={heading}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {heading}
                    </Typography>
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <TableRow key={product.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={product.photo}
                        alt={product.name}
                        sx={{ width: 35, height: 35, mr: 1 }}
                      />
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                          {product.name}
                        </Typography>
                        <Typography color="textSecondary" sx={{ fontSize: 14 }}>
                          {product.post}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14 }}>{product.angkatan}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ fontSize: 14 }}>{product.role}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <FontAwesomeIcon
                      icon={faEllipsisVertical}
                      style={{ cursor: "pointer" }}
                      onClick={(event) => handleMenuOpen(event, product)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography>{t("crud.noResults")}</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleMenuClose}>
        {["Edit", "Delete", "View Details"].map((action) => (
          <MenuItem key={action} onClick={handleMenuClose}>
            {action}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

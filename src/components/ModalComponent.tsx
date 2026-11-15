import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Grid,
  Avatar,
  Paper,
  Fade,
  Zoom,
  Divider,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdCard, faUserTag } from "@fortawesome/free-solid-svg-icons";
import {
  faInstagram,
  faFacebook,
  faLinkedin,
  faTiktok,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeContext } from "../context/theme-context";

interface Angkatan {
  id: string;
  nama_angkatan: string;
  year: string;
}

interface Member {
  id: string;
  no_anggota: string;
  nama_lengkap: string;
  nama_lapangan: string;
  domisili: string;
  kontak: string;
  avatar?: string;
  angkatan: Angkatan;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  tiktok?: string;
  youtube?: string;
}

interface ModalComponentProps {
  show: boolean;
  onHide: () => void;
  members: Member[];
  angkatan: string;
}

const ModalComponent: React.FC<ModalComponentProps> = ({
  show,
  onHide,
  members,
  angkatan,
}) => {
  const { mode } = useThemeContext();
  const primaryOrange = "#e67817";
  const secondaryOrange = "#ff9800";

  return (
    <Dialog
      open={show}
      onClose={onHide}
      maxWidth="md"
      fullWidth
      scroll="paper"
      TransitionComponent={Fade}
      transitionDuration={400}
      PaperProps={{
        sx: {
          borderRadius: 5,
          boxShadow: "0 25px 70px rgba(0,0,0,0.3)",
          overflow: "hidden",
          bgcolor: mode === "dark" ? "#121212" : "#ffffff",
          backgroundImage: "none",
        },
      }}
    >
      {/* HEADER WITH PERIMATRIK ORANGE GRADIENT */}
      <DialogTitle
        sx={{
          m: 0,
          p: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
          color: "white",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              'url("https://www.transparenttextures.com/patterns/carbon-fibre.webp")',
            opacity: 0.1,
            pointerEvents: "none",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography
            variant="overline"
            sx={{ letterSpacing: 3, opacity: 0.9, fontWeight: "900" }}
          >
            LIST ANGGOTA RESMI
          </Typography>
          <Typography
            variant="h4"
            fontWeight="900"
            sx={{
              letterSpacing: "-1px",
              mt: -0.5,
              textShadow: "0 2px 10px rgba(0,0,0,0.2)",
            }}
          >
            Angkatan {angkatan}
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={onHide}
          sx={{
            position: "relative",
            zIndex: 1,
            color: "white",
            bgcolor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(4px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.3)",
              transform: "rotate(90deg)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2, md: 5 },
          pt: { xs: 4, md: 6 },
          bgcolor: mode === "dark" ? "#1a1a1a" : "#fdfdfd",
          "&::-webkit-scrollbar": { width: "8px" },
          "&::-webkit-scrollbar-track": {
            background: mode === "dark" ? "#121212" : "#f1f1f1",
          },
          "&::-webkit-scrollbar-thumb": {
            background: primaryOrange,
            borderRadius: "10px",
          },
        }}
      >
        <Grid container spacing={3} marginTop={2}>
          <AnimatePresence>
            {members && members.length > 0 ? (
              members.map((member, index) => (
                <Grid item xs={12} sm={6} md={4} key={member.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid",
                        borderColor:
                          mode === "dark"
                            ? "rgba(255,255,255,0.05)"
                            : "rgba(0,0,0,0.05)",
                        textAlign: "center",
                        height: "100%",
                        position: "relative",
                        overflow: "hidden",
                        bgcolor:
                          mode === "dark" ? "rgba(255,255,255,0.03)" : "white",
                        transition:
                          "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        "&:hover": {
                          transform: "translateY(-8px)",
                          boxShadow:
                            mode === "dark"
                              ? `0 15px 35px rgba(0,0,0,0.4)`
                              : `0 15px 35px ${primaryOrange}15`,
                          borderColor: `${primaryOrange}60`,
                          "& .avatar-glow": {
                            opacity: 1,
                            transform: "scale(1.1)",
                          },
                        },
                      }}
                    >
                      <Box
                        className="avatar-glow"
                        sx={{
                          position: "absolute",
                          top: -20,
                          left: "50%",
                          transform: "translateX(-50%) scale(0.8)",
                          width: 120,
                          height: 120,
                          bgcolor: primaryOrange,
                          filter: "blur(45px)",
                          opacity: 0,
                          borderRadius: "50%",
                          transition: "all 0.4s ease",
                          zIndex: 0,
                        }}
                      />

                      <Box sx={{ position: "relative", zIndex: 1 }}>
                        <Avatar
                          src={member.avatar || "/images/default-avatar.webp"}
                          alt={member.nama_lengkap}
                          sx={{
                            width: 90,
                            height: 90,
                            mx: "auto",
                            mb: 2.5,
                            border: `4px solid ${mode === "dark" ? "#333" : "white"}`,
                            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
                          }}
                        />

                        <Typography
                          variant="subtitle1"
                          fontWeight="900"
                          sx={{
                            mb: 0.5,
                            color: mode === "dark" ? "white" : "#333",
                            lineHeight: 1.2,
                          }}
                        >
                          {member.nama_lengkap}
                        </Typography>

                        {member.nama_lapangan && (
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 1,
                              px: 1.5,
                              py: 0.3,
                              bgcolor:
                                mode === "dark"
                                  ? `${primaryOrange}30`
                                  : `${primaryOrange}15`,
                              borderRadius: 2,
                              mb: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color={primaryOrange}
                              fontWeight="900"
                              sx={{ fontStyle: "italic", letterSpacing: 0.5 }}
                            >
                              "{member.nama_lapangan.toUpperCase()}"
                            </Typography>
                          </Box>
                        )}

                        <Divider
                          sx={{ my: 2, opacity: mode === "dark" ? 0.1 : 0.5 }}
                        />

                        {/* SOCIAL MEDIA ICONS */}
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                          sx={{ mb: 2 }}
                        >
                          {member.instagram && (
                            <IconButton
                              size="small"
                              component="a"
                              href={
                                member.instagram.startsWith("http")
                                  ? member.instagram
                                  : `https://instagram.com/${member.instagram.replace("@", "")}`
                              }
                              target="_blank"
                              sx={{ color: "#E4405F", p: 0.5 }}
                            >
                              <FontAwesomeIcon
                                icon={faInstagram}
                                style={{ fontSize: "16px" }}
                              />
                            </IconButton>
                          )}
                          {member.facebook && (
                            <IconButton
                              size="small"
                              component="a"
                              href={
                                member.facebook.startsWith("http")
                                  ? member.facebook
                                  : `https://facebook.com/${member.facebook}`
                              }
                              target="_blank"
                              sx={{ color: "#1877F2", p: 0.5 }}
                            >
                              <FontAwesomeIcon
                                icon={faFacebook}
                                style={{ fontSize: "16px" }}
                              />
                            </IconButton>
                          )}
                          {member.linkedin && (
                            <IconButton
                              size="small"
                              component="a"
                              href={
                                member.linkedin.startsWith("http")
                                  ? member.linkedin
                                  : `https://linkedin.com/in/${member.linkedin}`
                              }
                              target="_blank"
                              sx={{ color: "#0077B5", p: 0.5 }}
                            >
                              <FontAwesomeIcon
                                icon={faLinkedin}
                                style={{ fontSize: "16px" }}
                              />
                            </IconButton>
                          )}
                          {member.tiktok && (
                            <IconButton
                              size="small"
                              component="a"
                              href={
                                member.tiktok.startsWith("http")
                                  ? member.tiktok
                                  : `https://tiktok.com/@${member.tiktok.replace("@", "")}`
                              }
                              target="_blank"
                              sx={{
                                color: mode === "dark" ? "white" : "#000000",
                                p: 0.5,
                              }}
                            >
                              <FontAwesomeIcon
                                icon={faTiktok}
                                style={{ fontSize: "16px" }}
                              />
                            </IconButton>
                          )}
                          {member.youtube && (
                            <IconButton
                              size="small"
                              component="a"
                              href={
                                member.youtube.startsWith("http")
                                  ? member.youtube
                                  : `https://youtube.com/${member.youtube}`
                              }
                              target="_blank"
                              sx={{ color: "#FF0000", p: 0.5 }}
                            >
                              <FontAwesomeIcon
                                icon={faYoutube}
                                style={{ fontSize: "16px" }}
                              />
                            </IconButton>
                          )}
                        </Stack>

                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          spacing={1}
                        >
                          <FontAwesomeIcon
                            icon={faIdCard}
                            style={{
                              fontSize: "11px",
                              color: primaryOrange,
                              opacity: 0.6,
                            }}
                          />
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight="800"
                            sx={{ letterSpacing: 1.5 }}
                          >
                            {member.no_anggota}
                          </Typography>
                        </Stack>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Box sx={{ py: 10, textAlign: "center" }}>
                  <Zoom in timeout={500}>
                    <Box>
                      <FontAwesomeIcon
                        icon={faUserTag}
                        size="4x"
                        style={{
                          opacity: 0.1,
                          color: primaryOrange,
                          marginBottom: "20px",
                        }}
                      />
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        fontWeight="light"
                      >
                        Belum ada data anggota untuk angkatan ini.
                      </Typography>
                    </Box>
                  </Zoom>
                </Box>
              </Grid>
            )}
          </AnimatePresence>
        </Grid>
      </DialogContent>

      {/* FOOTER ACTION */}
      <Box
        sx={{
          p: 2.5,
          textAlign: "center",
          bgcolor: mode === "dark" ? "#121212" : "white",
          borderTop:
            mode === "dark"
              ? "1px solid rgba(255,255,255,0.05)"
              : "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Box
          component="button"
          onClick={onHide}
          sx={{
            border: "none",
            background: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
            color: "text.secondary",
            fontWeight: "900",
            textTransform: "uppercase",
            letterSpacing: 1,
            fontSize: "0.75rem",
            "&:hover": { color: primaryOrange, bgcolor: "transparent" },
          }}
        >
          Tutup Jendela
        </Box>
      </Box>
    </Dialog>
  );
};

export default ModalComponent;

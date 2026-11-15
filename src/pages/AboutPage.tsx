import { useTranslation } from "react-i18next";

import { useState, useEffect } from "react";
import {
  faFacebookSquare,
  faInstagram,
  faTiktok,
  faXTwitter,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";
import {
  faCalendar,
  faTree,
  faUsers,
  faQuoteLeft,
  faAward,
  faCompass,
  faMapMarkedAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CountUpModule from "react-countup";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Stack,
  Container,
} from "@mui/material";
import ModalComponent from "../components/ModalComponent";
import DirectionPartial from "../partials/DirectionPartial";
import { useThemeContext } from "../context/theme-context";
import api from "../api/api";
import "../../public/css/about.css";

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
}

interface GroupedMembers {
  [key: string]: Member[];
}

interface ForceItem {
  id: string;
  forceName: string;
  year: string;
  desc: string;
}

const primaryOrange = "#e67817";
const secondaryOrange = "#ff9800";
const CountUp =
  ((CountUpModule as unknown as { default?: typeof CountUpModule }).default ??
    CountUpModule);

const AboutPage = () => {
  const { t } = useTranslation();
  const { mode } = useThemeContext();

  useEffect(() => {
    document.title = "About Us - PERIMATRIK";
  }, []);

  const [showAll, setShowAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedForce, setSelectedForce] = useState<ForceItem | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [groupedMembers, setGroupedMembers] = useState<GroupedMembers>({});
  const [sejarahData, setSejarahData] = useState<ForceItem[]>([]);

  const handleShowModal = (item: ForceItem) => {
    setSelectedForce(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedForce(null);
  };

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get("/content/member");
        setMembers(response.data.data);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }
    };
    fetchMembers();
  }, []);

  useEffect(() => {
    if (members.length > 0) {
      const grouped = members.reduce((acc: GroupedMembers, member) => {
        const angkatanName = member.angkatan.nama_angkatan;
        if (!acc[angkatanName]) acc[angkatanName] = [];
        acc[angkatanName].push(member);
        return acc;
      }, {});
      setGroupedMembers(grouped);
    }
  }, [members]);

  useEffect(() => {
    if (Object.keys(groupedMembers).length > 0) {
      const generated = Object.keys(groupedMembers)
        .map((angkatanName) => {
          const angkatanData = groupedMembers[angkatanName][0].angkatan;
          return {
            id: angkatanData.id,
            forceName: angkatanName,
            year: angkatanData.year,
            desc: "Lihat Detail Anggota",
          };
        })
        .sort((a, b) => parseInt(a.year) - parseInt(b.year)); // Show oldest first for timeline logic if needed, but newest first for listing
      setSejarahData(generated.slice().reverse()); // For listing, show newest
    }
  }, [groupedMembers]);

  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div
      data-theme={mode}
      style={{
        overflowX: "hidden",
        backgroundColor: "var(--background-default)",
      }}
    >
      {/* ================= HERO OVERVIEW ================= */}
      <Box
        sx={{
          position: "relative",
          pt: { xs: 10, md: 15 },
          pb: { xs: 10, md: 12 },
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          background:
            mode === "dark"
              ? "radial-gradient(circle at 20% 30%, rgba(230, 120, 23, 0.05) 0%, transparent 50%)"
              : "radial-gradient(circle at 20% 30%, rgba(230, 120, 23, 0.03) 0%, transparent 50%)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} lg={5}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -50 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ position: "relative" }}
              >
                <Box sx={{ position: "relative", zIndex: 2 }}>
                  <img
                    src="/images/image-peri.webp"
                    alt="Perimatrik"
                    style={{
                      width: "100%",
                      borderRadius: "32px",
                      border: "12px solid white",
                      boxShadow: `0 40px 100px ${primaryOrange}25`,
                    }}
                  />
                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    style={{
                      position: "absolute",
                      top: "-30px",
                      right: "-20px",
                      zIndex: 3,
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: primaryOrange,
                          color: "white",
                          p: 1,
                          borderRadius: 2,
                          display: "flex",
                        }}
                      >
                        <FontAwesomeIcon icon={faCompass} />
                      </Box>
                      <Typography
                        variant="caption"
                        fontWeight="900"
                        letterSpacing={1}
                      >
                        ADVENTURE
                      </Typography>
                    </Paper>
                  </motion.div>
                </Box>
                <Box
                  sx={{
                    position: "absolute",
                    top: "40px",
                    left: "-40px",
                    width: "100%",
                    height: "100%",
                    border: `2px solid ${primaryOrange}`,
                    borderRadius: "32px",
                    zIndex: 1,
                    opacity: 0.2,
                  }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={7}>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Chip
                      label="ESTABLISHED 1998"
                      sx={{
                        bgcolor: `${primaryOrange}15`,
                        color: primaryOrange,
                        fontWeight: 900,
                        letterSpacing: 1.5,
                        borderRadius: "8px",
                        fontSize: "0.7rem",
                      }}
                    />
                    <Box
                      sx={{
                        flexGrow: 1,
                        height: "1px",
                        bgcolor: "rgba(0,0,0,0.05)",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h1"
                    fontWeight="900"
                    sx={{
                      fontSize: { xs: "3rem", md: "4.5rem" },
                      lineHeight: 0.9,
                      letterSpacing: "-3px",
                      color: "var(--text-primary)",
                    }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: t('about.heroTitle') }} />
                    <span
                      style={{
                        background: `linear-gradient(135deg, ${primaryOrange} 0%, ${secondaryOrange} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {t('about.heroHighlight')}
                    </span>
                  </Typography>

                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "1.2rem",
                      color: "var(--text-secondary)",
                      lineHeight: 1.8,
                      textAlign: "justify",
                      maxWidth: "600px",
                    }}
                  >
                    {t('about.heroDesc')}
                  </Typography>

                  <Box
                    sx={{
                      pt: 2,
                      display: "flex",
                      gap: 3,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="900"
                      sx={{ opacity: 0.5, letterSpacing: 2 }}
                    >
                      {t('about.connect')}
                    </Typography>
                    <Stack direction="row" spacing={2.5}>
                      {[
                        {
                          icon: faYoutube,
                          link: "https://www.youtube.com/@PERIMATRIK",
                        },
                        {
                          icon: faFacebookSquare,
                          link: "https://web.facebook.com/PERIMATRIK",
                        },
                        { icon: faXTwitter, link: "https://x.com/perimatrik" },
                        {
                          icon: faInstagram,
                          link: "https://www.instagram.com/perimatrik/",
                        },
                        {
                          icon: faTiktok,
                          link: "https://www.tiktok.com/@perimatrik",
                        },
                      ].map((social, idx) => (
                        <motion.a
                          key={idx}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ y: -5, color: primaryOrange }}
                          style={{
                            color: "var(--text-secondary)",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <FontAwesomeIcon
                            icon={social.icon}
                            style={{ fontSize: "1.6rem" }}
                          />
                        </motion.a>
                      ))}
                    </Stack>
                  </Box>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================= STATS SECTION ================= */}
      <Box
        sx={{
          py: 10,
          bgcolor: "var(--background-paper)",
          position: "relative",
          zIndex: 5,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} ref={ref}>
            {[
              {
                icon: faUsers,
                count: members.length,
                label: t('about.stats.anggotaLabel'),
                desc: t('about.stats.anggotaDesc'),
              },
              {
                icon: faTree,
                count: 5,
                label: t('about.stats.divisiLabel'),
                desc: t('about.stats.divisiDesc'),
              },
              {
                icon: faCalendar,
                count: 22,
                label: t('about.stats.tahunLabel'),
                desc: t('about.stats.tahunDesc'),
              },
            ].map((stat, i) => (
              <Grid item xs={12} md={4} key={i}>
                <motion.div
                  initial="hidden"
                  animate={inView ? "visible" : "hidden"}
                  variants={fadeInUp}
                  transition={{ delay: i * 0.1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 6,
                      bgcolor:
                        mode === "dark"
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(0,0,0,0.01)",
                      border: "1px solid rgba(0,0,0,0.03)",
                      textAlign: "center",
                      transition: "all 0.4s ease",
                      "&:hover": {
                        transform: "translateY(-10px)",
                        boxShadow: `0 20px 40px ${primaryOrange}15`,
                        borderColor: `${primaryOrange}30`,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        mx: "auto",
                        mb: 3,
                        borderRadius: 3,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: `${primaryOrange}10`,
                        color: primaryOrange,
                      }}
                    >
                      <FontAwesomeIcon icon={stat.icon} size="xl" />
                    </Box>
                    <Typography
                      variant="h2"
                      fontWeight="900"
                      sx={{ color: "var(--text-primary)", mb: 0.5 }}
                    >
                      {inView ? (
                        <CountUp end={stat.count} duration={3} suffix="+" />
                      ) : (
                        "0+"
                      )}
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="800"
                      sx={{
                        color: primaryOrange,
                        mb: 1,
                        fontSize: "0.9rem",
                        letterSpacing: 1,
                      }}
                    >
                      {stat.label.toUpperCase()}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--text-secondary)", opacity: 0.7 }}
                    >
                      {stat.desc}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ================= SEJARAH (MODERN TIMELINE) ================= */}
      <Box
        sx={{
          py: 15,
          bgcolor: "var(--background-default)",
          position: "relative",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 12 }}>
            <Typography
              variant="overline"
              sx={{ color: primaryOrange, fontWeight: 900, letterSpacing: 5 }}
            >
              {t('about.retrospeksi')}
            </Typography>
            <Typography
              variant="h2"
              fontWeight="900"
              sx={{ color: "var(--text-primary)", letterSpacing: "-1.5px" }}
            >
              {t('about.historyTitle')}
            </Typography>
            <Box
              sx={{
                width: 60,
                height: 4,
                bgcolor: primaryOrange,
                mx: "auto",
                mt: 2,
                borderRadius: 2,
              }}
            />
          </Box>

          <Box sx={{ position: "relative" }}>
            {/* Center Line - Theme Aware Visibility */}
            <Box
              sx={{
                position: "absolute",
                left: { xs: "30px", md: "50%" },
                top: 0,
                bottom: 0,
                width: "4px",
                bgcolor:
                  mode === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.06)",
                transform: { md: "translateX(-50%)" },
                borderRadius: 2,
              }}
            />

            {[
              {
                year: "1998",
                title: t('about.year1998Title'),
                icon: faMapMarkedAlt,
                desc: t('about.year1998Desc'),
              },
              {
                year: "2002",
                title: t('about.year2002Title'),
                icon: faAward,
                desc: "Transformasi resmi menjadi UKM PERIMATRIK pada 3 Oktober 2002. Membawa semangat baru sebagai organisasi pecinta alam yang profesional.",
              },
              {
                year: "Evolusi",
                title: "Harmoni Kampus",
                icon: faCompass,
                desc: "Mengikuti perjalanan transformasi institusi dari STMB, Institut Manajemen Telkom, hingga terbentuknya Universitas Telkom, PERIMATRIK terus hadir dan beradaptasi, tetap berdiri kokoh dalam setiap fase perubahan.",
              },
              {
                year: "2014",
                title: "Keluarga KMPA",
                icon: faUsers,
                desc: "Bersinergi dalam Keluarga Mahasiswa Pecinta Alam (KMPA) Telkom University sebagai wadah konsolidasi aksi lingkungan tingkat universitas.",
              },
            ].map((step, idx) => (
              <Box
                key={idx}
                sx={{
                  display: "flex",
                  justifyContent: {
                    xs: "flex-start",
                    md: idx % 2 === 0 ? "flex-start" : "flex-end",
                  },
                  width: "100%",
                  mb: { xs: 6, md: 10 },
                  position: "relative",
                }}
              >
                {/* Timeline Dot - Enhanced Visibility for Dark Mode */}
                <Box
                  sx={{
                    position: "absolute",
                    left: { xs: "30px", md: "50%" },
                    top: "40px",
                    transform: "translateX(-50%)",
                    width: { xs: 20, md: 24 },
                    height: { xs: 20, md: 24 },
                    borderRadius: "50%",
                    bgcolor: mode === "dark" ? "#1a1a1a" : "white", // Contrast bgcolor
                    border: `5px solid ${primaryOrange}`,
                    zIndex: 20,
                    boxShadow:
                      mode === "dark"
                        ? `0 0 20px ${primaryOrange}cc`
                        : `0 0 15px ${primaryOrange}80`,
                    display: "block",
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -60 : 60 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7 }}
                  style={
                    {
                      width: "100%",
                      maxWidth: "440px",
                      marginLeft: idx % 2 === 0 ? 0 : "auto",
                    }
                  }
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 5,
                      borderRadius: 8,
                      bgcolor: "var(--background-paper)",
                      boxShadow: "0 30px 60px rgba(0,0,0,0.04)",
                      position: "relative",
                      overflow: "hidden",
                      "&:hover": { transform: "scale(1.02)" },
                      transition: "transform 0.4s ease",
                    }}
                  >
                    <Typography
                      variant="h1"
                      sx={{
                        position: "absolute",
                        right: -10,
                        top: -10,
                        fontSize: "6rem",
                        fontWeight: 900,
                        color: `${primaryOrange}08`,
                        zIndex: 0,
                        userSelect: "none",
                      }}
                    >
                      {step.year.slice(0, 4)}
                    </Typography>

                    <Box sx={{ position: "relative", zIndex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: `${primaryOrange}10`,
                            color: primaryOrange,
                            display: "flex",
                          }}
                        >
                          <FontAwesomeIcon icon={step.icon} />
                        </Box>
                        <Typography
                          variant="h6"
                          fontWeight="900"
                          sx={{ color: primaryOrange }}
                        >
                          {step.year}
                        </Typography>
                      </Box>
                      <Typography
                        variant="h5"
                        fontWeight="900"
                        sx={{ mb: 2, color: "var(--text-primary)" }}
                      >
                        {step.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "var(--text-secondary)",
                          lineHeight: 1.8,
                          textAlign: "justify",
                        }}
                      >
                        {step.desc}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ================= LAMBANG (PREMIUM PHILOSOPHY) ================= */}
      <Box
        sx={{
          py: 15,
          bgcolor: "var(--background-paper)",
          borderTop: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-15"
          >
            <Typography
              variant="overline"
              sx={{ color: primaryOrange, fontWeight: 900, letterSpacing: 5 }}
            >
              {t('about.philosophyTitle')}
            </Typography>
            <Typography
              variant="h2"
              fontWeight="900"
              sx={{ color: "var(--text-primary)", letterSpacing: "-1.5px" }}
            >
              {t('about.philosophyHeading')}
            </Typography>
            <Box
              sx={{
                width: 60,
                height: 4,
                bgcolor: primaryOrange,
                mx: "auto",
                mt: 2,
                borderRadius: 2,
              }}
            />
          </motion.div>

          <Grid container spacing={10} alignItems="center">
            <Grid item xs={12} lg={5}>
              <motion.div
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ textAlign: "center", position: "relative" }}
              >
                <img
                  src="/images/lambang.webp"
                  alt="Lambang PERIMATRIK"
                  style={{
                    maxWidth: "100%",
                    width: "450px",
                    filter: "drop-shadow(0 40px 60px rgba(230, 120, 23, 0.3))",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "120%",
                    height: "120%",
                    border: "1px dashed rgba(230, 120, 23, 0.1)",
                    borderRadius: "50%",
                    zIndex: -1,
                  }}
                />
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={7}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                {[
                  {
                    num: "01",
                    text: "Warna orange melambangkan jiwa kemanusiaan.",
                  },
                  {
                    num: "02",
                    text: "Hijau merupakan penghargaan kelestarian alam.",
                  },
                  {
                    num: "03",
                    text: "Merah merupakan keberanian dalam bertindak.",
                  },
                  {
                    num: "04",
                    text: "Putih berarti kebersihan hati dan ikhlas.",
                  },
                  { num: "05", text: "Biru gunung melambangkan ketenangan." },
                  { num: "06", text: "Coklat melambangkan bumi yang dijaga." },
                  { num: "07", text: "Bingkai hitam melambangkan kejelasan." },
                  {
                    num: "08",
                    text: "{t('about.meaningCompassDesc')}",
                  },
                  { num: "09", text: "Lingkaran bersifat utuh mata rantai." },
                  {
                    num: "10",
                    text: "3 Sinar matahari: Tri Darma Perguruan Tinggi.",
                  },
                  { num: "11", text: "Biru air sebagai unsur kehidupan." },
                  {
                    num: "12",
                    text: "Tipografi Cambria: Ketegasan & Disiplin.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        bgcolor:
                          mode === "dark"
                            ? "rgba(255,255,255,0.03)"
                            : "rgba(0,0,0,0.02)",
                        display: "flex",
                        gap: 2,
                        alignItems: "center",
                        border: "1px solid transparent",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          bgcolor: "white",
                          boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                          borderColor: `${primaryOrange}30`,
                          transform: "translateX(8px)",
                        },
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: primaryOrange,
                          fontWeight: 900,
                          fontSize: "0.9rem",
                          opacity: 0.6,
                        }}
                      >
                        {item.num}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="700"
                        sx={{
                          color: "var(--text-secondary)",
                          fontSize: "0.85rem",
                        }}
                      >
                        {item.text}
                      </Typography>
                    </Paper>
                  </motion.div>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================= RESOSIL & TUJUAN SECTION ================= */}
      <Box sx={{ py: 15, bgcolor: "var(--background-default)" }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Paper
                  sx={{
                    p: 6,
                    borderRadius: 10,
                    height: "100%",
                    bgcolor: "var(--background-paper)",
                    boxShadow: "0 40px 80px rgba(0,0,0,0.03)",
                    border: "1px solid rgba(0,0,0,0.02)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <FontAwesomeIcon
                    icon={faQuoteLeft}
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 30,
                      fontSize: "4rem",
                      color: primaryOrange,
                      opacity: 0.05,
                    }}
                  />
                  <Typography
                    variant="overline"
                    sx={{
                      color: primaryOrange,
                      fontWeight: 900,
                      letterSpacing: 3,
                    }}
                  >
                    {t('about.landasanGerak')}
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight="900"
                    sx={{ color: "var(--text-primary)", mt: 1, mb: 4 }}
                  >
                    Konsep <span style={{ color: primaryOrange }}>RESOSIL</span>
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "var(--text-secondary)",
                      lineHeight: 2,
                      fontSize: "1.1rem",
                      textAlign: "justify",
                    }}
                  >
                    PERIMATRIK mengembangkan ekosistem kegiatan yang menyatu dan
                    memberi ruang untuk bernapas dari rutinitas, hadir bagi
                    lingkungan sekitar, melatih diri untuk tangguh dan disiplin,
                    serta menguji gagasan dengan pendekatan yang terukur.
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    {[t('about.resosolTags.rekreasi'), t('about.resosolTags.sosial'), t('about.resosolTags.olahraga'), t('about.resosolTags.ilmiah')].map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        variant="outlined"
                        sx={{
                          fontWeight: 900,
                          borderRadius: 2,
                          fontSize: "0.65rem",
                          borderColor: `${primaryOrange}40`,
                          color: primaryOrange,
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>

            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <Paper
                  sx={{
                    p: 6,
                    borderRadius: 10,
                    height: "100%",
                    background: `linear-gradient(135deg, ${primaryOrange} 0%, #d35400 100%)`,
                    color: "white",
                    boxShadow: `0 40px 80px ${primaryOrange}40`,
                  }}
                >
                  <Typography variant="h3" fontWeight="900" sx={{ mb: 5 }}>
                    {t('about.tujuanStrategis')}
                  </Typography>
                  <Stack spacing={3}>
                    {[
                      t('about.tujuanItems.0'),
                      t('about.tujuanItems.1'),
                      t('about.tujuanItems.2'),
                      t('about.tujuanItems.3'),
                      t('about.tujuanItems.4'),
                    ].map((text, i) => (
                      <Box
                        key={i}
                        sx={{ display: "flex", alignItems: "center", gap: 3 }}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "12px",
                            bgcolor: "rgba(255,255,255,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {i + 1}
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 700, fontSize: "1.05rem" }}
                        >
                          {text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ================= FORCE SECTION (WHO WE ARE) ================= */}
      <Box sx={{ py: 15, bgcolor: "var(--background-paper)" }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 10 }}>
            <Typography
              variant="overline"
              sx={{ color: primaryOrange, fontWeight: 900, letterSpacing: 5 }}
            >
              {t('about.keluargaBesar')}
            </Typography>
            <Typography
              variant="h2"
              fontWeight="900"
              sx={{ color: "var(--text-primary)", letterSpacing: "-1.5px" }}
            >
              {t('about.daftarAngkatan')}
            </Typography>
            <Box
              sx={{
                width: 60,
                height: 4,
                bgcolor: primaryOrange,
                mx: "auto",
                mt: 2,
                borderRadius: 2,
              }}
            />
          </Box>

          <Grid container spacing={4}>
            <AnimatePresence>
              {sejarahData
                .slice(0, showAll ? sejarahData.length : 6)
                .map((item, index) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          borderRadius: 6,
                          bgcolor: "var(--background-default)",
                          border: "1px solid rgba(0,0,0,0.05)",
                          textAlign: "center",
                          position: "relative",
                          overflow: "hidden",
                          transition:
                            "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                          "&:hover": {
                            transform: "translateY(-12px)",
                            boxShadow: `0 30px 60px ${primaryOrange}20`,
                            borderColor: primaryOrange,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: "absolute",
                            top: -10,
                            left: -10,
                            fontSize: "4rem",
                            fontWeight: 900,
                            color: "rgba(0,0,0,0.03)",
                            zIndex: 0,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography
                          variant="h4"
                          fontWeight="900"
                          sx={{
                            color: primaryOrange,
                            mb: 1,
                            position: "relative",
                          }}
                        >
                          {item.year}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="800"
                          sx={{
                            mb: 3,
                            color: "var(--text-primary)",
                            letterSpacing: "-0.5px",
                          }}
                        >
                          {item.forceName}
                        </Typography>
                        <Button
                          variant="contained"
                          onClick={() => handleShowModal(item)}
                          fullWidth
                          sx={{
                            borderRadius: "16px",
                            bgcolor:
                              mode === "dark"
                                ? "rgba(255,255,255,0.1)"
                                : "white",
                            color: "var(--text-primary)",
                            fontWeight: "900",
                            textTransform: "none",
                            py: 1.5,
                            boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                            "&:hover": {
                              bgcolor: primaryOrange,
                              color: "white",
                            },
                          }}
                        >
                          Detail Anggota
                        </Button>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
            </AnimatePresence>
          </Grid>

          {sejarahData.length > 6 && (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <Button
                variant="outlined"
                onClick={() => setShowAll(!showAll)}
                sx={{
                  borderRadius: 50,
                  px: 6,
                  py: 2,
                  fontWeight: "900",
                  color: primaryOrange,
                  borderColor: primaryOrange,
                  "&:hover": {
                    bgcolor: `${primaryOrange}10`,
                    borderColor: primaryOrange,
                  },
                }}
              >
                {showAll ? "TAMPILKAN SEDIKIT" : "LIHAT SELURUH ANGKATAN"}
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      <DirectionPartial />

      {selectedForce && (
        <ModalComponent
          show={showModal}
          onHide={handleCloseModal}
          members={groupedMembers[selectedForce.forceName]}
          angkatan={selectedForce.forceName}
        />
      )}
    </div>
  );
};

export default AboutPage;

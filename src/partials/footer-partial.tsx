import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import { getDashboardLoginUrl } from "../utils/domain";
import { useTranslation } from "react-i18next";

export const FooterPartial = () => {
  const { t } = useTranslation();
  const getDashboardUrl = () => {
    if (window.location.hostname.startsWith("dashboard.")) {
      return "/login";
    }

    return getDashboardLoginUrl(window.location);
  };

  return (
    <footer
      style={{
        backgroundColor: "#121212",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        color: "#e0e0e0",
      }}
    >
      <div className="container py-5">
        <div className="row flex-column align-items-center justify-content-center text-center gap-4">
          {/* Logo / Brand Name */}
          <div className="col-12">
            <h4
              style={{
                fontWeight: 800,
                letterSpacing: "2px",
                margin: 0,
                color: "#ffffff",
              }}
            >
              PERIMATRIK
            </h4>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginTop: "12px",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "#9e9e9e",
                  margin: 0,
                  maxWidth: "500px",
                }}
              >{t('footer.tagline')}</p>
            </div>
          </div>

          {/* Member Area Link */}
          <div className="col-12">
            <a
              href={getDashboardUrl()}
              style={{
                display: "inline-block",
                textDecoration: "none",
                color: "#e67817",
                fontWeight: 700,
                fontSize: "0.85rem",
                letterSpacing: "1.5px",
                padding: "8px 24px",
                border: "1px solid rgba(230, 120, 23, 0.3)",
                borderRadius: "50px",
                transition: "all 0.3s ease",
                textTransform: "uppercase",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(230, 120, 23, 0.1)";
                e.currentTarget.style.borderColor = "#e67817";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(230, 120, 23, 0.3)";
              }}
            >{t('footer.memberArea')}</a>
          </div>

          {/* Copyright & Developer Section */}
          <div className="col-12 mt-2">
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#757575" }}>
              &copy; {new Date().getFullYear()} PERIMATRIK. {t('footer.rights')}
            </p>

            <div className="mt-3 d-flex flex-column align-items-center gap-2">
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#9e9e9e" }}>
                {t('footer.developedBy')}{" "}
                <a
                  href="https://mhmadidris.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#e0e0e0",
                    textDecoration: "none",
                    fontWeight: 600,
                    transition: "color 0.3s ease",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#e67817")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#e0e0e0")}
                >
                  Muhammad Idris
                </a>
              </p>

              {/* Developer Social Medias */}
              <div className="d-flex align-items-center gap-4 mt-1">
                <a
                  href="https://www.linkedin.com/in/mhmadidris/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#757575", transition: "all 0.3s ease" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#0077b5")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#757575")}
                >
                  <FontAwesomeIcon
                    icon={faLinkedinIn}
                    style={{ fontSize: "1.2rem" }}
                  />
                </a>
                <a
                  href="https://www.instagram.com/mhmadidris/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#757575", transition: "all 0.3s ease" }}
                  onMouseOver={(e) => (e.currentTarget.style.color = "#e4405f")}
                  onMouseOut={(e) => (e.currentTarget.style.color = "#757575")}
                >
                  <FontAwesomeIcon
                    icon={faInstagram}
                    style={{ fontSize: "1.2rem" }}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

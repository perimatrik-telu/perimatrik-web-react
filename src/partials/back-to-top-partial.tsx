"use client";

import { faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material";

export const BackToTopPartial = () => {
  const theme = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isClient) return null;

  return (
    <div
      className="position-fixed"
      style={{ zIndex: "2", bottom: "25px", right: "25px" }}
    >
      {scrolled && (
        <button
          onClick={scrollToTop}
          className="rounded-circle border-0 shadow-lg"
          style={{
            width: "50px",
            height: "50px",
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
          }}
        >
          <FontAwesomeIcon icon={faArrowUp} size="lg" />
        </button>
      )}
    </div>
  );
};



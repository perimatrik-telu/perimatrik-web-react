"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMailBulk,
  faPhone,
  faMapLocationDot,
} from "@fortawesome/free-solid-svg-icons";

const DirectionPartial = () => {
  return (
    <>
      {/* Direction Section */}
      <div
        style={{
          minHeight: "50vh",
          backgroundImage: "url('/images/bg-direction.webp')",
          backgroundAttachment: "fixed",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
        className="d-flex align-items-center p-4"
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1,
          }}
        ></div>

        <div
          className="container d-flex flex-column-reverse flex-lg-row align-items-center justify-content-evenly gap-4"
          style={{
            position: "relative",
            zIndex: 2,
            color: "#fff",
          }}
        >
          {/* Map Section */}
          <iframe
            className="rounded-4 shadow-lg w-100 w-lg-50"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.2784194078936!2d107.62982807459998!3d-6.976440668313663!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e9bce8ff7d7f%3A0x66f5d40eb242c99a!2sSekretariat%20Perimatrik%20Telkom%20University!5e0!3m2!1sid!2sid!4v1743326142048!5m2!1sid!2sid"
            height="250"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>

          {/* Contact Info Section */}
          <div className="w-100 w-lg-50 text-center text-lg-start">
            <h2
              className="fw-bold"
              style={{ fontSize: "1.5rem", marginBottom: "1rem" }}
            >
              Hubungi Kami
            </h2>
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={faMailBulk} /> Email:
              penempuhrimba.telu@gmail.com
            </p>
            <p style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
              <FontAwesomeIcon icon={faPhone} /> Telepon: +123 456 7890
            </p>
            <p style={{ fontSize: "1rem" }}>
              <FontAwesomeIcon icon={faMapLocationDot} /> Alamat: Jl. Sukabirus
              No.73, Sukapura, Kec. Dayeuhkolot, Kota Bandung, Jawa Barat 40257
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DirectionPartial;

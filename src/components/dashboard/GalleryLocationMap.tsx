import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Box, CircularProgress, Typography, useTheme } from "@mui/material";
import Map, { Marker, useControl, NavigationControl, GeolocateControl } from "react-map-gl/mapbox";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;

const GeocoderControl = ({ onSelect }: { onSelect: (latitude: number, longitude: number) => void }) => {
  const { i18n, t } = useTranslation();
  useControl(() => {
    const control = new MapboxGeocoder({
      accessToken: mapboxToken,
      marker: false,
      collapsed: false,
      placeholder: t("galleryForm.searchLocation"),
      language: i18n.language,
    });
    const onAdd = control.onAdd.bind(control);
    control.onAdd = (map) => {
      const container = onAdd(map);
      // Geocoder buttons must not submit the surrounding gallery form.
      container.querySelectorAll<HTMLButtonElement>("button").forEach((button) => { button.type = "button"; });
      container.querySelector("input")?.setAttribute("aria-label", t("galleryForm.searchLocation"));
      return container;
    };
    control.on("result", (event) => {
      const [longitude, latitude] = event.result.center;
      onSelect(latitude, longitude);
    });
    return control;
  }, { position: "top-left" });
  return null;
};

type GalleryLocationMapProps = {
  position: [number, number] | null;
  onSelect: (latitude: number, longitude: number) => void;
};

export default function GalleryLocationMap({ position, onSelect }: GalleryLocationMapProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(!mapboxToken);

  return (
    <Box>
      {failed && <Alert severity="warning" sx={{ mb: 2 }}>{t("galleryForm.mapUnavailable")}</Alert>}
      {!failed && (
        <Box sx={{ height: { xs: 300, sm: 360 }, position: "relative", borderRadius: "8px", border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          {!loaded && <Box role="status" sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, bgcolor: "background.paper", zIndex: 1 }}>
            <CircularProgress size={20} /><Typography sx={{ fontSize: 14, color: "text.secondary" }}>{t("galleryForm.mapLoading")}</Typography>
          </Box>}
          <Map
            initialViewState={{ longitude: position?.[1] ?? 106.8456, latitude: position?.[0] ?? -6.2088, zoom: position ? 13 : 11 }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            mapboxAccessToken={mapboxToken}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            onClick={(event) => onSelect(event.lngLat.lat, event.lngLat.lng)}
          >
            <GeocoderControl onSelect={onSelect} />
            <NavigationControl position="bottom-right" />
            <GeolocateControl position="bottom-right" />
            {position && <Marker latitude={position[0]} longitude={position[1]} color={theme.palette.primary.main} />}
          </Map>
        </Box>
      )}
    </Box>
  );
}

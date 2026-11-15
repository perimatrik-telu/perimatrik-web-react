import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

export const PwaPrompt = () => {
  const { t } = useTranslation();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
      localStorage.removeItem(DISMISS_KEY);
      setDismissed(false);
    };

    setIsInstalled(window.matchMedia("(display-mode: standalone)").matches);

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installEvent) {
      return;
    }

    await installEvent.prompt();
    const choiceResult = await installEvent.userChoice;

    if (choiceResult.outcome !== "accepted") {
      setDismissed(true);
      localStorage.setItem(DISMISS_KEY, "true");
    }

    setInstallEvent(null);
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  if (dismissed || isInstalled || !installEvent) {
    return null;
  }

  return (
    <Box className="pwa-install-prompt">
      <IconButton
        aria-label="Tutup prompt install"
        className="pwa-install-close"
        onClick={handleDismiss}
        size="small"
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      <Typography variant="subtitle1" fontWeight={800}>{t('pwa.installTitle')}</Typography>
      <Typography variant="body2" sx={{ mt: 0.5 }}>{t('pwa.installDesc')}</Typography>
      <Button variant="contained" onClick={handleInstall} sx={{ mt: 2, alignSelf: "flex-start" }}>{t('pwa.installBtn')}</Button>
    </Box>
  );
};

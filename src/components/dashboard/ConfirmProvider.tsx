import { useCallback, useRef, useState, type ReactNode } from "react";
import { alpha, Box, Button, Dialog, DialogActions, DialogContent, Stack, Typography } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { ConfirmContext, type ConfirmOptions } from "./confirm-context";

/** Renders a styled confirmation dialog for `useConfirm()`; replaces `window.confirm` in the dashboard. */
export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    // Resolve any dialog still pending (e.g. double click) as cancelled.
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        open={Boolean(options)}
        onClose={() => close(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="confirm-dialog-title"
        aria-describedby={options?.description ? "confirm-dialog-description" : undefined}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 20px 24px -4px rgba(16, 24, 40, 0.08), 0 8px 8px -4px rgba(16, 24, 40, 0.03)",
            },
          },
        }}
      >
        <DialogContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
            <Box
              sx={{
                width: 40, height: 40, flexShrink: 0, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 16,
                color: destructive ? "error.main" : "warning.main",
                bgcolor: (theme) => alpha(destructive ? theme.palette.error.main : theme.palette.warning.main, 0.1),
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography id="confirm-dialog-title" component="h2" sx={{ fontSize: 18, fontWeight: 600, lineHeight: 1.4 }}>
                {options?.title}
              </Typography>
              {options?.description && (
                <Typography id="confirm-dialog-description" sx={{ mt: 0.75, fontSize: 14, color: "text.secondary" }}>
                  {options.description}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={() => close(false)} sx={{ borderColor: "divider" }}>
            {options?.cancelLabel ?? "Batal"}
          </Button>
          <Button variant="contained" color={destructive ? "error" : "primary"} onClick={() => close(true)} autoFocus>
            {options?.confirmLabel ?? "Hapus"}
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
};

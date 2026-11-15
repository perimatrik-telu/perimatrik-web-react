/** Shared surface style for dashboard cards: white, hairline border, very soft shadow, 12px radius (dashboard theme radius unit is 4). */
export const dashboardCardSx = {
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
} as const;


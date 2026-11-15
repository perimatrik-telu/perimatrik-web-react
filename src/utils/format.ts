/** Short Indonesian date, e.g. "20 Sep 2026"; em dash when empty. */
export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

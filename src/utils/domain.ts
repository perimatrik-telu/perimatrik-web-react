export const getCanonicalRootHost = (hostname: string) => {
  if (hostname.includes("localhost") || hostname === "127.0.0.1") {
    return hostname;
  }

  return hostname
    .replace(/^dashboard\./, "")
    .replace(/^news\./, "")
    .replace(/^www\./, "");
};

export const getDashboardLoginUrl = (location: Location) => {
  const hostname = location.hostname;

  if (hostname.includes("localhost") || hostname === "127.0.0.1") {
    return "/dashboard";
  }

  const rootHost = getCanonicalRootHost(hostname);
  return `${location.protocol}//dashboard.${rootHost}/login`;
};

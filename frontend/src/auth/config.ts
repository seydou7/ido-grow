const LOCAL_API_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function getLocalApiBaseUrl(configuredValue: string | undefined): string {
  if (
    configuredValue === "" ||
    (process.env.NODE_ENV === "production" &&
      (configuredValue === undefined ||
        configuredValue.includes("localhost") ||
        configuredValue.includes("127.0.0.1")))
  ) {
    return "";
  }

  if (!configuredValue) {
    throw new Error("Local API configuration is unavailable.");
  }

  let url: URL;

  try {
    url = new URL(configuredValue);
  } catch {
    throw new Error("Local API configuration is invalid.");
  }

  const isExactLocalBackend =
    url.protocol === "http:" &&
    LOCAL_API_HOSTS.has(url.hostname) &&
    url.port === "3001" &&
    url.pathname === "/" &&
    url.search === "" &&
    url.hash === "" &&
    url.username === "" &&
    url.password === "";

  if (!isExactLocalBackend) {
    throw new Error("Local API configuration is invalid.");
  }

  return url.origin;
}

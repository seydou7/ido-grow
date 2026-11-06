import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";
const configuredApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

if (isProduction && configuredApiUrl) {
  const isDevUrl =
    configuredApiUrl.includes("localhost") ||
    configuredApiUrl.includes("127.0.0.1") ||
    configuredApiUrl.startsWith("http://");

  if (isDevUrl) {
    throw new Error(
      `[CONFIG GUARD] Production build failed: NEXT_PUBLIC_API_BASE_URL must not point to a local/insecure development URL ("${configuredApiUrl}"). Production requires same-origin API routing (empty string).`,
    );
  }
}

const nextConfig: NextConfig = {
  env: {
    ...(isProduction ? { NEXT_PUBLIC_API_BASE_URL: configuredApiUrl ?? "" } : {}),
  },
};

export default nextConfig;

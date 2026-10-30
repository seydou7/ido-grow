import * as QRCode from "qrcode";

export interface DppQrResult {
  dppId: string;
  passportNumber: string;
  targetUrl: string;
  route: string;
  qrSvg: string;
  qrDataUrl: string;
  requiresAuth: boolean;
  generatedAt: string;
}

export async function generateDppQrCode(
  dppId: string,
  passportNumber: string,
  baseUrl = "https://217-182-252-225.sslip.io",
): Promise<DppQrResult> {
  const route = `/dpp/${dppId}/passport`;
  const cleanBase = baseUrl ? baseUrl.replace(/\/+$/, "") : "";
  const targetUrl = `${cleanBase}${route}`;

  // Generate clean SVG string for UI embedding
  const qrSvg = await QRCode.toString(targetUrl, {
    type: "svg",
    margin: 2,
    width: 256,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  // Generate Data URL (PNG) for image embedding
  const qrDataUrl = await QRCode.toDataURL(targetUrl, {
    margin: 2,
    width: 256,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  return {
    dppId,
    passportNumber,
    targetUrl,
    route,
    qrSvg,
    qrDataUrl,
    requiresAuth: true,
    generatedAt: new Date().toISOString(),
  };
}

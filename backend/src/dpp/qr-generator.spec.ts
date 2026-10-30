import { generateDppQrCode } from "./qr-generator";

describe("QrGenerator", () => {
  it("should generate QR code pointing to canonical protected route", async () => {
    const result = await generateDppQrCode("dpp-uuid-1234", "DPP-20261002-ABCD9999");

    expect(result.dppId).toBe("dpp-uuid-1234");
    expect(result.passportNumber).toBe("DPP-20261002-ABCD9999");
    expect(result.route).toBe("/dpp/dpp-uuid-1234/passport");
    expect(result.targetUrl).toContain("/dpp/dpp-uuid-1234/passport");
    expect(result.requiresAuth).toBe(true);

    // SVG string validation
    expect(result.qrSvg).toContain("<svg");
    expect(result.qrSvg).toContain("</svg>");

    // PNG Data URL validation
    expect(result.qrDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });

  it("should not embed user IDs, tokens, secrets, or internal margins in QR target URL", async () => {
    const result = await generateDppQrCode("dpp-uuid-1234", "DPP-20261002-ABCD9999");

    expect(result.targetUrl).not.toContain("token=");
    expect(result.targetUrl).not.toContain("secret=");
    expect(result.targetUrl).not.toContain("userId=");
    expect(result.targetUrl).not.toContain("margin=");
    expect(result.targetUrl).not.toContain("bank=");
  });

  it("should support custom baseUrl without double slashes", async () => {
    const result = await generateDppQrCode(
      "dpp-uuid-5678",
      "DPP-20261002-EFGH5678",
      "https://idogrow.test/",
    );

    expect(result.targetUrl).toBe("https://idogrow.test/dpp/dpp-uuid-5678/passport");
  });
});

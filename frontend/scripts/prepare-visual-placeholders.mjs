import sharp from "sharp";
import fs from "fs";
import path from "path";

const baseDir = path.resolve("./public");

// Ensure directories
[
  "images/trader",
  "images/quality",
  "images/logistics",
  "images/operations",
  "images/actors",
  "images/products"
].forEach(dir => fs.mkdirSync(path.join(baseDir, dir), { recursive: true }));

async function generateAssets() {
  console.log("Preparing high-quality visual assets and placeholders...");

  // 1. Product: Baled agricultural commodities in warehouse / yard (crop from hero-video-poster)
  await sharp(path.join(baseDir, "media/hero-video-poster.jpg"))
    .extract({ left: 240, top: 440, width: 560, height: 320 })
    .resize(800, 500, { fit: "cover" })
    .jpeg({ quality: 92 })
    .toFile(path.join(baseDir, "images/products/commodity-bales.jpg"));
  console.log("Created: images/products/commodity-bales.jpg");

  // 2. Product: Agricultural commodity sacks & pallets (crop from actor-buyer)
  await sharp(path.join(baseDir, "images/actors/actor-buyer.jpg"))
    .extract({ left: 0, top: 500, width: 520, height: 390 })
    .resize(800, 500, { fit: "cover" })
    .jpeg({ quality: 92 })
    .toFile(path.join(baseDir, "images/products/commodity-sacks.jpg"));
  console.log("Created: images/products/commodity-sacks.jpg");

  // 3. Category C & Logistics: Freight & Cooperative Loading Bay (crop from hero-video-poster)
  await sharp(path.join(baseDir, "media/hero-video-poster.jpg"))
    .extract({ left: 700, top: 400, width: 650, height: 360 })
    .resize(800, 500, { fit: "cover" })
    .jpeg({ quality: 92 })
    .toFile(path.join(baseDir, "images/logistics/freight-transport.jpg"));
  
  // Also copy to actors/actor-logistics.jpg and operations/logistics-freight-transit.jpg
  fs.copyFileSync(
    path.join(baseDir, "images/logistics/freight-transport.jpg"),
    path.join(baseDir, "images/actors/actor-logistics.jpg")
  );
  fs.copyFileSync(
    path.join(baseDir, "images/logistics/freight-transport.jpg"),
    path.join(baseDir, "images/operations/logistics-freight-transit.jpg")
  );
  console.log("Created: images/logistics/freight-transport.jpg & actor-logistics");

  // 4. Category E: Quality & Trust (Human inspection of agricultural lot - crop from actor-producer)
  await sharp(path.join(baseDir, "images/actors/actor-producer.jpg"))
    .extract({ left: 160, top: 120, width: 880, height: 600 })
    .resize(800, 550, { fit: "cover" })
    .jpeg({ quality: 92 })
    .toFile(path.join(baseDir, "images/quality/quality-field-inspection.jpg"));
  console.log("Created: images/quality/quality-field-inspection.jpg");

  function escapeXml(str) {
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // 5. Category A & D: Trader / Central Trading Desk & Digital Operations (Warm, editorial, non-dark visual plates)
  async function createWarmEditorialPlate({ width, height, category, title, description, tags, outputPath }) {
    const safeCategory = escapeXml(category.toUpperCase());
    const safeTitle = escapeXml(title);
    const safeDesc = escapeXml(description);

    const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1b473a"/>
          <stop offset="50%" stop-color="#14392e"/>
          <stop offset="100%" stop-color="#0f2b23"/>
        </linearGradient>
        <linearGradient id="softGlow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(52, 211, 153, 0.15)"/>
          <stop offset="100%" stop-color="transparent"/>
        </linearGradient>
        <pattern id="dotGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.5" fill="rgba(255,255,255,0.06)"/>
        </pattern>
      </defs>

      <!-- Background -->
      <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
      <rect width="${width}" height="${height}" fill="url(#dotGrid)"/>
      <rect width="${width}" height="${height}" fill="url(#softGlow)"/>

      <!-- Ambient Architectural Line -->
      <line x1="32" y1="${height - 90}" x2="${width - 32}" y2="${height - 90}" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>

      <!-- Category Pill -->
      <g transform="translate(32, 32)">
        <rect width="210" height="26" rx="6" fill="#256852" stroke="rgba(74, 222, 128, 0.4)" stroke-width="1"/>
        <text x="14" y="17" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="700" fill="#d1fae5" letter-spacing="1.2">
          ${safeCategory}
        </text>
      </g>

      <!-- Central Iconography / Graphic Outline -->
      <g transform="translate(${width / 2 - 40}, ${height * 0.3}) scale(1.2)" opacity="0.65">
        <rect x="0" y="0" width="70" height="48" rx="4" fill="none" stroke="#6ee7b7" stroke-width="2.5"/>
        <line x1="12" y1="16" x2="40" y2="16" stroke="#a7f3d0" stroke-width="2"/>
        <line x1="12" y1="26" x2="58" y2="26" stroke="#a7f3d0" stroke-width="2"/>
        <polyline points="15,38 28,30 42,34 56,22" fill="none" stroke="#34d399" stroke-width="2.5"/>
      </g>

      <!-- Bottom Content -->
      <g transform="translate(32, ${height - 70})">
        <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="19" font-weight="800" fill="#ffffff" letter-spacing="-0.3">
          ${safeTitle}
        </text>
        <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#b9ded1">
          ${safeDesc}
        </text>
      </g>

      <!-- Tags on Right -->
      <g transform="translate(${width - 240}, 32)">
        ${tags.map((t, idx) => `
          <g transform="translate(0, ${idx * 28})">
            <rect width="200" height="22" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
            <text x="10" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#e2e8f0">
              • ${escapeXml(t)}
            </text>
          </g>
        `).join("")}
      </g>
    </svg>
    `;

    await sharp(Buffer.from(svg))
      .jpeg({ quality: 92 })
      .toFile(outputPath);
    console.log("Created:", outputPath);
  }

  // Category A: Trader / Central Trading Desk
  await createWarmEditorialPlate({
    width: 800,
    height: 520,
    category: "Central Trading Desk",
    title: "European Commodity Sourcing & Matching",
    description: "Trader workstation coordinating bilateral supply and demand execution",
    tags: ["Rotterdam & Paris Desks", "Bilateral Quote Matching", "Escrow & Settlement"],
    outputPath: path.join(baseDir, "images/trader/trader-workstation.jpg")
  });
  fs.copyFileSync(
    path.join(baseDir, "images/trader/trader-workstation.jpg"),
    path.join(baseDir, "images/actors/actor-trader.jpg")
  );

  // Category B: Quality Inspector / Laboratory
  await createWarmEditorialPlate({
    width: 800,
    height: 520,
    category: "Accredited Laboratory",
    title: "Standardized Technical Quality Inspection",
    description: "Independent scientific evaluation of moisture, fineness & purity",
    tags: ["ISO 17025 Accredited", "Moisture & Cleanliness", "Lot Proof Sealing"],
    outputPath: path.join(baseDir, "images/quality/lab-inspection.jpg")
  });
  fs.copyFileSync(
    path.join(baseDir, "images/quality/lab-inspection.jpg"),
    path.join(baseDir, "images/actors/actor-inspector.jpg")
  );

  // Category D: Digital Operations Platform
  await createWarmEditorialPlate({
    width: 1000,
    height: 600,
    category: "Digital Platform Cockpit",
    title: "Data Intelligence & Physical Supply Execution",
    description: "Real-time lot allocation, cryptographic DPP audit proofs, and Incoterm tracking",
    tags: ["Live Telemetry", "Contract Governance", "Chain-of-Custody"],
    outputPath: path.join(baseDir, "images/operations/digital-operations-cockpit.jpg")
  });
  fs.copyFileSync(
    path.join(baseDir, "images/operations/digital-operations-cockpit.jpg"),
    path.join(baseDir, "images/operations/trader-cockpit-ops.jpg")
  );
}

generateAssets().catch(console.error);

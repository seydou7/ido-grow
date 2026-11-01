import sharp from "sharp";
import fs from "fs";
import path from "path";

const baseDir = path.resolve("./public");

// Ensure directories exist
fs.mkdirSync(path.join(baseDir, "images/actors"), { recursive: true });
fs.mkdirSync(path.join(baseDir, "images/operations"), { recursive: true });

function escapeXml(unsafe) {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
async function createEditorialPlate({ width, height, title, subtitle, role, tags, color1, color2, iconSvg, outputPath }) {
  const safeRole = escapeXml(role.toUpperCase());
  const safeSubtitle = escapeXml(subtitle.toUpperCase());
  const safeTitle = escapeXml(title);

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="60%" stop-color="${color2}"/>
        <stop offset="100%" stop-color="#0a1914"/>
      </linearGradient>
      <linearGradient id="overlayGrad" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stop-color="#091410" stop-opacity="0.95"/>
        <stop offset="50%" stop-color="#091410" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="#091410" stop-opacity="0.1"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      </pattern>
    </defs>

    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bgGrad)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>

    <!-- Subtle diagonal accents -->
    <path d="M -100 ${height} L ${width * 0.7} 0 L ${width} 0 L 200 ${height} Z" fill="rgba(255,255,255,0.02)"/>

    <!-- Ambient Glow Circle -->
    <circle cx="${width * 0.75}" cy="${height * 0.35}" r="${width * 0.3}" fill="rgba(52, 211, 153, 0.06)" filter="blur(40px)"/>

    <!-- Central Icon/Symbol Graphic -->
    <g transform="translate(${width * 0.5 - 70}, ${height * 0.28}) scale(1.4)" opacity="0.85">
      ${iconSvg}
    </g>

    <!-- Dark gradient overlay for typography readability -->
    <rect width="${width}" height="${height}" fill="url(#overlayGrad)"/>

    <!-- Top Badge -->
    <g transform="translate(36, 36)">
      <rect width="180" height="28" rx="6" fill="rgba(30, 84, 66, 0.85)" stroke="rgba(74, 222, 128, 0.3)" stroke-width="1"/>
      <text x="14" y="18" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#a7f3d0" letter-spacing="1.5">
        ${safeRole}
      </text>
    </g>

    <!-- Bottom Editorial Content -->
    <g transform="translate(36, ${height - 110})">
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#34d399" letter-spacing="2">
        ${safeSubtitle}
      </text>
      <text x="0" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="-0.5">
        ${safeTitle}
      </text>

      <!-- Tags -->
      <g transform="translate(0, 56)">
        ${tags.map((tag, i) => `
          <g transform="translate(${i * 140}, 0)">
            <rect width="130" height="24" rx="4" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
            <text x="12" y="16" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10.5" font-weight="600" fill="#e2e8f0">
              ${escapeXml(tag)}
            </text>
          </g>
        `).join("")}
      </g>
    </g>
  </svg>
  `;

  await sharp(Buffer.from(svg))
    .jpeg({ quality: 92 })
    .toFile(outputPath);
  console.log("Generated:", outputPath);
}

async function main() {
  // 1. Actor: Trader Desk
  await createEditorialPlate({
    width: 800,
    height: 600,
    title: "European Commodity Trading Desk",
    subtitle: "Commercial Risk & Settlement",
    role: "I Do Grow Traders",
    tags: ["Arbitrage & Matching", "B2B Escrow", "Incoterm Execution"],
    color1: "#143a2f",
    color2: "#0d261e",
    iconSvg: `
      <rect x="0" y="10" width="100" height="65" rx="6" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <line x1="20" y1="75" x2="10" y2="90" stroke="#6ee7b7" stroke-width="3"/>
      <line x1="80" y1="75" x2="90" y2="90" stroke="#6ee7b7" stroke-width="3"/>
      <line x1="0" y1="90" x2="100" y2="90" stroke="#6ee7b7" stroke-width="3"/>
      <polyline points="15,55 35,40 55,48 85,25" fill="none" stroke="#34d399" stroke-width="3.5" stroke-linecap="round"/>
      <circle cx="85" cy="25" r="4" fill="#34d399"/>
    `,
    outputPath: path.join(baseDir, "images/actors/actor-trader.jpg"),
  });

  // 2. Actor: Quality Inspector & Laboratory
  await createEditorialPlate({
    width: 800,
    height: 600,
    title: "Accredited Quality Laboratory",
    subtitle: "Standardized Technical Grading",
    role: "Quality & Testing",
    tags: ["Moisture Analysis", "Fiber Fineness", "ISO 17025 Certified"],
    color1: "#173f35",
    color2: "#102e26",
    iconSvg: `
      <path d="M40,15 L60,15 L60,40 L85,80 A10,10 0 0,1 76,95 L24,95 A10,10 0 0,1 15,80 L40,40 Z" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <line x1="30" y1="70" x2="70" y2="70" stroke="#34d399" stroke-width="2.5" stroke-dasharray="4 4"/>
      <circle cx="50" cy="80" r="4" fill="#34d399"/>
      <circle cx="38" cy="85" r="2.5" fill="#34d399"/>
      <circle cx="62" cy="78" r="3" fill="#34d399"/>
    `,
    outputPath: path.join(baseDir, "images/actors/actor-inspector.jpg"),
  });

  // 3. Actor: Logistics Partners
  await createEditorialPlate({
    width: 800,
    height: 600,
    title: "Multimodal Freight & Transit",
    subtitle: "Physical Chain of Custody",
    role: "Logistics Partners",
    tags: ["EXW / FCA / DAP", "GPS Lot Tracking", "CMR Consignment"],
    color1: "#1b4438",
    color2: "#112c24",
    iconSvg: `
      <rect x="10" y="25" width="55" height="45" rx="4" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <path d="M65,40 L85,40 L95,55 L95,70 L65,70 Z" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <circle cx="28" cy="75" r="9" fill="none" stroke="#34d399" stroke-width="3"/>
      <circle cx="80" cy="75" r="9" fill="none" stroke="#34d399" stroke-width="3"/>
      <line x1="37" y1="75" x2="71" y2="75" stroke="#6ee7b7" stroke-width="3"/>
    `,
    outputPath: path.join(baseDir, "images/actors/actor-logistics.jpg"),
  });

  // 4. Operations: Agricultural Loading & Warehouse
  await createEditorialPlate({
    width: 1200,
    height: 700,
    title: "European Agricultural Depots & Storage",
    subtitle: "Raw Material Aggregation",
    role: "Agricultural Infrastructure",
    tags: ["Humidity-Controlled", "Lot Identification", "Consolidation Hubs"],
    color1: "#1d473b",
    color2: "#102922",
    iconSvg: `
      <polygon points="10,40 50,15 90,40 90,85 10,85" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <rect x="35" y="50" width="30" height="35" fill="none" stroke="#34d399" stroke-width="2.5"/>
      <line x1="50" y1="50" x2="50" y2="85" stroke="#34d399" stroke-width="2"/>
    `,
    outputPath: path.join(baseDir, "images/operations/agri-loading-warehouse.jpg"),
  });

  // 5. Operations: Trader Digital Platform Cockpit
  await createEditorialPlate({
    width: 1200,
    height: 700,
    title: "Digital Operations & Matching Cockpit",
    subtitle: "Institutional Commodity Execution",
    role: "Digital Platform",
    tags: ["Smart RFQ Routing", "Cryptographic Hashes", "Bilateral Execution"],
    color1: "#123329",
    color2: "#091914",
    iconSvg: `
      <rect x="15" y="15" width="70" height="50" rx="4" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <rect x="25" y="25" width="20" height="12" fill="rgba(52, 211, 153, 0.4)"/>
      <line x1="55" y1="25" x2="75" y2="25" stroke="#6ee7b7" stroke-width="2"/>
      <line x1="55" y1="32" x2="70" y2="32" stroke="#6ee7b7" stroke-width="2"/>
      <polyline points="25,55 40,45 55,50 75,38" fill="none" stroke="#34d399" stroke-width="2.5"/>
      <line x1="35" y1="65" x2="65" y2="65" stroke="#6ee7b7" stroke-width="3"/>
    `,
    outputPath: path.join(baseDir, "images/operations/trader-cockpit-ops.jpg"),
  });

  // 6. Operations: Physical Logistics Dispatch
  await createEditorialPlate({
    width: 1200,
    height: 700,
    title: "Cross-Border Commodity Freight Network",
    subtitle: "Guaranteed Incoterm Logistics",
    role: "Physical Dispatch",
    tags: ["Direct Haulage", "Milestone Handover", "Customs Clearance"],
    color1: "#184034",
    color2: "#0e241d",
    iconSvg: `
      <circle cx="50" cy="50" r="38" fill="none" stroke="#6ee7b7" stroke-width="3"/>
      <ellipse cx="50" cy="50" rx="38" ry="16" fill="none" stroke="#34d399" stroke-width="2"/>
      <line x1="50" y1="12" x2="50" y2="88" stroke="#34d399" stroke-width="2"/>
      <line x1="12" y1="50" x2="88" y2="50" stroke="#34d399" stroke-width="2"/>
    `,
    outputPath: path.join(baseDir, "images/operations/logistics-freight-transit.jpg"),
  });
}

main().catch(console.error);

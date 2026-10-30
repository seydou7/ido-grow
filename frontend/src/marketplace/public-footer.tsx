import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[#102a23] text-[#e8f1ec] border-t border-[#1e5442]/60 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1e5442]/50">
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block hover:opacity-90 transition-opacity" aria-label="I Do Grow Home">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl inline-block shadow-xs">
                <img
                  src="/images/Logo IDoGrow principale.png"
                  alt="I Do Grow"
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-xs text-[#b8d4c7] max-w-sm leading-relaxed">
              The premier European B2B commodity trading platform for verified, traceable industrial natural raw materials — empowering agricultural cooperatives, mills, and global procurement teams.
            </p>
            <div className="flex items-center space-x-3 text-xs text-[#9fc0b2] pt-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#173f35] border border-[#256852] text-[11px] font-semibold text-white">
                EU DPP Ready
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#173f35] border border-[#256852] text-[11px] font-semibold text-white">
                CSRD Aligned
              </span>
            </div>
          </div>

          {/* Sourcing & Marketplace */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Marketplace
            </h4>
            <ul className="space-y-2 text-xs text-[#b8d4c7]">
              <li>
                <Link href="/marketplace" className="hover:text-white transition-colors">
                  All Natural Materials
                </Link>
              </li>
              <li>
                <Link href="/marketplace?materialType=HEMP" className="hover:text-white transition-colors">
                  Industrial Hemp
                </Link>
              </li>
              <li>
                <Link href="/marketplace?materialType=FLAX" className="hover:text-white transition-colors">
                  European Flax (Linen)
                </Link>
              </li>
              <li>
                <Link href="/marketplace?materialType=SISAL" className="hover:text-white transition-colors">
                  Raw Sisal
                </Link>
              </li>
              <li>
                <Link href="/marketplace?materialType=JUTE" className="hover:text-white transition-colors">
                  Golden Jute
                </Link>
              </li>
              <li>
                <Link href="/marketplace?materialType=COIR" className="hover:text-white transition-colors">
                  Coconut Coir
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Trust */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Platform & Trust
            </h4>
            <ul className="space-y-2 text-xs text-[#b8d4c7]">
              <li>
                <Link href="/#ecosystem" className="hover:text-white transition-colors">
                  Ecosystem & Actors
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#traceability" className="hover:text-white transition-colors">
                  Traceability & DPP
                </Link>
              </li>
              <li>
                <Link href="/#quality" className="hover:text-white transition-colors">
                  Quality Standards & Lab
                </Link>
              </li>
              <li>
                <Link href="/#benefits" className="hover:text-white transition-colors">
                  Why I Do Grow
                </Link>
              </li>
            </ul>
          </div>

          {/* Operational Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Portals & Operations
            </h4>
            <ul className="space-y-2 text-xs text-[#b8d4c7]">
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Trade Portal Access
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Buyer Desk
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Producer / Mill Cockpit
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Quality Inspector Desk
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  Trader Matching Cockpit
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8daea0] gap-4">
          <p>© {new Date().getFullYear()} I Do Grow SAS. All rights reserved. Registered European B2B Commodity Trading Infrastructure.</p>
          <div className="flex items-center space-x-6">
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Privacy & Data Governance</span>
            <span className="hover:text-white transition-colors cursor-pointer">Traceability Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

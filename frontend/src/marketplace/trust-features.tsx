"use client";

export function TrustFeatures() {
  const features = [
    {
      icon: (
        <svg className="w-6 h-6 text-[#1e5442]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Verified Producer Network",
      description: "Direct relationship with vetted European agricultural cooperatives, decortication mills, and primary processors.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#1e5442]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: "Structured Quality Inspections",
      description: "Standardized physical and laboratory assessments: moisture percentage, fibre fineness, impurity ratio, and verified certificates.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#1e5442]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: "Digital Product Passport (DPP)",
      description: "Lot-level provenance and custody tracking ready for European CSRD and Ecodesign for Sustainable Products Regulation audits.",
    },
    {
      icon: (
        <svg className="w-6 h-6 text-[#1e5442]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      title: "Managed B2B Trading & Logistics",
      description: "Formal quote negotiation, structured digital sales contracts, and freight carrier assignment through our trading desk.",
    },
  ];

  return (
    <section className="py-16 bg-[#f4f0e2] border-t border-[#e2dcce]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e5442]">
            Professional Commodity Infrastructure
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#173f35] tracking-tight mt-1">
            Why source through I Do Grow?
          </h2>
          <p className="mt-2 text-sm text-[#5c6e66]">
            We bridge industrial manufacturers and European natural fibre producers through structured, verifiable digital commodity transactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => (
            <div
              key={feat.title}
              className="bg-white p-6 rounded-2xl border border-[#ded8c4] shadow-xs hover:border-[#1e5442] transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-[#eef6f2] flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-[#173f35] mb-2">{feat.title}</h3>
              <p className="text-xs text-[#5c6e66] leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

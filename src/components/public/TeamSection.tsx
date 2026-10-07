import React from "react";

export interface TeamMemberData {
  id: number;
  fullName: string;
  roleTitle: string;
  education: string | null;
  experienceYears: string | null;
  bio: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
}

interface TeamSectionProps {
  initialTeam: TeamMemberData[];
}

export function TeamSection({ initialTeam }: TeamSectionProps) {
  const activeTeam = initialTeam
    .filter((m) => m.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Separate Founder & Project Manager Er. Lalit Choudhary for dedicated architectural spotlight
  const founder = activeTeam.find(
    (m) =>
      m.fullName.toLowerCase().includes("lalit") ||
      m.roleTitle.toLowerCase().includes("founder")
  );

  const teamMembers = activeTeam.filter((m) => m.id !== founder?.id);

  return (
    <section id="team" className="py-28 bg-[#FFFFFF] relative border-t border-[#BCC1C4]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015]">
              <span>06</span>
              <span className="w-8 h-px bg-[#966015]/60" />
              <span>Leadership &amp; Engineers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#032D47]">
              The Engineering Minds
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[#455668] max-w-md font-normal leading-relaxed">
            Led by certified civil and structural engineers with proven field execution experience
            across South Gujarat.
          </p>
        </div>

        {/* 1. FOUNDER SPOTLIGHT: Er. Lalit Choudhary */}
        {founder && (
          <div className="mb-20 rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 p-8 sm:p-12 shadow-[0_4px_24px_rgba(3,45,71,0.03)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Founder Image Frame */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-4/5 w-full max-w-md mx-auto rounded-xs overflow-hidden bg-[#FFFFFF] border border-[#BCC1C4]/60 shadow-md">
                  {founder.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={founder.imageUrl}
                      alt={founder.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F2EFEB] text-[#032D47] font-serif text-4xl">
                      LC
                    </div>
                  )}

                  {/* Founder Badge */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xs bg-[#032D47] text-[#F9F6F5] text-[10px] font-mono font-bold uppercase tracking-widest shadow-xs">
                    FOUNDER &amp; PM
                  </div>

                  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs text-[#966015] text-[10px] font-mono font-bold border border-[#BCC1C4]/50 shadow-xs">
                    EST. 2021
                  </div>
                </div>
              </div>

              {/* Founder Biography & Editorial Credentials */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold mb-2">
                    <span>Practice Founder &amp; Direction</span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-[#032D47] tracking-tight">
                    {founder.fullName}
                  </h3>
                  <p className="text-base sm:text-lg font-semibold text-[#966015] mt-1 font-serif">
                    {founder.roleTitle}
                  </p>
                </div>

                <div className="p-4 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40 flex flex-wrap items-center gap-6 text-xs font-mono">
                  {founder.education && (
                    <div>
                      <span className="text-[#455668] block text-[10px] uppercase tracking-wider">Education</span>
                      <span className="font-bold text-[#032D47] mt-0.5 block">{founder.education}</span>
                    </div>
                  )}
                  {founder.experienceYears && (
                    <div className="sm:border-l sm:border-[#BCC1C4]/40 sm:pl-6">
                      <span className="text-[#455668] block text-[10px] uppercase tracking-wider">Experience</span>
                      <span className="font-bold text-[#966015] mt-0.5 block">{founder.experienceYears}</span>
                    </div>
                  )}
                  <div className="sm:border-l sm:border-[#BCC1C4]/40 sm:pl-6">
                    <span className="text-[#455668] block text-[10px] uppercase tracking-wider">Location</span>
                    <span className="font-bold text-[#032D47] mt-0.5 block">Bardoli, Gujarat</span>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-[#455668] leading-relaxed">
                  {founder.bio ||
                    "Project management specialist leading MAYA Design & Build since 2021 with comprehensive expertise in high-precision structural execution and project controls."}
                </p>

                {/* Professional Trajectory Milestone Breadcrumbs */}
                <div className="space-y-2 pt-2 border-t border-[#BCC1C4]/40">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#455668] font-bold block">
                    Source Verified Career Path:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#032D47]">
                    <span className="px-2.5 py-1 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40">2018: B.Tech Civil</span>
                    <span className="text-[#BCC1C4]">→</span>
                    <span className="px-2.5 py-1 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40">2019: Sangini Group Jr. Eng.</span>
                    <span className="text-[#BCC1C4]">→</span>
                    <span className="px-2.5 py-1 rounded-xs bg-[#FFFFFF] border border-[#BCC1C4]/40">2020: Managed Hotels</span>
                    <span className="text-[#BCC1C4]">→</span>
                    <span className="px-2.5 py-1 rounded-xs bg-[#FFFFFF] border border-[#966015]/60 text-[#966015] font-bold">2021–Pres: Founder, MAYA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ENGINEERING TEAM GRID */}
        {teamMembers.length > 0 && (
          <div className="space-y-8">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#966015] font-bold">
                Civil &amp; Technical Discipline Leads
              </span>
              <h3 className="text-2xl font-black text-[#032D47] tracking-tight">
                Engineering &amp; Site Leadership
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-xs bg-[#F9F6F5] border border-[#BCC1C4]/60 hover:border-[#032D47] transition-all duration-300 overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div>
                    {/* Photo Frame */}
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-[#FFFFFF] border-b border-[#BCC1C4]/40">
                      {member.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.imageUrl}
                          alt={member.fullName}
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 ease-out"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#F2EFEB] text-[#032D47] font-serif text-2xl font-bold">
                          {member.fullName.charAt(0)}
                        </div>
                      )}

                      {member.experienceYears && (
                        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-xs bg-[#FFFFFF]/90 backdrop-blur-xs text-[10px] font-mono font-bold text-[#966015] border border-[#BCC1C4]/40 shadow-xs">
                          {member.experienceYears}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-1.5">
                      <h4 className="text-base font-black text-[#032D47] tracking-tight leading-snug">
                        {member.fullName}
                      </h4>
                      <p className="text-xs font-bold text-[#966015] leading-snug">
                        {member.roleTitle}
                      </p>
                      {member.education && (
                        <p className="text-[11px] font-mono text-[#455668] pt-0.5">
                          {member.education}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio summary */}
                  {member.bio && (
                    <div className="p-5 pt-3 border-t border-[#BCC1C4]/30 text-xs text-[#455668] line-clamp-3 leading-relaxed">
                      {member.bio}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

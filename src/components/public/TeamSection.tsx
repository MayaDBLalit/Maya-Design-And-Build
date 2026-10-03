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

  return (
    <section id="team" className="py-24 bg-[#0D0F12] relative border-t border-[#2B313D]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[#C5A869]">
              <span>06</span>
              <span className="w-8 h-px bg-[#C5A869]/60" />
              <span>Leadership &amp; Engineers</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
              The Engineering Minds
            </h2>
          </div>
          <p className="text-sm text-neutral-400 max-w-md font-light leading-relaxed">
            Led by certified civil and structural engineers with decades of field-proven execution
            experience across South Gujarat.
          </p>
        </div>

        {/* Team Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {activeTeam.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-[#14171C] border border-[#2B313D] hover:border-[#C5A869]/40 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Frame */}
                <div className="relative aspect-square w-full overflow-hidden bg-neutral-900 border-b border-[#2B313D]">
                  {member.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.imageUrl}
                      alt={member.fullName}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#14171C] text-[#C5A869] font-mono text-2xl font-bold">
                      {member.fullName.charAt(0)}
                    </div>
                  )}

                  {member.experienceYears && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[10px] font-mono font-bold text-[#C5A869] border border-[#C5A869]/30">
                      {member.experienceYears}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {member.fullName}
                  </h3>
                  <p className="text-xs font-medium text-[#C5A869] leading-snug">
                    {member.roleTitle}
                  </p>
                  {member.education && (
                    <p className="text-[11px] font-mono text-neutral-400 pt-1">
                      {member.education}
                    </p>
                  )}
                </div>
              </div>

              {/* Bio summary */}
              {member.bio && (
                <div className="p-4 pt-2 border-t border-[#2B313D]/60 text-[11px] text-neutral-400 line-clamp-3 leading-relaxed font-light">
                  {member.bio}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { TrendingUp, AlertOctagon, CheckCircle2, XCircle, Swords } from 'lucide-react';

interface DebateThesis {
  bullThesis: {
    coreArgument: string;
    keyPoints: string[];
    projectedGrowthDriver: string;
  };
  bearThesis: {
    coreArgument: string;
    keyRisks: string[];
    downsideVulnerability: string;
  };
}

interface Props {
  debate?: DebateThesis;
}

export const BullBearDebateCard: React.FC<Props> = ({ debate }) => {
  if (!debate) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[rgba(243,231,196,0.1)] border border-[rgba(243,231,196,0.2)]">
          <Swords className="w-5 h-5 text-[var(--gold-champagne)]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            Adversarial Investment Committee Debate
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Synthesized adversarial debate between Aggressive Growth Bull Persona vs Risk-Averse Deep Value Bear Persona
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bull Persona Column */}
        <div className="glass-panel p-6 border-l-4 border-l-[var(--emerald-primary)] bg-[rgba(0,255,135,0.02)] relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(0,255,135,0.15)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--emerald-primary)]" />
              <span className="font-bold text-white uppercase tracking-wider text-sm font-mono text-[var(--emerald-primary)]">
                Bull Persona Thesis
              </span>
            </div>
            <span className="tag-badge bg-[rgba(0,255,135,0.15)] text-[var(--emerald-primary)] border border-[rgba(0,255,135,0.3)]">
              Growth Driver
            </span>
          </div>

          <p className="text-sm text-[var(--text-main)] font-semibold leading-relaxed mb-4 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)]">
            "{debate.bullThesis.coreArgument}"
          </p>

          <div className="space-y-2.5 mb-4">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">Key Catalysts:</span>
            {debate.bullThesis.keyPoints.map((point, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-main)]">
                <CheckCircle2 className="w-4 h-4 text-[var(--emerald-primary)] shrink-0 mt-0.5" />
                <span className="leading-normal">{point}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] text-xs font-mono">
            <span className="text-[var(--text-muted)]">Primary Catalyst: </span>
            <span className="text-[var(--emerald-teal)] font-bold">{debate.bullThesis.projectedGrowthDriver}</span>
          </div>
        </div>

        {/* Bear Persona Column */}
        <div className="glass-panel p-6 border-l-4 border-l-[var(--crimson-alert)] bg-[rgba(255,75,75,0.02)] relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[rgba(255,75,75,0.15)]">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-[var(--crimson-alert)]" />
              <span className="font-bold uppercase tracking-wider text-sm font-mono text-[var(--crimson-alert)]">
                Bear Persona Counter-Thesis
              </span>
            </div>
            <span className="tag-badge bg-[rgba(255,75,75,0.15)] text-[var(--crimson-alert)] border border-[rgba(255,75,75,0.3)]">
              Downside Risk
            </span>
          </div>

          <p className="text-sm text-[var(--text-main)] font-semibold leading-relaxed mb-4 p-3 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[rgba(255,255,255,0.05)]">
            "{debate.bearThesis.coreArgument}"
          </p>

          <div className="space-y-2.5 mb-4">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">Key Vulnerabilities:</span>
            {debate.bearThesis.keyRisks.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs text-[var(--text-main)]">
                <XCircle className="w-4 h-4 text-[var(--crimson-alert)] shrink-0 mt-0.5" />
                <span className="leading-normal">{risk}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] text-xs font-mono">
            <span className="text-[var(--text-muted)]">Downside Trigger: </span>
            <span className="text-[var(--amber-warn)] font-bold">{debate.bearThesis.downsideVulnerability}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Shield, AlertTriangle, Zap, Flame, Grid } from 'lucide-react';

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

interface Props {
  swot?: SwotData;
}

export const SwotMatrix: React.FC<Props> = ({ swot }) => {
  if (!swot) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-[rgba(0,255,135,0.1)] border border-[rgba(0,255,135,0.2)]">
          <Grid className="w-5 h-5 text-[var(--emerald-primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white uppercase tracking-wide">
            Institutional SWOT Matrix
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Synthesized 2x2 multi-agent evaluation of internal moats and external market forces
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="glass-panel p-5 border-t-2 border-t-[var(--emerald-primary)] bg-[rgba(0,255,135,0.015)]">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-[var(--emerald-primary)]" />
            <span className="font-mono font-bold text-sm uppercase tracking-wider text-[var(--emerald-primary)]">
              Strengths (Internal Moat)
            </span>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-main)]">
            {swot.strengths.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--emerald-primary)] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="glass-panel p-5 border-t-2 border-t-[var(--amber-warn)] bg-[rgba(255,143,61,0.015)]">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-[var(--amber-warn)]" />
            <span className="font-mono font-bold text-sm uppercase tracking-wider text-[var(--amber-warn)]">
              Weaknesses (Internal Vulnerabilities)
            </span>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-main)]">
            {swot.weaknesses.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--amber-warn)] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Opportunities */}
        <div className="glass-panel p-5 border-t-2 border-t-[var(--emerald-teal)] bg-[rgba(96,239,255,0.015)]">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-[var(--emerald-teal)]" />
            <span className="font-mono font-bold text-sm uppercase tracking-wider text-[var(--emerald-teal)]">
              Opportunities (External Growth)
            </span>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-main)]">
            {swot.opportunities.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--emerald-teal)] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Threats */}
        <div className="glass-panel p-5 border-t-2 border-t-[var(--crimson-alert)] bg-[rgba(255,75,75,0.015)]">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-[var(--crimson-alert)]" />
            <span className="font-mono font-bold text-sm uppercase tracking-wider text-[var(--crimson-alert)]">
              Threats (External Headwinds)
            </span>
          </div>
          <ul className="space-y-2 text-xs text-[var(--text-main)]">
            {swot.threats.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--crimson-alert)] font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

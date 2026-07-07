import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Target, TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from 'lucide-react';

interface CioVerdict {
  decision: 'INVEST' | 'PASS';
  confidenceScore: number;
  targetPrice12m: number;
  expectedReturnPercent: number;
  investmentHorizon: string;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  executiveSummary: string;
  keyThesisPoints: string[];
  primaryRiskFactor: string;
  actionableAdvice: string;
}

interface Props {
  verdict?: CioVerdict;
  currency: string;
}

export const VerdictBadge: React.FC<Props> = ({ verdict, currency }) => {
  useEffect(() => {
    if (verdict?.decision === 'INVEST') {
      // Celebrate institutional alpha with green/teal gold confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00FF87', '#60EFFF', '#F3E7C4', '#D4AF37']
        });
      } catch (e) {
        console.warn('Confetti animation error:', e);
      }
    }
  }, [verdict?.decision]);

  if (!verdict) return null;

  const isInvest = verdict.decision === 'INVEST';
  const currencySymbol = currency === 'INR' ? '₹' : '$';

  return (
    <div className={`glass-panel p-8 mb-8 border-2 transition-all relative overflow-hidden ${
      isInvest 
        ? 'border-[var(--emerald-primary)] bg-[rgba(0,255,135,0.04)] shadow-[0_0_40px_rgba(0,255,135,0.15)]' 
        : 'border-[var(--crimson-alert)] bg-[rgba(255,75,75,0.04)] shadow-[0_0_40px_rgba(255,75,75,0.15)]'
    }`}>
      {/* Background Icon Watermark */}
      <div className="absolute right-[-40px] bottom-[-40px] opacity-5 pointer-events-none transform rotate-12">
        {isInvest ? <Award className="w-96 h-96 text-[var(--emerald-primary)]" /> : <AlertTriangle className="w-96 h-96 text-[var(--crimson-alert)]" />}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        {/* Left Col: Verdict & Confidence Score */}
        <div className="flex items-center gap-6">
          <div className={`w-28 h-28 rounded-2xl flex flex-col items-center justify-center font-mono font-extrabold shadow-2xl border ${
            isInvest
              ? 'bg-gradient-to-br from-[var(--emerald-primary)] to-[var(--emerald-teal)] text-[#0A0E13] border-[#00FF87]'
              : 'bg-gradient-to-br from-[var(--crimson-alert)] to-[var(--amber-warn)] text-[#0A0E13] border-[#FF4B4B]'
          }`}>
            <span className="text-3xl tracking-tighter leading-none">{verdict.decision}</span>
            <span className="text-[10px] uppercase font-bold tracking-widest mt-1 opacity-80">Verdict</span>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                Aegis Alpha Studio • Institutional Rating
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                verdict.riskRating === 'LOW' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                verdict.riskRating === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                Risk: {verdict.riskRating}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {isInvest ? 'Strategic Alpha Allocation Approved' : 'Capital Preservation Recommended (Pass)'}
            </h2>

            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--text-muted)]">Alpha Confidence:</span>
                <div className="w-32 bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-700">
                  <div 
                    className={`h-full transition-all duration-1000 ${isInvest ? 'bg-[var(--emerald-primary)]' : 'bg-[var(--crimson-alert)]'}`}
                    style={{ width: `${verdict.confidenceScore}%` }}
                  />
                </div>
                <span className={`font-mono font-bold text-sm ${isInvest ? 'text-[var(--emerald-primary)]' : 'text-[var(--crimson-alert)]'}`}>
                  {verdict.confidenceScore}/100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Target Price & Expected Return Gauge */}
        <div className="flex md:flex-col justify-between md:items-end border-t md:border-t-0 pt-4 md:pt-0 border-[rgba(255,255,255,0.1)]">
          <div className="text-left md:text-right">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase flex items-center md:justify-end gap-1">
              <Target className="w-3.5 h-3.5 text-[var(--gold-champagne)]" /> 12-Month Target Price
            </span>
            <div className="text-3xl font-extrabold font-mono text-white mt-1">
              {currencySymbol}{verdict.targetPrice12m.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right mt-2">
            <span className="text-xs font-mono text-[var(--text-muted)] uppercase">Expected Return</span>
            <div className={`text-xl font-bold font-mono flex items-center justify-end gap-1 mt-0.5 ${
              verdict.expectedReturnPercent >= 0 ? 'text-[var(--emerald-primary)]' : 'text-[var(--crimson-alert)]'
            }`}>
              {verdict.expectedReturnPercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              <span>{verdict.expectedReturnPercent >= 0 ? '+' : ''}{verdict.expectedReturnPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

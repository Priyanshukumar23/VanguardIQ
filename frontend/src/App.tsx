import React, { useState, useEffect } from 'react';
import api from './api';
import { Search, Sparkles, Terminal, Shield, Cpu, RefreshCw, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { AgentProgressTracker } from './components/AgentProgressTracker';
import { FinancialHeaderCard } from './components/FinancialHeaderCard';
import { VerdictBadge } from './components/VerdictBadge';
import { BullBearDebateCard } from './components/BullBearDebateCard';
import { SwotMatrix } from './components/SwotMatrix';
import { ExecutiveSummary } from './components/ExecutiveSummary';

interface PopularCompany {
  symbol: string;
  name: string;
  sector: string;
  tag: string;
}

export const App: React.FC = () => {
  const [searchInput, setSearchInput] = useState('AAPL');
  const [popularCompanies, setPopularCompanies] = useState<PopularCompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [reportState, setReportState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch popular tickers on mount
  useEffect(() => {
    api.get('/api/companies/popular')
      .then(res => setPopularCompanies(res.data))
      .catch(() => {
        // Fallback static list
        setPopularCompanies([
          { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Tech', tag: 'High FCF Megacap' },
          { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'AI Hardware', tag: 'Hypergrowth AI Moat' },
          { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Conglomerate', tag: 'Indian Market Leader' },
          { symbol: 'ZOMATO.NS', name: 'Zomato Limited', sector: 'Quick Commerce', tag: 'Blinkit Expansion' },
          { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'EV & AI', tag: 'High Volatility Debated' },
          { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', sector: 'Automotive', tag: 'JLR Turnaround Alpha' }
        ]);
      });
  }, []);

  // Handle SSE streaming or polling when jobId changes
  useEffect(() => {
    if (!jobId) return;

    const BASE =
      import.meta.env.PROD
        ? import.meta.env.VITE_API_URL
        : "";

    let eventSource: EventSource | null = null;
    let pollInterval: any = null;

    try {
      eventSource = new EventSource(
        `${BASE}/api/research/stream/${jobId}`
      );

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setReportState(data);
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          setLoading(false);
          eventSource?.close();
        }
      };

      eventSource.onerror = () => {
        console.warn('SSE connection closed or failed, falling back to polling.');
        eventSource?.close();
        // Start polling fallback
        pollInterval = setInterval(async () => {
          try {
            const res = await api.get(`/api/research/status/${jobId}`);
            setReportState(res.data);
            if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
              setLoading(false);
              clearInterval(pollInterval);
            }
          } catch (e) {
            console.error('Polling error:', e);
          }
        }, 1500);
      };
    } catch (e) {
      console.warn('SSE initiation failed, using polling.');
      pollInterval = setInterval(async () => {
        try {
          const res = await api.get(`/api/research/status/${jobId}`);
          setReportState(res.data);
          if (res.data.status === 'COMPLETED' || res.data.status === 'FAILED') {
            setLoading(false);
            clearInterval(pollInterval);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 1500);
    }

    return () => {
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId]);

  const handleStartResearch = async (symbolToAnalyze?: string) => {
    const symbol = symbolToAnalyze || searchInput;
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);
    setReportState(null);
    setJobId(null);
    if (symbolToAnalyze) setSearchInput(symbolToAnalyze);

    try {
      const res = await api.post('/api/research/analyze', { symbol: symbol.trim() });
      setJobId(res.data.jobId);
    } catch (err: any) {
      setLoading(false);
      setError(err.response?.data?.error || err.message || 'Failed to initialize research pipeline');
    }
  };

  return (
    <div className="app-container">
      {/* Navbar / Brand Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[var(--border-subtle)] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--emerald-primary)] to-[var(--emerald-teal)] flex items-center justify-center shadow-[0_0_20px_rgba(0,255,135,0.3)]">
            <Terminal className="w-6 h-6 text-[#0A0E13]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white tracking-tight">VanguardIQ</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[rgba(0,255,135,0.1)] text-[var(--emerald-primary)] border border-[rgba(0,255,135,0.2)] font-bold">
                Aegis Alpha Studio
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Autonomous AI Investment Research Terminal • InsideIIM × Altuni AI Labs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-slate)] border border-[var(--border-subtle)]">
            <span className="w-2 h-2 rounded-full bg-[var(--emerald-primary)] animate-pulse" />
            <span>Node.js / LangGraph Engine Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--surface-slate)] border border-[var(--border-subtle)]">
            <Cpu className="w-3.5 h-3.5 text-[var(--emerald-teal)]" />
            <span>Multi-Agent Consensus</span>
          </div>
        </div>
      </header>

      {/* Hero Section & Search Bar */}
      <section className="mb-10 text-center max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
          Autonomous Institutional <span className="gradient-emerald">Alpha Research</span>
        </h2>
        <p className="text-sm md:text-base text-[var(--text-muted)] mb-8 leading-relaxed">
          Input any global stock ticker or company name. Watch our specialized LangGraph AI agents investigate financials, synthesize market news, debate bull vs. bear theses, and issue an institutional **INVEST** or **PASS** verdict.
        </p>

        {/* Ticker Input Bar */}
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-dim)]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
              placeholder="Enter Ticker e.g. AAPL, NVDA, RELIANCE.NS, ZOMATO..."
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--surface-slate)] border border-[var(--border-subtle)] text-white font-mono placeholder:text-[var(--text-dim)] focus:outline-none focus:border-[var(--emerald-primary)] transition-all text-sm shadow-inner"
            />
          </div>
          <button
            onClick={() => handleStartResearch()}
            disabled={loading || !searchInput.trim()}
            className="btn-primary justify-center py-3.5 px-8 shrink-0 text-sm"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Research</span>
              </>
            )}
          </button>
        </div>

        {/* Popular Stocks Quick Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs font-mono text-[var(--text-dim)] mr-1">Popular Tickers:</span>
          {popularCompanies.map((comp) => (
            <button
              key={comp.symbol}
              onClick={() => handleStartResearch(comp.symbol)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
                searchInput === comp.symbol
                  ? 'bg-[rgba(0,255,135,0.15)] border-[var(--emerald-primary)] text-[var(--emerald-primary)] font-bold'
                  : 'bg-[var(--surface-slate)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-gray-500 hover:text-white'
              }`}
            >
              <span>{comp.symbol}</span>
              <span className="opacity-60 font-sans text-[11px] hidden sm:inline">({comp.name.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className="p-4 mb-8 rounded-xl bg-[rgba(255,75,75,0.1)] border border-[var(--crimson-alert)] flex items-center gap-3 max-w-2xl mx-auto text-sm text-red-300">
          <AlertCircle className="w-5 h-5 text-[var(--crimson-alert)] shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Real-time LangGraph Execution Pipeline Roadmap */}
      {reportState && (
        <AgentProgressTracker
          steps={reportState.steps || []}
          currentStep={reportState.currentStep}
          status={reportState.status}
        />
      )}

      {/* Financial Overview & Interactive Chart */}
      {(reportState?.financials || loading) && (
        <FinancialHeaderCard
          data={reportState?.financials}
          loading={loading && !reportState?.financials}
        />
      )}

      {/* CIO Verdict Badge */}
      {reportState?.verdict && (
        <VerdictBadge
          verdict={reportState.verdict}
          currency={reportState.financials?.currency || 'USD'}
        />
      )}

      {/* Bull vs. Bear Debate Arena */}
      {reportState?.debate && (
        <BullBearDebateCard debate={reportState.debate} />
      )}

      {/* Institutional SWOT Matrix */}
      {reportState?.swot && (
        <SwotMatrix swot={reportState.swot} />
      )}

      {/* Executive Summary & Actionable Memo */}
      {reportState?.verdict && (
        <ExecutiveSummary
          verdict={reportState.verdict}
          companyName={reportState.financials?.companyName || searchInput}
          symbol={reportState.symbol || searchInput}
          currency={reportState.financials?.currency || 'USD'}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 pt-8 border-t border-[var(--border-subtle)] text-center text-xs text-[var(--text-dim)] font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span>Built with React, Node.js & LangGraph.js • InsideIIM × Altuni AI Labs Assignment</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Aegis Alpha Studio v1.0.0</span>
          <span className="text-[var(--emerald-primary)]">● Ready for Enterprise Evaluation</span>
        </div>
      </footer>
    </div>
  );
};

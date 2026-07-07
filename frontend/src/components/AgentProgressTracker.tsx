import React, { useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Clock, ChevronDown, ChevronUp, Cpu, Activity, ShieldAlert, Award } from 'lucide-react';

interface AgentStep {
  nodeId: string;
  nodeName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  durationMs?: number;
  summary?: string;
  details?: any;
}

interface Props {
  steps: AgentStep[];
  currentStep: string;
  status: string;
}

const NODE_ICONS: Record<string, React.ReactNode> = {
  'quant_analyst': <Activity className="w-5 h-5 text-emerald-400" />,
  'news_sentiment': <Cpu className="w-5 h-5 text-cyan-400" />,
  'bull_bear_debate': <ShieldAlert className="w-5 h-5 text-amber-400" />,
  'cio_verdict': <Award className="w-5 h-5 text-gold-400" />
};

export const AgentProgressTracker: React.FC<Props> = ({ steps, currentStep, status }) => {
  const [expandedNode, setExpandedNode] = useState<string | null>(null);

  const allNodes = [
    { id: 'quant_analyst', name: 'Quantitative Analyst', desc: 'Financials, Multiples & Balance Sheet' },
    { id: 'news_sentiment', name: 'Sentiment Researcher', desc: 'News, Catalysts & Macro Risks' },
    { id: 'bull_bear_debate', name: 'Debate & SWOT Arena', desc: 'Adversarial Bull vs. Bear Synthesis' },
    { id: 'cio_verdict', name: 'CIO Executive Verdict', desc: 'Alpha Confidence & Target Price' }
  ];

  const getStepData = (id: string): AgentStep => {
    const found = steps.find(s => s.nodeId === id);
    if (found) return found;
    if (id === currentStep && status === 'IN_PROGRESS') {
      return { nodeId: id, nodeName: id, status: 'RUNNING', summary: 'Agent active...' };
    }
    return { nodeId: id, nodeName: id, status: 'PENDING' };
  };

  return (
    <div className="glass-panel p-6 mb-8 border border-[var(--border-subtle)]">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[var(--emerald-primary)] animate-pulse" />
          <h3 className="text-lg font-bold text-white tracking-wide uppercase">
            LangGraph Multi-Agent Execution Pipeline
          </h3>
        </div>
        <span className="tag-badge bg-[var(--surface-slate)] text-[var(--emerald-primary)] border border-[var(--border-subtle)]">
          {status === 'COMPLETED' ? 'Pipeline Complete' : status === 'IN_PROGRESS' ? 'Agents Processing...' : status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {allNodes.map((node, index) => {
          const stepData = getStepData(node.id);
          const isRunning = stepData.status === 'RUNNING';
          const isCompleted = stepData.status === 'COMPLETED';
          const isError = stepData.status === 'ERROR';

          return (
            <div
              key={node.id}
              onClick={() => stepData.summary && setExpandedNode(expandedNode === node.id ? null : node.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                isRunning
                  ? 'bg-[rgba(0,255,135,0.08)] border-[var(--emerald-primary)] pulse-emerald'
                  : isCompleted
                  ? 'bg-[var(--surface-slate)] border-[rgba(0,255,135,0.3)] hover:border-[var(--emerald-primary)]'
                  : 'bg-[rgba(17,23,33,0.4)] border-[var(--border-subtle)] opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-[rgba(0,0,0,0.3)]">
                  {NODE_ICONS[node.id] || <Activity className="w-5 h-5 text-gray-400" />}
                </div>
                <div>
                  {isCompleted && <CheckCircle2 className="w-5 h-5 text-[var(--emerald-primary)]" />}
                  {isRunning && <Loader2 className="w-5 h-5 text-[var(--emerald-primary)] animate-spin" />}
                  {isError && <AlertCircle className="w-5 h-5 text-red-500" />}
                  {stepData.status === 'PENDING' && <Clock className="w-4 h-4 text-gray-600" />}
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xs font-mono text-[var(--text-dim)] uppercase tracking-wider">
                  Node 0{index + 1}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{node.name}</h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-1">{node.desc}</p>
              </div>

              {stepData.durationMs && (
                <div className="mt-3 pt-2 border-t border-[rgba(255,255,255,0.05)] flex items-center justify-between text-xs font-mono text-[var(--text-dim)]">
                  <span>Latency:</span>
                  <span className="text-[var(--emerald-teal)]">{stepData.durationMs} ms</span>
                </div>
              )}

              {stepData.summary && (
                <div className="mt-2 flex items-center justify-end text-xs text-[var(--emerald-primary)] font-semibold gap-1">
                  <span>Logs</span>
                  {expandedNode === node.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded Agent Log Details */}
      {expandedNode && (() => {
        const step = steps.find(s => s.nodeId === expandedNode);
        if (!step) return null;
        return (
          <div className="mt-4 p-4 rounded-xl bg-[rgba(0,0,0,0.5)] border border-[var(--border-subtle)] font-mono text-sm animate-fadeIn">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2 pb-2 border-b border-[rgba(255,255,255,0.05)]">
              <span className="text-[var(--emerald-primary)] font-bold">// [AGENT THOUGHT LOG: {step.nodeName.toUpperCase()}]</span>
              <span>{step.durationMs ? `${step.durationMs}ms Execution` : 'Active'}</span>
            </div>
            <p className="text-[var(--text-main)] leading-relaxed whitespace-pre-wrap font-sans text-sm">
              {step.summary}
            </p>
            {step.details && (
              <pre className="mt-3 p-3 rounded bg-[rgba(10,14,19,0.8)] text-xs text-[var(--emerald-teal)] overflow-x-auto border border-[rgba(0,255,135,0.1)]">
                {JSON.stringify(step.details, null, 2)}
              </pre>
            )}
          </div>
        );
      })()}
    </div>
  );
};

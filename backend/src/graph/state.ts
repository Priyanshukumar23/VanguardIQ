import { Annotation } from '@langchain/langgraph';
import { FinancialMetrics, SentimentAnalysis, DebateThesis, SwotMatrix, CioVerdict, AgentExecutionStep } from '../types';

/**
 * Defines the shared State channel for our LangGraph Multi-Agent Research Pipeline.
 */
export const ResearchStateAnnotation = Annotation.Root({
  jobId: Annotation<string>({
    reducer: (x, y) => y ?? x ?? '',
    default: () => ''
  }),
  symbol: Annotation<string>({
    reducer: (x, y) => y ?? x ?? '',
    default: () => ''
  }),
  companyName: Annotation<string>({
    reducer: (x, y) => y ?? x ?? '',
    default: () => ''
  }),
  status: Annotation<'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'>({
    reducer: (x, y) => y ?? x ?? 'QUEUED',
    default: () => 'QUEUED'
  }),
  currentStep: Annotation<string>({
    reducer: (x, y) => y ?? x ?? '',
    default: () => ''
  }),
  steps: Annotation<AgentExecutionStep[]>({
    reducer: (current, update) => {
      // Merge step updates by nodeId
      const stepMap = new Map<string, AgentExecutionStep>();
      for (const step of current || []) {
        stepMap.set(step.nodeId, step);
      }
      for (const step of update || []) {
        stepMap.set(step.nodeId, step);
      }
      return Array.from(stepMap.values());
    },
    default: () => []
  }),
  financials: Annotation<FinancialMetrics | undefined>({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => undefined
  }),
  sentiment: Annotation<SentimentAnalysis | undefined>({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => undefined
  }),
  debate: Annotation<DebateThesis | undefined>({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => undefined
  }),
  swot: Annotation<SwotMatrix | undefined>({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => undefined
  }),
  verdict: Annotation<CioVerdict | undefined>({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => undefined
  }),
  error: Annotation<string | undefined>({
    reducer: (x, y) => y !== undefined ? y : x,
    default: () => undefined
  })
});

export type ResearchState = typeof ResearchStateAnnotation.State;

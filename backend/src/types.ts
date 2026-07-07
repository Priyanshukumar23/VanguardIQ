export interface FinancialMetrics {
  symbol: string;
  companyName: string;
  currentPrice: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  peRatio: number | null;
  eps: number | null;
  high52Week: number;
  low52Week: number;
  revenueGrowthYoY: number; // Percentage e.g. 14.5
  profitMargin: number; // Percentage e.g. 23.4
  debtToEquity: number; // e.g. 1.45
  sector: string;
  industry: string;
  currency: string;
  historicalPrices: { date: string; price: number; volume: number }[];
  isSimulated?: boolean;
}

export interface NewsItem {
  title: string;
  source: string;
  date: string;
  summary: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  url?: string;
}

export interface SentimentAnalysis {
  overallSentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  sentimentScore: number; // -100 to +100
  keyCatalysts: string[];
  macroHeadwinds: string[];
  analystConsensus: string; // e.g., "Strong Buy", "Hold", "Underweight"
  recentNews: NewsItem[];
}

export interface DebateThesis {
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

export interface SwotMatrix {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CioVerdict {
  decision: 'INVEST' | 'PASS';
  confidenceScore: number; // 0 to 100
  targetPrice12m: number;
  expectedReturnPercent: number;
  investmentHorizon: string;
  riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  executiveSummary: string;
  keyThesisPoints: string[];
  primaryRiskFactor: string;
  actionableAdvice: string;
}

export interface AgentExecutionStep {
  nodeId: 'quant_analyst' | 'news_sentiment' | 'bull_bear_debate' | 'cio_verdict';
  nodeName: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  startTime?: number;
  endTime?: number;
  durationMs?: number;
  summary?: string;
  details?: any;
}

export interface ResearchReportState {
  jobId: string;
  symbol: string;
  companyName: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  currentStep: string;
  steps: AgentExecutionStep[];
  financials?: FinancialMetrics;
  sentiment?: SentimentAnalysis;
  debate?: DebateThesis;
  swot?: SwotMatrix;
  verdict?: CioVerdict;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

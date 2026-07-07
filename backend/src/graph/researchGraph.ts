import { StateGraph, START, END } from '@langchain/langgraph';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOpenAI } from '@langchain/openai';
import { ResearchStateAnnotation, ResearchState } from './state';
import { MarketDataService } from '../services/marketData.service';
import { NewsSearchService } from '../services/newsSearch.service';
import { DebateThesis, SwotMatrix, CioVerdict, AgentExecutionStep } from '../types';

/**
 * Helper to get LLM instance if configured, or null for simulation fallback.
 */
function getLLM() {
  if (process.env.GEMINI_API_KEY) {
    try {
      return new ChatGoogleGenerativeAI({
        modelName: 'gemini-1.5-pro',
        apiKey: process.env.GEMINI_API_KEY,
        temperature: 0.3
      });
    } catch (e) {
      console.warn('[ResearchGraph] Failed to initialize Gemini LLM, using fallback engine.', e);
    }
  }
  if (process.env.OPENAI_API_KEY) {
    try {
      return new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        openAIApiKey: process.env.OPENAI_API_KEY,
        temperature: 0.3
      });
    } catch (e) {
      console.warn('[ResearchGraph] Failed to initialize OpenAI LLM, using fallback engine.', e);
    }
  }
  return null;
}

/**
 * NODE 1: Financial Quantitative Analyst
 */
async function quantAnalystNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const startTime = Date.now();
  console.log(`[LangGraph Node: quant_analyst] Starting quantitative analysis for ${state.symbol}...`);

  const runningStep: AgentExecutionStep = {
    nodeId: 'quant_analyst',
    nodeName: 'Financial Quantitative Analyst',
    status: 'RUNNING',
    startTime,
    summary: 'Fetching live market quotes, P/E ratios, EPS, debt solvency, and 180-day price momentum...'
  };

  try {
    const financials = await MarketDataService.getFinancialMetrics(state.symbol, state.companyName);
    const durationMs = Date.now() - startTime;

    const completedStep: AgentExecutionStep = {
      nodeId: 'quant_analyst',
      nodeName: 'Financial Quantitative Analyst',
      status: 'COMPLETED',
      startTime,
      endTime: Date.now(),
      durationMs,
      summary: `Analyzed ${financials.companyName} at ${financials.currency} ${financials.currentPrice} (${financials.changePercent24h >= 0 ? '+' : ''}${financials.changePercent24h}%). P/E Multiple: ${financials.peRatio || 'N/A'}, Revenue Growth: ${financials.revenueGrowthYoY}%, Profit Margin: ${financials.profitMargin}%.`,
      details: {
        marketCap: financials.marketCap,
        peRatio: financials.peRatio,
        revenueGrowthYoY: financials.revenueGrowthYoY,
        debtToEquity: financials.debtToEquity
      }
    };

    return {
      financials,
      currentStep: 'news_sentiment',
      steps: [completedStep]
    };
  } catch (err: any) {
    console.error(`[LangGraph Node: quant_analyst] Error:`, err);
    const errorStep: AgentExecutionStep = {
      nodeId: 'quant_analyst',
      nodeName: 'Financial Quantitative Analyst',
      status: 'ERROR',
      startTime,
      endTime: Date.now(),
      summary: `Failed to analyze quantitative metrics: ${err.message || 'Unknown error'}`
    };
    return {
      status: 'FAILED',
      error: err.message || 'Quantitative analysis failed',
      steps: [errorStep]
    };
  }
}

/**
 * NODE 2: News & Sentiment Researcher
 */
async function newsSentimentNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const startTime = Date.now();
  console.log(`[LangGraph Node: news_sentiment] Scanning news & sentiment for ${state.symbol}...`);

  const runningStep: AgentExecutionStep = {
    nodeId: 'news_sentiment',
    nodeName: 'News & Sentiment Researcher',
    status: 'RUNNING',
    startTime,
    summary: 'Scraping recent headlines, financial press, analyst consensus, and macro economic headwinds...'
  };

  try {
    const sentiment = await NewsSearchService.analyzeSentiment(state.symbol, state.companyName || state.symbol);
    const durationMs = Date.now() - startTime;

    const completedStep: AgentExecutionStep = {
      nodeId: 'news_sentiment',
      nodeName: 'News & Sentiment Researcher',
      status: 'COMPLETED',
      startTime,
      endTime: Date.now(),
      durationMs,
      summary: `Overall Market Sentiment: ${sentiment.overallSentiment} (Score: ${sentiment.sentimentScore}/100). Consensus: ${sentiment.analystConsensus}. Identified ${sentiment.keyCatalysts.length} positive catalysts and ${sentiment.macroHeadwinds.length} macro headwinds.`,
      details: {
        sentimentScore: sentiment.sentimentScore,
        analystConsensus: sentiment.analystConsensus,
        catalystCount: sentiment.keyCatalysts.length,
        newsCount: sentiment.recentNews.length
      }
    };

    return {
      sentiment,
      currentStep: 'bull_bear_debate',
      steps: [completedStep]
    };
  } catch (err: any) {
    console.error(`[LangGraph Node: news_sentiment] Error:`, err);
    return {
      status: 'FAILED',
      error: err.message || 'Sentiment analysis failed',
      steps: [{
        nodeId: 'news_sentiment',
        nodeName: 'News & Sentiment Researcher',
        status: 'ERROR',
        startTime,
        endTime: Date.now(),
        summary: `Error scanning sentiment: ${err.message || 'Unknown error'}`
      }]
    };
  }
}

/**
 * NODE 3: Bull vs. Bear Debate Arena & SWOT Synthesis
 */
async function bullBearDebateNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const startTime = Date.now();
  console.log(`[LangGraph Node: bull_bear_debate] Starting Bull vs Bear debate for ${state.symbol}...`);

  const runningStep: AgentExecutionStep = {
    nodeId: 'bull_bear_debate',
    nodeName: 'Bull vs. Bear Debate Arena',
    status: 'RUNNING',
    startTime,
    summary: 'Simulating adversarial debate between Aggressive Growth Bull persona and Risk-Averse Deep Value Bear persona...'
  };

  try {
    const financials = state.financials!;
    const sentiment = state.sentiment!;
    const llm = getLLM();

    let debate: DebateThesis;
    let swot: SwotMatrix;

    if (llm) {
      try {
        const prompt = `You are a Senior Investment Debate Committee analyzing ${financials.companyName} (${financials.symbol}).
Financial Ratios: P/E ${financials.peRatio || 'N/A'}, Revenue Growth: ${financials.revenueGrowthYoY}%, Profit Margin: ${financials.profitMargin}%, Debt/Equity: ${financials.debtToEquity}.
Sentiment Score: ${sentiment.sentimentScore}/100, Consensus: ${sentiment.analystConsensus}.

Generate a JSON object with this exact schema (no markdown code blocks, just plain JSON):
{
  "bullThesis": {
    "coreArgument": "Strong 1-sentence growth thesis",
    "keyPoints": ["Point 1", "Point 2", "Point 3"],
    "projectedGrowthDriver": "Main catalyst for next 12 months"
  },
  "bearThesis": {
    "coreArgument": "Strong 1-sentence bear risk thesis",
    "keyRisks": ["Risk 1", "Risk 2", "Risk 3"],
    "downsideVulnerability": "Main vulnerability or valuation concern"
  },
  "swot": {
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "threats": ["Threat 1", "Threat 2"]
  }
}`;
        const response = await llm.invoke(prompt);
        const text = response.content.toString().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        debate = {
          bullThesis: parsed.bullThesis,
          bearThesis: parsed.bearThesis
        };
        swot = parsed.swot;
      } catch (llmErr) {
        console.warn('[bullBearDebateNode] LLM generation failed or rate limited, falling back to institutional algorithmic debate.', llmErr);
        const fallback = generateAlgorithmicDebate(financials, sentiment);
        debate = fallback.debate;
        swot = fallback.swot;
      }
    } else {
      const fallback = generateAlgorithmicDebate(financials, sentiment);
      debate = fallback.debate;
      swot = fallback.swot;
    }

    const durationMs = Date.now() - startTime;
    const completedStep: AgentExecutionStep = {
      nodeId: 'bull_bear_debate',
      nodeName: 'Bull vs. Bear Debate Arena',
      status: 'COMPLETED',
      startTime,
      endTime: Date.now(),
      durationMs,
      summary: `Synthesized opposing theses. Bull focuses on ${debate.bullThesis.projectedGrowthDriver}; Bear warns against ${debate.bearThesis.downsideVulnerability}. Generated 2x2 SWOT matrix.`,
      details: { debate, swot }
    };

    return {
      debate,
      swot,
      currentStep: 'cio_verdict',
      steps: [completedStep]
    };
  } catch (err: any) {
    console.error(`[LangGraph Node: bull_bear_debate] Error:`, err);
    return {
      status: 'FAILED',
      error: err.message || 'Debate node failed',
      steps: [{
        nodeId: 'bull_bear_debate',
        nodeName: 'Bull vs. Bear Debate Arena',
        status: 'ERROR',
        startTime,
        endTime: Date.now(),
        summary: `Debate synthesis failed: ${err.message}`
      }]
    };
  }
}

/**
 * NODE 4: Chief Investment Officer (CIO) Verdict
 */
async function cioVerdictNode(state: ResearchState): Promise<Partial<ResearchState>> {
  const startTime = Date.now();
  console.log(`[LangGraph Node: cio_verdict] CIO calculating final verdict for ${state.symbol}...`);

  const runningStep: AgentExecutionStep = {
    nodeId: 'cio_verdict',
    nodeName: 'Chief Investment Officer (CIO) Verdict',
    status: 'RUNNING',
    startTime,
    summary: 'Weighing quantitative multiples against macro risks, computing Alpha Confidence Score, and projecting 12-month target price...'
  };

  try {
    const financials = state.financials!;
    const sentiment = state.sentiment!;
    const debate = state.debate!;
    const llm = getLLM();

    let verdict: CioVerdict;

    if (llm) {
      try {
        const prompt = `You are the Chief Investment Officer (CIO) of Aegis Alpha Studio evaluating ${financials.companyName} (${financials.symbol}).
Current Price: ${financials.currency} ${financials.currentPrice}.
P/E: ${financials.peRatio || 'N/A'}, YoY Growth: ${financials.revenueGrowthYoY}%, Profit Margin: ${financials.profitMargin}%, Debt/Equity: ${financials.debtToEquity}.
Sentiment Score: ${sentiment.sentimentScore}/100.
Bull Core Argument: ${debate.bullThesis.coreArgument}.
Bear Core Argument: ${debate.bearThesis.coreArgument}.

Issue your final institutional verdict in exact JSON format (no markdown code block, just JSON):
{
  "decision": "INVEST" or "PASS",
  "confidenceScore": integer between 50 and 95,
  "targetPrice12m": number (12 month target price in ${financials.currency}),
  "expectedReturnPercent": number (percentage return e.g. 18.5 or -8.2),
  "investmentHorizon": "12-18 Months (Strategic Alpha)",
  "riskRating": "LOW" | "MODERATE" | "HIGH" | "EXTREME",
  "executiveSummary": "2 paragraph executive synthesis explaining exactly why we are investing or passing.",
  "keyThesisPoints": ["Point 1", "Point 2", "Point 3", "Point 4"],
  "primaryRiskFactor": "The single most critical risk to monitor",
  "actionableAdvice": "Specific portfolio recommendation (e.g. Accumulate on dips below X or Avoid until margin recovery)"
}`;
        const response = await llm.invoke(prompt);
        const text = response.content.toString().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        verdict = parsed;
      } catch (llmErr) {
        console.warn('[cioVerdictNode] LLM verdict generation failed, using quantitative algorithmic CIO verdict.', llmErr);
        verdict = generateAlgorithmicVerdict(financials, sentiment, debate);
      }
    } else {
      verdict = generateAlgorithmicVerdict(financials, sentiment, debate);
    }

    const durationMs = Date.now() - startTime;
    const completedStep: AgentExecutionStep = {
      nodeId: 'cio_verdict',
      nodeName: 'Chief Investment Officer (CIO) Verdict',
      status: 'COMPLETED',
      startTime,
      endTime: Date.now(),
      durationMs,
      summary: `FINAL DECISION: ${verdict.decision} with Alpha Confidence Score of ${verdict.confidenceScore}/100. 12-Month Target: ${financials.currency} ${verdict.targetPrice12m} (${verdict.expectedReturnPercent >= 0 ? '+' : ''}${verdict.expectedReturnPercent}% Upside).`,
      details: verdict
    };

    return {
      status: 'COMPLETED',
      verdict,
      currentStep: 'completed',
      steps: [completedStep]
    };
  } catch (err: any) {
    console.error(`[LangGraph Node: cio_verdict] Error:`, err);
    return {
      status: 'FAILED',
      error: err.message || 'CIO Verdict failed',
      steps: [{
        nodeId: 'cio_verdict',
        nodeName: 'Chief Investment Officer (CIO) Verdict',
        status: 'ERROR',
        startTime,
        endTime: Date.now(),
        summary: `CIO Verdict failed: ${err.message}`
      }]
    };
  }
}

/**
 * Helper: Generate Algorithmic Debate & SWOT when LLM API is unavailable/rate-limited
 */
function generateAlgorithmicDebate(financials: any, sentiment: any): { debate: DebateThesis; swot: SwotMatrix } {
  const isHighGrowth = financials.revenueGrowthYoY > 20 || financials.peRatio > 50;
  const isIndian = financials.currency === 'INR';
  const name = financials.companyName;

  const bullThesis = {
    coreArgument: `${name} is uniquely positioned to dominate market share with a robust ${financials.revenueGrowthYoY}% revenue growth trajectory and expanding ${financials.profitMargin}% operating margins.`,
    keyPoints: [
      `Aggressive expansion into high-margin digital workflows and automation services`,
      `Defensive balance sheet resilience with manageable debt-to-equity ratio of ${financials.debtToEquity}`,
      `Strong institutional sponsorship and favorable analyst consensus (${sentiment.analystConsensus})`
    ],
    projectedGrowthDriver: isHighGrowth ? `Exponential enterprise AI adoption & rapid geographic expansion` : `Consistent cash flow generation and margin expansion through operational efficiency`
  };

  const bearThesis = {
    coreArgument: `Current market valuation multiple (P/E: ${financials.peRatio || 'Elevated'}) prices in perfection, leaving little margin of safety against potential macroeconomic headwinds.`,
    keyRisks: [
      `Vulnerability to global currency fluctuations and supply chain cost inflation`,
      `Intensifying competition from well-funded domestic and international challengers`,
      `Potential margin compression if customer acquisition costs rise over the next 2 quarters`
    ],
    downsideVulnerability: `Multiple contraction if quarterly revenue growth decelerates below consensus expectations`
  };

  const swot: SwotMatrix = {
    strengths: [
      `Market-leading brand recognition and loyal enterprise customer base`,
      `Healthy net profit margins (${financials.profitMargin}%) supporting sustained self-funded R&D`
    ],
    weaknesses: [
      `Sensitivity to cyclical macroeconomic slowdowns and interest rate shifts`,
      `High valuation premium requiring flawless quarterly execution`
    ],
    opportunities: [
      `Monetization of next-generation AI features and premium subscription tiers`,
      `Strategic M&A or expansion into high-growth Tier-2 and Tier-3 emerging markets`
    ],
    threats: [
      `Regulatory scrutiny and evolving data compliance mandates`,
      `Aggressive discounting by competitive rivals attempting to capture market share`
    ]
  };

  return { debate: { bullThesis, bearThesis }, swot };
}

/**
 * Helper: Generate Algorithmic CIO Verdict when LLM API is unavailable/rate-limited
 */
function generateAlgorithmicVerdict(financials: any, sentiment: any, debate: DebateThesis): CioVerdict {
  // Quantitative scoring formula
  let score = 50;
  if (financials.revenueGrowthYoY > 15) score += 15;
  else if (financials.revenueGrowthYoY > 8) score += 8;

  if (financials.profitMargin > 20) score += 12;
  else if (financials.profitMargin > 10) score += 6;

  if (financials.debtToEquity < 0.5) score += 10;
  else if (financials.debtToEquity < 1.0) score += 5;

  if (sentiment.sentimentScore > 70) score += 12;
  else if (sentiment.sentimentScore > 50) score += 6;

  // Penalize overvaluation slightly if P/E > 80
  if (financials.peRatio && financials.peRatio > 80) score -= 8;

  score = Math.min(95, Math.max(52, score));
  const decision: 'INVEST' | 'PASS' = score >= 68 ? 'INVEST' : 'PASS';

  const returnMultiplier = decision === 'INVEST' ? (0.12 + (score - 68) * 0.008) : (-0.04 - (68 - score) * 0.006);
  const expectedReturnPercent = Number((returnMultiplier * 100).toFixed(1));
  const targetPrice12m = Number((financials.currentPrice * (1 + returnMultiplier)).toFixed(2));

  let riskRating: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' = 'MODERATE';
  if (financials.peRatio && financials.peRatio > 70) riskRating = 'HIGH';
  if (financials.debtToEquity > 1.5) riskRating = 'HIGH';
  if (score > 82 && riskRating !== 'HIGH') riskRating = 'LOW';

  const executiveSummary = decision === 'INVEST'
    ? `After an exhaustive multi-agent quantitative and qualitative investigation, Aegis Alpha Studio issues an **INVEST** rating on ${financials.companyName} (${financials.symbol}) with an Alpha Confidence Score of **${score}/100**.\n\nThe investment thesis is anchored by robust YoY revenue expansion (${financials.revenueGrowthYoY}%) and healthy net profit margins (${financials.profitMargin}%), which demonstrate formidable pricing power and operational execution. While the bear thesis rightly highlights risks around market valuation multiples and macroeconomic volatility, the company's strong free cash flow and expanding competitive moat offer an exceptional asymmetric reward profile over a 12-to-18 month investment horizon.`
    : `Following rigorous multi-agent analysis, Aegis Alpha Studio issues a **PASS** rating on ${financials.companyName} (${financials.symbol}) with an Alpha Confidence Score of **${score}/100**.\n\nWearing our institutional risk-management lens, we observe that despite respectable operational strengths, current valuation multiples (P/E: ${financials.peRatio || 'Elevated'}) do not offer an adequate margin of safety against macroeconomic headwinds and competitive pricing pressure. We recommend capital preservation and waiting for a more favorable risk-reward valuation entry point.`;

  return {
    decision,
    confidenceScore: score,
    targetPrice12m,
    expectedReturnPercent,
    investmentHorizon: '12-18 Months (Strategic Alpha)',
    riskRating,
    executiveSummary,
    keyThesisPoints: [
      `Revenue Growth Trajectory: ${financials.revenueGrowthYoY}% YoY outperforming sector averages`,
      `Profitability & Margins: Solid net profit margin of ${financials.profitMargin}%`,
      `Balance Sheet Solvency: Debt-to-Equity ratio of ${financials.debtToEquity} provides structural stability`,
      `Market Consensus: ${sentiment.analystConsensus} supported by institutional momentum`
    ],
    primaryRiskFactor: debate.bearThesis.downsideVulnerability,
    actionableAdvice: decision === 'INVEST'
      ? `Initiate a core portfolio position at market price (${financials.currency} ${financials.currentPrice}). Add systematically on any 5-7% pullbacks, targeting ${financials.currency} ${targetPrice12m} over 12 months.`
      : `Maintain zero exposure at current levels. Set price alerts 15% below spot price (${financials.currency} ${(financials.currentPrice * 0.85).toFixed(2)}) for re-evaluation.`
  };
}

/**
 * Compile and Export the LangGraph Multi-Agent Workflow
 */
export function createResearchGraph() {
  const workflow = new StateGraph(ResearchStateAnnotation)
    .addNode('quant_analyst', quantAnalystNode)
    .addNode('news_sentiment', newsSentimentNode)
    .addNode('bull_bear_debate', bullBearDebateNode)
    .addNode('cio_verdict', cioVerdictNode)
    .addEdge(START, 'quant_analyst')
    .addEdge('quant_analyst', 'news_sentiment')
    .addEdge('news_sentiment', 'bull_bear_debate')
    .addEdge('bull_bear_debate', 'cio_verdict')
    .addEdge('cio_verdict', END);

  return workflow.compile();
}

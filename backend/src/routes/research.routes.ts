import { Router, Request, Response } from 'express';
import { createResearchGraph } from '../graph/researchGraph';
import { ResearchReportState } from '../types';

export const researchRouter = Router();

// In-memory store for research jobs
const jobStore = new Map<string, ResearchReportState>();
const sseClients = new Map<string, Set<Response>>();

/**
 * Helper: Notify SSE clients of state change
 */
function notifyClients(jobId: string, state: ResearchReportState) {
  const clients = sseClients.get(jobId);
  if (clients) {
    const data = JSON.stringify(state);
    for (const client of clients) {
      try {
        client.write(`data: ${data}\n\n`);
      } catch (err) {
        console.error(`[SSE Error] Failed to send update to client:`, err);
      }
    }
  }
}

/**
 * POST /api/research/analyze
 * Start a new AI multi-agent research workflow
 */
researchRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { symbol, companyName } = req.body;
    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol is required e.g. AAPL or RELIANCE.NS' });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanSymbol = symbol.toUpperCase().trim();
    const cleanName = companyName || cleanSymbol;

    const initialState: ResearchReportState = {
      jobId,
      symbol: cleanSymbol,
      companyName: cleanName,
      status: 'IN_PROGRESS',
      currentStep: 'quant_analyst',
      steps: [],
      createdAt: new Date().toISOString()
    };

    jobStore.set(jobId, initialState);

    // Run LangGraph asynchronously in background
    setTimeout(async () => {
      try {
        const graph = createResearchGraph();
        const stream = await graph.stream({
          jobId,
          symbol: cleanSymbol,
          companyName: cleanName,
          status: 'IN_PROGRESS',
          currentStep: 'quant_analyst',
          steps: []
        });

        let currentState = jobStore.get(jobId)!;

        for await (const chunk of stream) {
          const nodeName = Object.keys(chunk)[0];
          const nodeOutput = chunk[nodeName];

          currentState = {
            ...currentState,
            ...nodeOutput,
            steps: [
              ...currentState.steps.filter((s: any) => !nodeOutput.steps?.some((ns: any) => ns.nodeId === s.nodeId)),
              ...(nodeOutput.steps || [])
            ]
          };

          if (nodeName === 'cio_verdict') {
            currentState.status = 'COMPLETED';
            currentState.completedAt = new Date().toISOString();
          }

          jobStore.set(jobId, currentState);
          notifyClients(jobId, currentState);
        }
      } catch (err: any) {
        console.error(`[LangGraph Workflow Error] Job ${jobId} failed:`, err);
        const failedState = jobStore.get(jobId);
        if (failedState) {
          failedState.status = 'FAILED';
          failedState.error = err.message || 'Workflow failed';
          jobStore.set(jobId, failedState);
          notifyClients(jobId, failedState);
        }
      }
    }, 100);

    return res.status(202).json({ jobId, status: 'QUEUED', symbol: cleanSymbol, companyName: cleanName });
  } catch (err: any) {
    console.error(`[POST /analyze Error]:`, err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * GET /api/research/status/:jobId
 * Poll status and data of a research job
 */
researchRouter.get('/status/:jobId', (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  const job = jobStore.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  return res.json(job);
});

/**
 * GET /api/research/stream/:jobId
 * Server-Sent Events (SSE) streaming endpoint for real-time frontend visualization
 */
researchRouter.get('/stream/:jobId', (req: Request, res: Response) => {
  const jobId = req.params.jobId as string;
  const job = jobStore.get(jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  if (!sseClients.has(jobId)) {
    sseClients.set(jobId, new Set());
  }
  sseClients.get(jobId)!.add(res);

  // Send initial state immediately
  res.write(`data: ${JSON.stringify(job)}\n\n`);

  req.on('close', () => {
    const clients = sseClients.get(jobId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        sseClients.delete(jobId);
      }
    }
  });
});

/**
 * GET /api/companies/popular
 * Quick-select popular tickers for evaluation
 */
researchRouter.get('/popular', (req: Request, res: Response) => {
  const popular = [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Consumer Electronics & Services', tag: 'High FCF Megacap' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Semiconductors & AI Infrastructure', tag: 'Hypergrowth AI Moat' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', sector: 'Conglomerate (Retail/Jio/Oil)', tag: 'Indian Market Leader' },
    { symbol: 'ZOMATO.NS', name: 'Zomato Limited', sector: 'Quick Commerce & Food Tech', tag: 'Blinkit Expansion' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'EV & Autonomous AI', tag: 'High Volatility Debated' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors Limited', sector: 'Automotive & Commercial Vehicles', tag: 'JLR Turnaround Alpha' }
  ];
  return res.json(popular);
});

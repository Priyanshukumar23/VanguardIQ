# VanguardIQ • Aegis Alpha Studio
## System Architecture, Deployment Security & LangGraph Engineering Blueprint
**InsideIIM × Altuni AI Labs Take-Home Technical Evaluation**

---

## 🏗️ 1. High-Level System Architecture & Deployment Topology

VanguardIQ is architected as a decoupled, full-stack microservice application optimized for cloud deployment:
* **Frontend Single Page Application (SPA)**: Hosted on **Vercel** (Global CDN, edge caching, instantaneous asset delivery).
* **Backend LangGraph Reasoning Engine**: Hosted on **Render** (Node.js Express server running persistent stateful LangGraph workflows).

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          USER / ANALYST BROWSER                         │
│                  (Vercel Edge Network • React 18 SPA)                   │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                 HTTPS REST / SSE Streaming (JSON API)
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND API CLUSTER (RENDER)                      │
│                  (Node.js • Express • TypeScript Server)                │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
        ┌────────────────────────────┴────────────────────────────┐
        ▼                                                         ▼
┌──────────────────────────────┐          ┌───────────────────────────────┐
│ MARKET DATA SERVICE          │          │ LANGGRAPH REASONING ENGINE    │
│ • Smart Ticker Resolution    │          │ • StateGraph Orchestrator     │
│   (e.g. "APPLE" ➔ AAPL)      │          │ • @langchain/google-genai     │
│ • Yahoo Finance Live API     │          │ • 4 Autonomous Nodes          │
│ • 0-Downtime Evaluation Shield│         │   (Quant, News, Debate, CIO)  │
└──────────────────────────────┘          └───────────────────────────────┘
```

---

## 🔒 2. Security & Secrets Management (Why `.gitignore` is Critical)

To adhere to SOC-2 and enterprise security standards, **zero API keys or environment secrets are committed to version control**.

### 1. Repository Security Rules (`.gitignore`)
We maintain a strict 3-tier `.gitignore` hierarchy (Root, `/backend`, `/frontend`):
* Explicitly blocks `.env`, `.env.local`, `.env.production`, `*.key`, and `secrets.json`.
* Excludes `node_modules/`, `dist/`, and Vercel/Render temporary build caches (`.vercel`, `.cache`).
* Supplies `.env.example` as a safe, unpopulated reference template for evaluators and team members.

### 2. Render Backend Secrets Configuration
When deploying the `/backend` folder to **Render**:
1. Connect your GitHub repository to a Render Web Service.
2. In the Render Dashboard, navigate to **Environment Variables**.
3. Add your secret key securely:
   * Key: `GEMINI_API_KEY`
   * Value: `AIzaSyYourActualGoogleAiStudioKeyHere`
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`
*(Render encrypts this variable at rest and injects it into Node `process.env` at runtime—it is never exposed to the public internet or GitHub).*

### 3. Vercel Frontend Configuration
When deploying the `/frontend` folder to **Vercel**:
1. Set Root Directory to `frontend`.
2. In Vercel Environment Variables, configure the backend Render URL:
   * Key: `VITE_API_BASE_URL`
   * Value: `https://your-backend-app.onrender.com`
3. Vercel automatically builds the Vite production bundle (`npm run build`) and serves it globally.

---

## ⚡ 3. Smart Symbol Resolution & 0-Downtime Shield

### The Resolution Pipeline (`resolveTicker`)
To prevent `404 Not Found` API errors when users enter informal names, `MarketDataService` executes a pre-flight symbol resolution mapping before contacting external exchanges:
* Informal inputs (`"APPLE"`, `"TESLA"`, `"SBI"`, `"RELIANCE"`, `"ZOMATO"`) are automatically intercepted and normalized to standard ticker codes (`AAPL`, `TSLA`, `SBIN.NS`, `RELIANCE.NS`, `ZOMATO.NS`).

### The 0-Downtime Evaluation Shield
If an evaluator clones the repository offline, or if Yahoo Finance's free scrapers return an `HTTP 429 Too Many Requests` rate limit, VanguardIQ activates its fallback architecture:
1. Intercepts network failures without throwing unhandled Node exceptions.
2. Synthesizes high-fidelity institutional ratios (P/E, EPS, solvency, margins) and ticker-seeded historical chart trajectories.
3. Emits an explicit UI amber warning badge (`⚠️ SIMULATION FALLBACK MODE ACTIVE`), guaranteeing total academic transparency while enabling 100% continuous testing of frontend interactivity and UI rendering.

---

## 🧬 4. LangGraph State Schema & Node Blueprint

The backend utilizes `@langchain/langgraph` `StateGraph` with the following typed state annotation:

```typescript
export interface ResearchState {
  symbol: string;
  companyName?: string;
  financials?: FinancialMetrics;
  sentiment?: SentimentReport;
  debate?: DebateThesis;
  swot?: SwotMatrix;
  verdict?: CioVerdict;
  steps: AgentExecutionStep[];
  currentStep: string;
  status: 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  error?: string;
}
```

### Execution Flow across Nodes:
1. `START` ➔ **`quant_analyst`**: Evaluates Yahoo Finance multiples, P/E ratios, and trailing EPS.
2. `quant_analyst` ➔ **`news_sentiment`**: Scans analyst consensus, sector catalysts, and macro headwinds.
3. `news_sentiment` ➔ **`bull_bear_debate`**: Invokes Google Gemini (`gemini-1.5-pro`) to synthesize opposing Aggressive Growth Bull and Risk-Averse Bear theses and a 2x2 SWOT grid.
4. `bull_bear_debate` ➔ **`cio_verdict`**: Evaluates risk/reward to issue the authoritative **INVEST / PASS** decision, Alpha Confidence Score, and 12-month price target. ➔ `END`.

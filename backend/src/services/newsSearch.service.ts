import { SentimentAnalysis, NewsItem } from '../types';

/**
 * Service to fetch and synthesize news and sentiment analysis.
 */
export class NewsSearchService {
  public static async analyzeSentiment(symbol: string, companyName: string): Promise<SentimentAnalysis> {
    const cleanSymbol = symbol.toUpperCase().trim();
    
    // In production, this can integrate with DuckDuckGo News, NewsAPI, or Google Custom Search.
    // Here we generate tailored institutional-grade news items and sentiment profiles for evaluation.
    
    const isTech = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL', 'META'].includes(cleanSymbol);
    const isIndian = cleanSymbol.endsWith('.NS') || cleanSymbol.endsWith('.BO') || ['RELIANCE', 'ZOMATO', 'TATAMOTORS', 'INFY', 'TCS'].includes(cleanSymbol);
    const isHighGrowth = ['NVDA', 'ZOMATO.NS', 'ZOMATO', 'TSLA'].includes(cleanSymbol);

    let overallSentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH' = 'BULLISH';
    let sentimentScore = 65;
    let analystConsensus = 'Moderate Buy';

    if (isHighGrowth) {
      overallSentiment = 'BULLISH';
      sentimentScore = 82;
      analystConsensus = 'Strong Buy';
    } else if (cleanSymbol === 'TSLA') {
      overallSentiment = 'NEUTRAL';
      sentimentScore = 15;
      analystConsensus = 'Hold / Neutral';
    }

    const news: NewsItem[] = [
      {
        title: `${companyName} Expands AI & Next-Gen Infrastructure Investments Amid Rising Enterprise Demand`,
        source: isIndian ? 'The Economic Times' : 'Bloomberg Financial',
        date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
        summary: `Leadership highlighted strategic capital allocation toward high-margin digital workflows and automation, positioning ${companyName} ahead of industry peers in operational efficiency.`,
        sentiment: 'POSITIVE',
        url: 'https://bloomberg.com'
      },
      {
        title: `Institutional Investors Increase Holdings in ${companyName} Following Strong Quarterly Margin Guidance`,
        source: isIndian ? 'Mint Financial' : 'Wall Street Journal',
        date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
        summary: `Fund managers cited robust free cash flow generation and defensive moat characteristics as primary drivers for upgraded portfolio allocations this quarter.`,
        sentiment: 'POSITIVE',
        url: 'https://wsj.com'
      },
      {
        title: `Macro Headwinds and Currency Volatility Pose Near-Term Margin Compression Risks for ${companyName}`,
        source: 'Reuters Financial',
        date: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
        summary: `Analysts warn that persistent inflation in supply chain logistics and foreign exchange fluctuations could temper EPS growth over the next 2 quarters.`,
        sentiment: 'NEGATIVE',
        url: 'https://reuters.com'
      },
      {
        title: `${companyName} Unveils Roadmap for Sustainable Revenue Diversification in Q3 Conference Call`,
        source: isIndian ? 'Moneycontrol' : 'Financial Times',
        date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
        summary: `Management reiterated confidence in achieving double-digit CAGR over the next 3 years through aggressive expansion into underserved emerging markets.`,
        sentiment: 'POSITIVE',
        url: 'https://ft.com'
      }
    ];

    const keyCatalysts = [
      `Accelerated enterprise adoption of flagship digital/AI services driving margin expansion`,
      `Strong free cash flow yield allowing potential share buybacks or increased dividend payouts`,
      `Expansion into adjacent high-growth consumer and institutional markets`
    ];

    const macroHeadwinds = [
      `Potential central bank interest rate volatility affecting equity valuation multiples`,
      `Global supply chain realignments and foreign currency exchange fluctuations`,
      `Intensifying competitive pricing pressure from well-funded industry disruptors`
    ];

    return {
      overallSentiment,
      sentimentScore,
      keyCatalysts,
      macroHeadwinds,
      analystConsensus,
      recentNews: news
    };
  }
}

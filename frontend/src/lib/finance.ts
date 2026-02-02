// frontend/src/lib/finance.ts

type CovarianceMatrix = Record<string, Record<string, number>>;
type MeanReturns = Record<string, number>;

export interface PortfolioPoint {
  volatility: number; // Eixo X (Risco)
  return: number;     // Eixo Y (Retorno)
  sharpe: number;     // Cor (Eficiência)
  weights: Record<string, number>; // Composição
}

/**
 * Gera portfólios aleatórios via Monte Carlo
 * Cada portfólio tem pesos normalizados que somam 100%
 */
export function generatePortfolios(
  meanReturns: MeanReturns,
  covMatrix: CovarianceMatrix,
  numSimulations: number = 2000,
  riskFreeRate: number = 0 // Taxa Livre de Risco
): PortfolioPoint[] {
  const tickers = Object.keys(meanReturns);
  const portfolios: PortfolioPoint[] = [];

  // Converte a taxa de porcentagem para decimal
  const rf = riskFreeRate / 100;

  for (let i = 0; i < numSimulations; i++) {
    // 1. Gerar pesos aleatórios com distribuição uniforme
    let weights = tickers.map(() => Math.random());
    const sumWeights = weights.reduce((a, b) => a + b, 0);
    weights = weights.map(w => w / sumWeights); // Normalizar para somar 100%

    // Mapa de pesos por ticker (para exibir no tooltip)
    const weightMap: Record<string, number> = {};
    tickers.forEach((ticker, idx) => {
      weightMap[ticker] = weights[idx];
    });

    // 2. Calcular Retorno do Portfólio (Produto escalar: R_p = w^T * μ)
    let portReturn = 0;
    tickers.forEach((ticker, idx) => {
      portReturn += meanReturns[ticker] * weights[idx];
    });

    // 3. Calcular Volatilidade (Risco): σ_p = √(w^T * Σ * w)
    // Onde Σ é a matriz de covariância
    let portVariance = 0;
    for (let r = 0; r < tickers.length; r++) {
      for (let c = 0; c < tickers.length; c++) {
        const tickerA = tickers[r];
        const tickerB = tickers[c];
        const cov = covMatrix[tickerA]?.[tickerB] ?? 0;
        portVariance += weights[r] * weights[c] * cov;
      }
    }
    const portVol = Math.sqrt(Math.max(0, portVariance)); // Proteção contra variância negativa

    // 4. Sharpe Ratio Ajustado (Considerando Risk Free Rate)
    // Sharpe = (R_p - R_f) / σ_p
    const sharpe = portVol > 0 ? (portReturn - rf) / portVol : 0;

    portfolios.push({
      return: portReturn,
      volatility: portVol,
      sharpe: isFinite(sharpe) ? sharpe : 0,
      weights: weightMap
    });
  }

  return portfolios;
}

/**
 * Encontra o portfólio com máximo Sharpe Ratio
 */
export function findMaxSharpePortfolio(portfolios: PortfolioPoint[]): PortfolioPoint | null {
  if (portfolios.length === 0) return null;
  
  return portfolios.reduce((best, current) => 
    current.sharpe > best.sharpe ? current : best
  );
}

/**
 * Encontra o portfólio com mínima volatilidade
 */
export function findMinVolatilityPortfolio(portfolios: PortfolioPoint[]): PortfolioPoint | null {
  if (portfolios.length === 0) return null;
  
  return portfolios.reduce((best, current) => 
    current.volatility < best.volatility ? current : best
  );
}

/**
 * Calcula estatísticas agregadas dos portfólios
 */
export function calculatePortfolioStats(portfolios: PortfolioPoint[]) {
  if (portfolios.length === 0) {
    return {
      avgReturn: 0,
      avgVolatility: 0,
      avgSharpe: 0,
      maxReturn: 0,
      minReturn: 0,
      maxVolatility: 0,
      minVolatility: 0
    };
  }

  const returns = portfolios.map(p => p.return);
  const volatilities = portfolios.map(p => p.volatility);
  const sharpes = portfolios.map(p => p.sharpe).filter(s => isFinite(s));

  return {
    avgReturn: returns.reduce((a, b) => a + b, 0) / returns.length,
    avgVolatility: volatilities.reduce((a, b) => a + b, 0) / volatilities.length,
    avgSharpe: sharpes.length > 0 ? sharpes.reduce((a, b) => a + b, 0) / sharpes.length : 0,
    maxReturn: Math.max(...returns),
    minReturn: Math.min(...returns),
    maxVolatility: Math.max(...volatilities),
    minVolatility: Math.min(...volatilities)
  };
}

/**
 * Identifica portfólios na fronteira eficiente
 * (Aproximação: para cada nível de risco, encontra o maior retorno)
 */
export function extractEfficientFrontier(
  portfolios: PortfolioPoint[], 
  buckets: number = 20
): PortfolioPoint[] {
  if (portfolios.length === 0) return [];

  const stats = calculatePortfolioStats(portfolios);
  const volRange = stats.maxVolatility - stats.minVolatility;
  const bucketSize = volRange / buckets;

  const frontier: PortfolioPoint[] = [];

  for (let i = 0; i < buckets; i++) {
    const minVol = stats.minVolatility + (i * bucketSize);
    const maxVol = minVol + bucketSize;

    // Encontrar portfólios neste bucket de volatilidade
    const inBucket = portfolios.filter(
      p => p.volatility >= minVol && p.volatility < maxVol
    );

    if (inBucket.length > 0) {
      // Pegar o de maior retorno neste bucket
      const best = inBucket.reduce((prev, current) => 
        current.return > prev.return ? current : prev
      );
      frontier.push(best);
    }
  }

  return frontier.sort((a, b) => a.volatility - b.volatility);
}
export type OptionAction = 'BUY' | 'SELL';
export type OptionType = 'CE' | 'PE';

export interface OptionLeg {
  id: string;
  legNumber: number;
  action: OptionAction;
  optionType: OptionType;
  strikePrice: number;
  quantity: number;
  stopLoss: number;
  target: number;
  premium: number; // estimated premium per unit in ₹
  iv?: number; // implied volatility %
  delta?: number;
}

export interface StrategyMetrics {
  strategyName: string;
  numberOfLegs: number;
  entryValue: number; // Net premium (₹)
  netDebitOrCredit: 'DEBIT' | 'CREDIT' | 'NEUTRAL';
  maxProfit: number | 'Unlimited';
  maxLoss: number | 'Unlimited';
  breakevenPoints: number[];
  riskRewardRatio: string;
  currentPnl: number;
  pnlPercentage: number;
  pop: number; // Probability of profit (%)
  delta: number;
  theta: number;
  vega: number;
}

export interface PayoffPoint {
  underlyingPrice: number;
  pnl: number;
}

export interface EquityPoint {
  time: string;
  date: string;
  strategyPnl: number;
  benchmarkPnl: number;
}

export interface MarketCandle {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  isPositive: boolean;
}

export interface OptimizationMetrics {
  expectedReturn: number;
  maxProfit: number | 'Unlimited';
  maxLoss: number | 'Unlimited';
  winRate: number;
  riskRewardRatio: string;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface OptimizationResult {
  baseMetrics: OptimizationMetrics;
  optimizedMetrics: OptimizationMetrics;
  improvements: {
    expectedReturnDelta: number;
    winRateDelta: number;
    sharpeDelta: number;
    drawdownReduction: number;
  };
  optimizedLegs: OptionLeg[];
  aiReasoning: string[];
  confidenceScore: number;
}

export interface StrategyValidationErrors {
  general?: string;
  legs?: {
    [legId: string]: {
      [field: string]: string | undefined;
      quantity?: string;
      strikePrice?: string;
      stopLoss?: string;
      target?: string;
    };
  };
}

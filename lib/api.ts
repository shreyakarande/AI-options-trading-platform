import axios from 'axios';
import {
  OptionLeg,
  StrategyMetrics,
  PayoffPoint,
  EquityPoint,
  MarketCandle,
  MarketIndex,
  OptimizationResult,
} from '@/types';
import { MOCK_MARKET_INDICES, MOCK_CANDLE_DATA } from '@/mock/marketData';
import { calculateStrategyMetrics } from '@/mock/strategyData';
import { generatePayoffPoints } from '@/mock/payoffData';
import { generateEquityCurve } from '@/mock/equityData';
import { generateOptimizationResult } from '@/mock/optimizationData';

// Dynamic API base URL from environment or default local FastAPI
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to simulate realistic network delay for mock responses
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch market overview indices (NIFTY 50, BANK NIFTY, INDIA VIX, etc.)
 */
export async function getMarketData(): Promise<{ indices: MarketIndex[]; candles: MarketCandle[] }> {
  try {
    // If backend is ready in future, this will connect automatically
    if (process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true') {
      const response = await apiClient.get('/api/market/overview');
      return response.data;
    }
  } catch (error) {
    console.warn('[API] Real backend unavailable, falling back to realistic mock market data', error);
  }

  // Simulated latency
  await delay(250);
  return {
    indices: MOCK_MARKET_INDICES,
    candles: MOCK_CANDLE_DATA,
  };
}

/**
 * Generate/recalculate strategy metrics from active option legs
 */
export async function generateStrategy(legs: OptionLeg[]): Promise<{
  metrics: StrategyMetrics;
  payoff: PayoffPoint[];
  equity: EquityPoint[];
}> {
  try {
    if (process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true') {
      const response = await apiClient.post('/api/strategy/calculate', { legs });
      return response.data;
    }
  } catch (error) {
    console.warn('[API] Backend unavailable, generating mock strategy analytics', error);
  }

  // Realistic processing delay
  await delay(450);

  const metrics = calculateStrategyMetrics(legs);
  const payoff = generatePayoffPoints(legs);
  const equity = generateEquityCurve(30, legs.length > 0 ? 1.05 : 0.8);

  return {
    metrics,
    payoff,
    equity,
  };
}

/**
 * Fetch options payoff diagram curve for current legs
 */
export async function getPayoffData(legs: OptionLeg[]): Promise<PayoffPoint[]> {
  try {
    if (process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true') {
      const response = await apiClient.post('/api/strategy/payoff', { legs });
      return response.data;
    }
  } catch (error) {
    console.warn('[API] Falling back to mock payoff calculation', error);
  }

  await delay(180);
  return generatePayoffPoints(legs);
}

/**
 * Fetch historical strategy equity curve
 */
export async function getEquityCurve(legs?: OptionLeg[]): Promise<EquityPoint[]> {
  try {
    if (process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true') {
      const response = await apiClient.get('/api/strategy/equity-curve');
      return response.data;
    }
  } catch (error) {
    console.warn('[API] Falling back to mock equity curve', error);
  }

  await delay(200);
  return generateEquityCurve(30, legs && legs.length > 0 ? 1.1 : 0.9);
}

/**
 * Perform One-Click AI Optimization on the strategy
 */
export async function optimizeStrategy(legs: OptionLeg[]): Promise<OptimizationResult> {
  try {
    if (process.env.NEXT_PUBLIC_USE_REAL_BACKEND === 'true') {
      const response = await apiClient.post('/api/strategy/optimize', { legs });
      return response.data;
    }
  } catch (error) {
    console.warn('[API] Falling back to mock AI optimization engine', error);
  }

  // Realistic AI inference latency
  await delay(1200);
  return generateOptimizationResult(legs);
}

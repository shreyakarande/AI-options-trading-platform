import { MarketCandle, MarketIndex } from '@/types';

// Mock data for Market Overview indices
export const MOCK_MARKET_INDICES: MarketIndex[] = [
  {
    symbol: 'NIFTY 50',
    name: 'NIFTY 50 Index',
    value: 22450.50,
    change: 182.35,
    changePercent: 0.82,
    high: 22498.20,
    low: 22380.10,
    isPositive: true,
  },
  {
    symbol: 'BANK NIFTY',
    name: 'Nifty Bank Index',
    value: 48210.25,
    change: 306.80,
    changePercent: 0.64,
    high: 48390.00,
    low: 47980.50,
    isPositive: true,
  },
  {
    symbol: 'INDIA VIX',
    name: 'Volatility Index',
    value: 13.42,
    change: -0.29,
    changePercent: -2.10,
    high: 13.95,
    low: 13.20,
    isPositive: false,
  },
  {
    symbol: 'SENSEX',
    name: 'BSE Sensex 30',
    value: 73917.03,
    change: 590.20,
    changePercent: 0.80,
    high: 74045.30,
    low: 73620.15,
    isPositive: true,
  },
  {
    symbol: 'NIFTY PCR',
    name: 'Put-Call Ratio',
    value: 1.18,
    change: 0.08,
    changePercent: 7.27,
    high: 1.25,
    low: 1.05,
    isPositive: true,
  },
];

// Realistic 60-day daily OHLC candles for NIFTY 50
export const generateMockCandles = (): MarketCandle[] => {
  const candles: MarketCandle[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 65);

  let currentPrice = 21750.0;

  for (let i = 0; i < 65; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    // Skip weekends
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const formattedDate = date.toISOString().split('T')[0];

    // Realistic market fluctuation
    const volatility = 90 + Math.sin(i / 4) * 40;
    const trend = (i / 65) * 600 + Math.sin(i / 5) * 120;
    const base = 21800 + trend;

    const open = Math.round((base + (Math.random() - 0.48) * volatility) * 100) / 100;
    const delta = (Math.random() - 0.46) * volatility;
    const close = Math.round((open + delta) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * (volatility * 0.6)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * (volatility * 0.6)) * 100) / 100;
    const volume = Math.floor(180000 + Math.random() * 95000);

    candles.push({
      time: formattedDate,
      open,
      high,
      low,
      close,
      volume,
    });
  }

  // Ensure last close is near the spot 22,450.50
  if (candles.length > 0) {
    const last = candles[candles.length - 1];
    last.close = 22450.50;
    last.high = Math.max(last.high, 22498.20);
    last.low = Math.min(last.low, 22380.10);
  }

  return candles;
};

export const MOCK_CANDLE_DATA: MarketCandle[] = generateMockCandles();

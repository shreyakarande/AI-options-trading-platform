import { OptionLeg, StrategyMetrics } from '@/types';

export const NIFTY_SPOT_PRICE = 22450.50;

// Standard NIFTY strikes around spot (21800 to 23100)
export const AVAILABLE_STRIKES: number[] = [
  21800, 21900, 22000, 22100, 22200, 22300, 22350, 22400, 22450,
  22500, 22550, 22600, 22700, 22800, 22900, 23000, 23100
];

// Helper to estimate realistic premium based on strike and option type
export const estimatePremium = (strike: number, type: 'CE' | 'PE', spot = NIFTY_SPOT_PRICE): number => {
  const diff = spot - strike;
  const daysToExpiry = 4;
  const timeValue = Math.round(75 * Math.sqrt(daysToExpiry / 7));

  if (type === 'CE') {
    const intrinsic = Math.max(0, diff);
    const otmPenalty = diff < 0 ? Math.exp(diff / 250) : 1;
    return Math.max(8, Math.round((intrinsic + timeValue * otmPenalty) * 10) / 10);
  } else {
    const intrinsic = Math.max(0, -diff);
    const otmPenalty = diff > 0 ? Math.exp(-diff / 250) : 1;
    return Math.max(8, Math.round((intrinsic + timeValue * otmPenalty) * 10) / 10);
  }
};

// Default initial strategy: Bull Call Spread (NIFTY 22400 CE BUY / 22600 CE SELL)
export const DEFAULT_OPTION_LEGS: OptionLeg[] = [
  {
    id: 'leg-1',
    legNumber: 1,
    action: 'BUY',
    optionType: 'CE',
    strikePrice: 22400,
    quantity: 50,
    stopLoss: 60,
    target: 200,
    premium: estimatePremium(22400, 'CE'),
    delta: 0.58,
  },
  {
    id: 'leg-2',
    legNumber: 2,
    action: 'SELL',
    optionType: 'CE',
    strikePrice: 22600,
    quantity: 50,
    stopLoss: 90,
    target: 20,
    premium: estimatePremium(22600, 'CE'),
    delta: -0.32,
  },
];

// Quick strategy preset configurations
export const STRATEGY_PRESETS = [
  {
    name: 'Bull Call Spread',
    description: 'Moderately bullish, capped risk and capped upside',
    legs: [
      {
        action: 'BUY' as const,
        optionType: 'CE' as const,
        strikePrice: 22400,
        quantity: 50,
        stopLoss: 60,
        target: 190,
      },
      {
        action: 'SELL' as const,
        optionType: 'CE' as const,
        strikePrice: 22600,
        quantity: 50,
        stopLoss: 90,
        target: 25,
      },
    ],
  },
  {
    name: 'Bear Put Spread',
    description: 'Moderately bearish, limited risk hedge',
    legs: [
      {
        action: 'BUY' as const,
        optionType: 'PE' as const,
        strikePrice: 22500,
        quantity: 50,
        stopLoss: 70,
        target: 180,
      },
      {
        action: 'SELL' as const,
        optionType: 'PE' as const,
        strikePrice: 22300,
        quantity: 50,
        stopLoss: 80,
        target: 30,
      },
    ],
  },
  {
    name: 'Long Straddle',
    description: 'Direction neutral, profits from major volatility spike',
    legs: [
      {
        action: 'BUY' as const,
        optionType: 'CE' as const,
        strikePrice: 22450,
        quantity: 50,
        stopLoss: 45,
        target: 220,
      },
      {
        action: 'BUY' as const,
        optionType: 'PE' as const,
        strikePrice: 22450,
        quantity: 50,
        stopLoss: 45,
        target: 220,
      },
    ],
  },
  {
    name: 'Iron Condor',
    description: 'Range-bound market, captures theta decay from both wings',
    legs: [
      {
        action: 'BUY' as const,
        optionType: 'PE' as const,
        strikePrice: 22100,
        quantity: 50,
        stopLoss: 30,
        target: 80,
      },
      {
        action: 'SELL' as const,
        optionType: 'PE' as const,
        strikePrice: 22300,
        quantity: 50,
        stopLoss: 95,
        target: 15,
      },
      {
        action: 'SELL' as const,
        optionType: 'CE' as const,
        strikePrice: 22600,
        quantity: 50,
        stopLoss: 95,
        target: 15,
      },
      {
        action: 'BUY' as const,
        optionType: 'CE' as const,
        strikePrice: 22800,
        quantity: 50,
        stopLoss: 30,
        target: 80,
      },
    ],
  },
];

// Calculate metrics from active legs
export const calculateStrategyMetrics = (legs: OptionLeg[]): StrategyMetrics => {
  if (legs.length === 0) {
    return {
      strategyName: 'Empty Strategy',
      numberOfLegs: 0,
      entryValue: 0,
      netDebitOrCredit: 'NEUTRAL',
      maxProfit: 0,
      maxLoss: 0,
      breakevenPoints: [],
      riskRewardRatio: '0 : 0',
      currentPnl: 0,
      pnlPercentage: 0,
      pop: 50,
      delta: 0,
      theta: 0,
      vega: 0,
    };
  }

  // Calculate Net Premium
  let netPremium = 0;
  let netDelta = 0;
  let netTheta = 0;
  let netVega = 0;

  legs.forEach((leg) => {
    const mult = leg.action === 'BUY' ? -1 : 1;
    netPremium += mult * leg.premium * leg.quantity;

    const deltaSign = leg.optionType === 'CE' ? 1 : -1;
    const legDelta = (leg.action === 'BUY' ? 1 : -1) * deltaSign * 0.45;
    netDelta += legDelta * (leg.quantity / 50);

    const legTheta = (leg.action === 'SELL' ? 12 : -12) * (leg.quantity / 50);
    netTheta += legTheta;

    const legVega = (leg.action === 'BUY' ? 15 : -15) * (leg.quantity / 50);
    netVega += legVega;
  });

  // Calculate payoff bounds over sample range (21000 to 24000)
  let minPnl = Infinity;
  let maxPnl = -Infinity;
  const breakevens: number[] = [];

  let prevPnl: number | null = null;
  let prevPrice = 21000;

  for (let price = 21000; price <= 24000; price += 10) {
    let pnl = 0;
    legs.forEach((leg) => {
      let intrinsicAtExpiry = 0;
      if (leg.optionType === 'CE') {
        intrinsicAtExpiry = Math.max(0, price - leg.strikePrice);
      } else {
        intrinsicAtExpiry = Math.max(0, leg.strikePrice - price);
      }

      const pnlPerUnit = leg.action === 'BUY'
        ? (intrinsicAtExpiry - leg.premium)
        : (leg.premium - intrinsicAtExpiry);

      pnl += pnlPerUnit * leg.quantity;
    });

    if (pnl < minPnl) minPnl = pnl;
    if (pnl > maxPnl) maxPnl = pnl;

    // Detect zero crossing
    if (prevPnl !== null) {
      if ((prevPnl <= 0 && pnl >= 0) || (prevPnl >= 0 && pnl <= 0)) {
        const be = Math.round((prevPrice + price) / 2);
        if (!breakevens.some((b) => Math.abs(b - be) < 40)) {
          breakevens.push(be);
        }
      }
    }
    prevPnl = pnl;
    prevPrice = price;
  }

  // Cap profit/loss representation
  const isCappedProfit = maxPnl < 100000;
  const isCappedLoss = minPnl > -100000;

  const displayMaxProfit = isCappedProfit ? Math.round(maxPnl) : 'Unlimited';
  const displayMaxLoss = isCappedLoss ? Math.round(Math.abs(minPnl)) : 'Unlimited';

  let rrRatio = '1 : 1.5';
  if (typeof displayMaxProfit === 'number' && typeof displayMaxLoss === 'number' && displayMaxLoss > 0) {
    const ratio = Math.round((displayMaxProfit / displayMaxLoss) * 100) / 100;
    rrRatio = `1 : ${ratio}`;
  } else if (displayMaxProfit === 'Unlimited') {
    rrRatio = '1 : ∞';
  }

  // Name strategy
  let strategyName = 'Custom Multi-Leg Strategy';
  if (legs.length === 1) {
    strategyName = `${legs[0].action} ${legs[0].strikePrice} ${legs[0].optionType}`;
  } else if (legs.length === 2) {
    if (legs[0].optionType === 'CE' && legs[1].optionType === 'CE') {
      strategyName = legs[0].action === 'BUY' ? 'Bull Call Spread' : 'Bear Call Spread';
    } else if (legs[0].optionType === 'PE' && legs[1].optionType === 'PE') {
      strategyName = legs[0].action === 'BUY' ? 'Bear Put Spread' : 'Bull Put Spread';
    } else if (legs[0].strikePrice === legs[1].strikePrice) {
      strategyName = legs[0].action === 'BUY' ? 'Long Straddle' : 'Short Straddle';
    }
  } else if (legs.length === 4) {
    strategyName = 'Iron Condor';
  }

  const currentPnl = Math.round(netPremium * 0.18 + (Math.random() * 400 - 150));
  const absEntry = Math.max(Math.abs(netPremium), 1000);
  const pnlPct = Math.round((currentPnl / absEntry) * 1000) / 10;

  return {
    strategyName,
    numberOfLegs: legs.length,
    entryValue: Math.round(Math.abs(netPremium)),
    netDebitOrCredit: netPremium < 0 ? 'DEBIT' : netPremium > 0 ? 'CREDIT' : 'NEUTRAL',
    maxProfit: displayMaxProfit,
    maxLoss: displayMaxLoss,
    breakevenPoints: breakevens.slice(0, 3),
    riskRewardRatio: rrRatio,
    currentPnl,
    pnlPercentage: pnlPct,
    pop: Math.min(88, Math.max(38, Math.round(58 + netDelta * 10 - (netPremium < 0 ? 5 : -8)))),
    delta: Math.round(netDelta * 100) / 100,
    theta: Math.round(netTheta * 10) / 10,
    vega: Math.round(netVega * 10) / 10,
  };
};

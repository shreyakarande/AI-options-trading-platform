import { OptionLeg, PayoffPoint } from '@/types';
import { NIFTY_SPOT_PRICE } from './strategyData';

export const generatePayoffPoints = (
  legs: OptionLeg[],
  minPrice = 21700,
  maxPrice = 23200,
  step = 25
): PayoffPoint[] => {
  const points: PayoffPoint[] = [];

  if (!legs || legs.length === 0) {
    for (let price = minPrice; price <= maxPrice; price += step) {
      points.push({ underlyingPrice: price, pnl: 0 });
    }
    return points;
  }

  for (let price = minPrice; price <= maxPrice; price += step) {
    let totalPnl = 0;

    for (const leg of legs) {
      let intrinsicAtExpiry = 0;
      if (leg.optionType === 'CE') {
        intrinsicAtExpiry = Math.max(0, price - leg.strikePrice);
      } else {
        intrinsicAtExpiry = Math.max(0, leg.strikePrice - price);
      }

      // PnL per unit at expiry
      const legPnlPerUnit = leg.action === 'BUY'
        ? (intrinsicAtExpiry - leg.premium)
        : (leg.premium - intrinsicAtExpiry);

      totalPnl += legPnlPerUnit * leg.quantity;
    }

    points.push({
      underlyingPrice: price,
      pnl: Math.round(totalPnl),
    });
  }

  return points;
};

import { EquityPoint } from '@/types';

export const generateEquityCurve = (days = 30, baseReturnFactor = 1.0): EquityPoint[] => {
  const points: EquityPoint[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let stratCumulativePnl = 0;
  let benchCumulativePnl = 0;

  for (let i = 0; i <= days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    // Skip weekends
    if (d.getDay() === 0 || d.getDay() === 6) continue;

    const formattedDate = d.toISOString().split('T')[0];
    const timeLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    if (i === 0) {
      points.push({
        time: timeLabel,
        date: formattedDate,
        strategyPnl: 0,
        benchmarkPnl: 0,
      });
      continue;
    }

    // Daily simulated increment
    // Strategy has higher Sharpe, controlled drawdowns
    const stratDaily = (Math.sin(i / 3) * 600 + Math.random() * 950 - 180) * baseReturnFactor;
    // Benchmark has wider swings
    const benchDaily = Math.cos(i / 2.5) * 800 + (Math.random() - 0.46) * 1100;

    stratCumulativePnl += stratDaily;
    benchCumulativePnl += benchDaily;

    points.push({
      time: timeLabel,
      date: formattedDate,
      strategyPnl: Math.round(stratCumulativePnl),
      benchmarkPnl: Math.round(benchCumulativePnl),
    });
  }

  return points;
};

export const MOCK_EQUITY_DATA: EquityPoint[] = generateEquityCurve(30, 1.0);

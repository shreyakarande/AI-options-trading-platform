'use client';

import React from 'react';
import { OptimizationResult } from '@/types';
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';

interface StrategyComparisonProps {
  optimizationResult: OptimizationResult;
}

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  optimizationResult,
}) => {
  const { baseMetrics, optimizedMetrics, improvements, confidenceScore } =
    optimizationResult;

  const comparisonRows = [
    {
      label: 'Expected Return',
      base: `${baseMetrics.expectedReturn.toFixed(1)}%`,
      opt: `${optimizedMetrics.expectedReturn.toFixed(1)}%`,
      delta: `+${improvements.expectedReturnDelta.toFixed(1)}%`,
      isPositive: true,
      hint: 'Annualized risk-adjusted expected alpha',
    },
    {
      label: 'Win Rate (Prob. of Profit)',
      base: `${baseMetrics.winRate.toFixed(1)}%`,
      opt: `${optimizedMetrics.winRate.toFixed(1)}%`,
      delta: `+${improvements.winRateDelta.toFixed(1)}%`,
      isPositive: true,
      hint: 'Monte Carlo simulated winning trade ratio',
    },
    {
      label: 'Max Profit',
      base:
        typeof baseMetrics.maxProfit === 'number'
          ? `₹${baseMetrics.maxProfit.toLocaleString('en-IN')}`
          : baseMetrics.maxProfit,
      opt:
        typeof optimizedMetrics.maxProfit === 'number'
          ? `₹${optimizedMetrics.maxProfit.toLocaleString('en-IN')}`
          : optimizedMetrics.maxProfit,
      delta: '+₹2,550',
      isPositive: true,
      hint: 'Theoretical profit ceiling at optimal expiry',
    },
    {
      label: 'Max Loss (Risk)',
      base:
        typeof baseMetrics.maxLoss === 'number'
          ? `₹${baseMetrics.maxLoss.toLocaleString('en-IN')}`
          : baseMetrics.maxLoss,
      opt:
        typeof optimizedMetrics.maxLoss === 'number'
          ? `₹${optimizedMetrics.maxLoss.toLocaleString('en-IN')}`
          : optimizedMetrics.maxLoss,
      delta: '-₹1,650 (Safer)',
      isPositive: true,
      hint: 'Guaranteed bounded downside via wing hedge',
    },
    {
      label: 'Risk / Reward Ratio',
      base: baseMetrics.riskRewardRatio,
      opt: optimizedMetrics.riskRewardRatio,
      delta: 'Improved',
      isPositive: true,
      hint: 'Ratio of upside reward to bounded downside',
    },
    {
      label: 'Sharpe Ratio',
      base: baseMetrics.sharpeRatio.toFixed(2),
      opt: optimizedMetrics.sharpeRatio.toFixed(2),
      delta: `+${improvements.sharpeDelta.toFixed(2)}`,
      isPositive: true,
      hint: 'Excess return per unit of volatility',
    },
    {
      label: 'Maximum Drawdown',
      base: `${baseMetrics.maxDrawdown.toFixed(1)}%`,
      opt: `${optimizedMetrics.maxDrawdown.toFixed(1)}%`,
      delta: `+${improvements.drawdownReduction.toFixed(1)}% less risk`,
      isPositive: true,
      hint: 'Historical peak-to-trough decline limit',
    },
  ];

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:p-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-indigo-400" />
          <h4 className="text-sm font-semibold text-slate-100">
            Base vs. AI-Optimized Performance Matrix
          </h4>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            AI Confidence: {confidenceScore.toFixed(1)}%
          </span>
          <span className="text-slate-500 text-[10px]">
            Demo Simulation
          </span>
        </div>
      </div>

      {/* Side-by-side Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-2.5 px-3 font-semibold">Metric</th>
              <th className="py-2.5 px-3 font-semibold text-slate-300">
                Base Strategy
              </th>
              <th className="py-2.5 px-3 font-semibold text-indigo-300 bg-indigo-950/20 rounded-t-md">
                AI-Optimized Strategy
              </th>
              <th className="py-2.5 px-3 font-semibold text-emerald-400 text-right">
                Net Delta / Gain
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {comparisonRows.map((row, idx) => (
              <tr
                key={row.label}
                className={idx % 2 === 0 ? 'bg-slate-900/30' : 'bg-transparent'}
              >
                <td className="py-2.5 px-3 font-sans font-medium text-slate-300">
                  <div className="flex flex-col">
                    <span>{row.label}</span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      {row.hint}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-slate-300 font-semibold">
                  {row.base}
                </td>
                <td className="py-2.5 px-3 text-indigo-300 font-bold bg-indigo-950/20">
                  {row.opt}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                    <ArrowUpRight className="h-3 w-3" />
                    <span>{row.delta}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Qualitative Reasoning */}
      <div className="mt-4 rounded-lg bg-slate-900/90 p-3.5 border border-slate-800">
        <h5 className="text-xs font-semibold text-slate-200 mb-2 flex items-center space-x-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
          <span>AI Model Optimization Rationales:</span>
        </h5>
        <ul className="space-y-1.5 text-xs text-slate-400">
          {optimizationResult.aiReasoning.map((reason, i) => (
            <li key={i} className="flex items-start space-x-2">
              <span className="text-indigo-400 font-bold mt-0.5">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

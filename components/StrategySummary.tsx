'use client';

import React from 'react';
import { StrategyMetrics } from '@/types';
import {
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Percent,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface StrategySummaryProps {
  metrics: StrategyMetrics | null;
  isLoading?: boolean;
}

export const StrategySummary: React.FC<StrategySummaryProps> = ({
  metrics,
  isLoading = false,
}) => {
  if (!metrics) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center">
        <p className="text-xs text-slate-400">
          No strategy metrics generated yet. Configure legs and click &quot;Generate Strategy&quot;.
        </p>
      </div>
    );
  }

  const isProfit = metrics.currentPnl >= 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm">
      {/* Top Title & Strategy Name */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-slate-100">
              Strategy Summary
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {metrics.strategyName}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Model-derived risk boundaries and Greeks for simulated portfolio exposure.
          </p>
        </div>

        {/* Badge & Mode */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
              metrics.netDebitOrCredit === 'DEBIT'
                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                : metrics.netDebitOrCredit === 'CREDIT'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            Net {metrics.netDebitOrCredit}
          </span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            Demo Analytics
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Entry Value */}
        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Entry Premium
          </span>
          <div className="text-base font-bold font-mono text-slate-100">
            ₹{metrics.entryValue.toLocaleString('en-IN')}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            {metrics.numberOfLegs} {metrics.numberOfLegs === 1 ? 'Leg' : 'Legs'} total
          </span>
        </div>

        {/* Max Profit */}
        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Max Profit
          </span>
          <div className="text-base font-bold font-mono text-emerald-400">
            {typeof metrics.maxProfit === 'number'
              ? `₹${metrics.maxProfit.toLocaleString('en-IN')}`
              : metrics.maxProfit}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Upper ceiling
          </span>
        </div>

        {/* Max Loss */}
        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Max Loss
          </span>
          <div className="text-base font-bold font-mono text-rose-400">
            {typeof metrics.maxLoss === 'number'
              ? `₹${metrics.maxLoss.toLocaleString('en-IN')}`
              : metrics.maxLoss}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Capital at risk
          </span>
        </div>

        {/* Breakeven */}
        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Breakeven
          </span>
          <div className="text-base font-bold font-mono text-slate-100 truncate">
            {metrics.breakevenPoints.length > 0
              ? metrics.breakevenPoints.map((b) => b.toLocaleString('en-IN')).join(', ')
              : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            At expiry spot
          </span>
        </div>

        {/* Risk / Reward */}
        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Risk / Reward
          </span>
          <div className="text-base font-bold font-mono text-indigo-300">
            {metrics.riskRewardRatio}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Simulated profile
          </span>
        </div>

        {/* Current P&L */}
        <div className="rounded-lg bg-slate-950/70 p-3 border border-slate-800/80">
          <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
            Simulated P&amp;L
          </span>
          <div
            className={`text-base font-bold font-mono ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isProfit ? '+' : ''}₹{metrics.currentPnl.toLocaleString('en-IN')}
          </div>
          <span
            className={`text-[10px] font-mono mt-0.5 block ${
              isProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            ({isProfit ? '+' : ''}{metrics.pnlPercentage}%)
          </span>
        </div>
      </div>

      {/* Secondary Greeks Row */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/60 text-xs">
        <div className="flex items-center justify-between rounded bg-slate-950/40 px-3 py-1.5 border border-slate-800/60">
          <span className="text-slate-400">Prob. of Profit (POP):</span>
          <span className="font-mono font-semibold text-emerald-400">
            {metrics.pop}%
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-slate-950/40 px-3 py-1.5 border border-slate-800/60">
          <span className="text-slate-400">Net Delta (Δ):</span>
          <span className="font-mono font-semibold text-slate-200">
            {metrics.delta > 0 ? `+${metrics.delta}` : metrics.delta}
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-slate-950/40 px-3 py-1.5 border border-slate-800/60">
          <span className="text-slate-400">Theta Decay (Θ):</span>
          <span className="font-mono font-semibold text-amber-300">
            ₹{metrics.theta}/day
          </span>
        </div>
        <div className="flex items-center justify-between rounded bg-slate-950/40 px-3 py-1.5 border border-slate-800/60">
          <span className="text-slate-400">Vega Exposure (ν):</span>
          <span className="font-mono font-semibold text-indigo-300">
            {metrics.vega}
          </span>
        </div>
      </div>
    </div>
  );
};

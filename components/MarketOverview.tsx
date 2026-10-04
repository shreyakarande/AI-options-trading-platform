'use client';

import React from 'react';
import { MarketIndex } from '@/types';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface MarketOverviewProps {
  indices: MarketIndex[];
  isLoading?: boolean;
}

export const MarketOverview: React.FC<MarketOverviewProps> = ({
  indices,
  isLoading = false,
}) => {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Market Overview
          </h2>
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60">
            <Info className="h-2.5 w-2.5" />
            <span>Simulated Mock Feeds</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          Last sync: {new Date().toLocaleTimeString()} IST
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {indices.map((idx) => {
          const isUp = idx.change >= 0;
          return (
            <div
              key={idx.symbol}
              className="relative overflow-hidden rounded-xl bg-slate-900/80 p-3.5 border border-slate-800 shadow-sm transition-all hover:border-slate-700 hover:bg-slate-900"
            >
              {/* Top row: Symbol and Tag */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200">
                  {idx.symbol}
                </span>
                <span
                  className={`inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono font-medium ${
                    isUp
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-0.5" />
                  )}
                  {isUp ? '+' : ''}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Value and Change */}
              <div className="mt-2 flex items-baseline justify-between">
                <div className="text-lg font-bold font-mono text-slate-100 tracking-tight">
                  {idx.value.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <div
                  className={`text-xs font-mono font-medium ${
                    isUp ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isUp ? '+' : ''}
                  {idx.change.toFixed(2)}
                </div>
              </div>

              {/* Day range mini-stat */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                <span>L: {idx.low.toLocaleString('en-IN')}</span>
                <span className="text-slate-500">|</span>
                <span>H: {idx.high.toLocaleString('en-IN')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

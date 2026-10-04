'use client';

import React, { useState, useMemo } from 'react';
import { EquityPoint } from '@/types';
import { TrendingUp, Award, BarChart3, LineChart } from 'lucide-react';

interface EquityCurveProps {
  equityData: EquityPoint[];
  isLoading?: boolean;
}

export const EquityCurve: React.FC<EquityCurveProps> = ({
  equityData,
  isLoading = false,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const {
    points,
    minPnl,
    maxPnl,
    stratPath,
    benchPath,
    areaPath,
    zeroY,
    scaleX,
    scaleY,
  } = useMemo(() => {
    if (!equityData || equityData.length === 0) {
      return {
        points: [],
        minPnl: -2000,
        maxPnl: 10000,
        stratPath: '',
        benchPath: '',
        areaPath: '',
        zeroY: 150,
        scaleX: () => 0,
        scaleY: () => 0,
      };
    }

    const allValues = [
      ...equityData.map((d) => d.strategyPnl),
      ...equityData.map((d) => d.benchmarkPnl),
      0,
    ];

    const minV = Math.min(...allValues);
    const maxV = Math.max(...allValues);
    const padding = (maxV - minV) * 0.15 || 1000;

    const yMin = minV - padding;
    const yMax = maxV + padding;

    const width = 800;
    const height = 280;
    const padX = 50;
    const padY = 25;

    const sx = (idx: number) => {
      return padX + (idx / (equityData.length - 1 || 1)) * (width - 2 * padX);
    };

    const sy = (val: number) => {
      return height - padY - ((val - yMin) / (yMax - yMin || 1)) * (height - 2 * padY);
    };

    const zeroCoord = sy(0);

    const stratCoords = equityData.map((d, i) => ({
      x: sx(i),
      y: sy(d.strategyPnl),
    }));

    const benchCoords = equityData.map((d, i) => ({
      x: sx(i),
      y: sy(d.benchmarkPnl),
    }));

    const sPath = stratCoords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const bPath = benchCoords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    const aPath = `${sPath} L ${stratCoords[stratCoords.length - 1].x} ${zeroCoord} L ${stratCoords[0].x} ${zeroCoord} Z`;

    return {
      points: stratCoords,
      minPnl: minV,
      maxPnl: maxV,
      stratPath: sPath,
      benchPath: bPath,
      areaPath: aPath,
      zeroY: zeroCoord,
      scaleX: sx,
      scaleY: sy,
    };
  }, [equityData]);

  const activeIndex =
    hoverIndex !== null
      ? hoverIndex
      : equityData.length > 0
      ? equityData.length - 1
      : null;

  const activePoint = activeIndex !== null ? equityData[activeIndex] : null;

  const totalReturn =
    equityData.length > 0 ? equityData[equityData.length - 1].strategyPnl : 0;
  const isPositive = totalReturn >= 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 text-indigo-400">
            <LineChart className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-slate-100">
                Strategy Equity Curve
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                30-Day Simulated Backtest
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cumulative portfolio trajectory vs NIFTY 50 Benchmark.
            </p>
          </div>
        </div>

        {/* Highlight Stats */}
        {activePoint && (
          <div className="flex items-center space-x-3 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-400 mr-1.5">{activePoint.time}:</span>
              <span
                className={`font-semibold ${
                  activePoint.strategyPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activePoint.strategyPnl >= 0 ? '+' : ''}₹
                {activePoint.strategyPnl.toLocaleString('en-IN')}
              </span>
            </div>
            <span className="text-slate-600">|</span>
            <div>
              <span className="text-slate-400 mr-1.5">NIFTY Bench:</span>
              <span className="font-semibold text-slate-300">
                {activePoint.benchmarkPnl >= 0 ? '+' : ''}₹
                {activePoint.benchmarkPnl.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Curve */}
      <div className="relative mt-3 w-full overflow-hidden rounded-lg border border-slate-800/80 bg-[#090d16]">
        {/* Legend */}
        <div className="absolute top-2.5 right-3 z-10 flex items-center space-x-4 text-[10px] font-mono">
          <div className="flex items-center space-x-1.5 text-emerald-400">
            <span className="h-2 w-3 rounded-xs bg-emerald-400" />
            <span>Options Strategy</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            <span className="h-0.5 w-3 bg-slate-500" />
            <span>NIFTY Buy &amp; Hold</span>
          </div>
        </div>

        <svg
          viewBox="0 0 800 280"
          className="w-full h-60 select-none"
          onMouseMove={(e) => {
            if (!equityData || equityData.length === 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = Math.max(
              0,
              Math.min(1, (e.clientX - rect.left - 50) / (rect.width - 100))
            );
            const idx = Math.round(ratio * (equityData.length - 1));
            setHoverIndex(idx);
          }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="equityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Zero baseline */}
          <line
            x1="50"
            y1={zeroY}
            x2="750"
            y2={zeroY}
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={areaPath} fill="url(#equityGrad)" />

          {/* Benchmark line */}
          <path
            d={benchPath}
            fill="none"
            stroke="#64748b"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          {/* Strategy line */}
          <path
            d={stratPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Hover indicator */}
          {activeIndex !== null && points[activeIndex] && (
            <g>
              <line
                x1={points[activeIndex].x}
                y1="25"
                x2={points[activeIndex].x}
                y2="255"
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={points[activeIndex].x}
                cy={points[activeIndex].y}
                r="5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Dates labels */}
          {equityData.length > 0 && (
            <>
              <text x="50" y="270" fill="#64748b" fontSize="10" fontFamily="monospace">
                {equityData[0].time}
              </text>
              <text
                x="750"
                y="270"
                fill="#64748b"
                fontSize="10"
                fontFamily="monospace"
                textAnchor="end"
              >
                {equityData[equityData.length - 1].time}
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Footer Metrics */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
          <span className="text-slate-400">Total Net Gain:</span>
          <span
            className={`font-mono font-semibold ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? '+' : ''}₹{totalReturn.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="p-2 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
          <span className="text-slate-400">Sharpe Ratio:</span>
          <span className="font-mono font-semibold text-slate-200">1.84</span>
        </div>
        <div className="p-2 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
          <span className="text-slate-400">Max Drawdown:</span>
          <span className="font-mono font-semibold text-rose-400">-6.8%</span>
        </div>
        <div className="p-2 rounded bg-slate-950/40 border border-slate-800 flex justify-between">
          <span className="text-slate-400">Win Rate:</span>
          <span className="font-mono font-semibold text-emerald-400">67.5%</span>
        </div>
      </div>
    </div>
  );
};

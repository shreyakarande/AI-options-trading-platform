'use client';

import React, { useState, useMemo } from 'react';
import { PayoffPoint } from '@/types';
import { NIFTY_SPOT_PRICE } from '@/mock/strategyData';
import { TrendingUp, TrendingDown, Target, Info } from 'lucide-react';

interface PayoffChartProps {
  payoffData: PayoffPoint[];
  breakevens?: number[];
  isLoading?: boolean;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  payoffData,
  breakevens = [],
  isLoading = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<PayoffPoint | null>(null);

  // Calculate scales and coordinate mappings
  const {
    minPrice,
    maxPrice,
    minPnl,
    maxPnl,
    zeroY,
    spotX,
    pointsPath,
    profitAreaPath,
    lossAreaPath,
  } = useMemo(() => {
    if (!payoffData || payoffData.length === 0) {
      return {
        minPrice: 21800,
        maxPrice: 23100,
        minPnl: -5000,
        maxPnl: 5000,
        zeroY: 150,
        spotX: 400,
        pointsPath: '',
        profitAreaPath: '',
        lossAreaPath: '',
      };
    }

    const prices = payoffData.map((d) => d.underlyingPrice);
    const pnls = payoffData.map((d) => d.pnl);

    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);

    let minVal = Math.min(...pnls);
    let maxVal = Math.max(...pnls);

    // Ensure symmetrical headroom around 0
    if (minVal >= 0) minVal = -2000;
    if (maxVal <= 0) maxVal = 2000;

    const padding = (maxVal - minVal) * 0.15 || 500;
    const yMin = minVal - padding;
    const yMax = maxVal + padding;

    // ViewBox dimensions: 800 width, 320 height, padding
    const width = 800;
    const height = 300;
    const padX = 50;
    const padY = 25;

    const scaleX = (price: number) => {
      return padX + ((price - minP) / (maxP - minP || 1)) * (width - 2 * padX);
    };

    const scaleY = (pnl: number) => {
      return height - padY - ((pnl - yMin) / (yMax - yMin || 1)) * (height - 2 * padY);
    };

    const zeroCoordY = scaleY(0);
    const spotCoordX = scaleX(NIFTY_SPOT_PRICE);

    // Build SVG path strings
    const coords = payoffData.map((d) => ({
      x: scaleX(d.underlyingPrice),
      y: scaleY(d.pnl),
      pnl: d.pnl,
    }));

    const pathD = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');

    // Profit area path (above zero line)
    // Loss area path (below zero line)
    const profitCoords = coords.map((c) => ({
      x: c.x,
      y: Math.min(zeroCoordY, c.y),
    }));
    const profitD = `${pathD} L ${coords[coords.length - 1].x} ${zeroCoordY} L ${coords[0].x} ${zeroCoordY} Z`;

    return {
      minPrice: minP,
      maxPrice: maxP,
      minPnl: minVal,
      maxPnl: maxVal,
      zeroY: zeroCoordY,
      spotX: spotCoordX,
      pointsPath: pathD,
      profitAreaPath: profitD,
      lossAreaPath: '',
      scaleX,
      scaleY,
      width,
      height,
    };
  }, [payoffData]);

  // Handle mouse move over SVG
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!payoffData || payoffData.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const targetPrice = minPrice + xRatio * (maxPrice - minPrice);

    // Find closest point
    let closest = payoffData[0];
    let minDiff = Math.abs(closest.underlyingPrice - targetPrice);

    for (let i = 1; i < payoffData.length; i++) {
      const diff = Math.abs(payoffData[i].underlyingPrice - targetPrice);
      if (diff < minDiff) {
        minDiff = diff;
        closest = payoffData[i];
      }
    }
    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const currentDisplay = hoveredPoint || {
    underlyingPrice: NIFTY_SPOT_PRICE,
    pnl:
      payoffData.find((p) => Math.abs(p.underlyingPrice - NIFTY_SPOT_PRICE) < 30)?.pnl || 0,
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Options Payoff Diagram
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              At Expiry P&amp;L
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Interactive profit/loss zones across NIFTY 50 underlying expiration prices.
          </p>
        </div>

        {/* Live Hover Inspection stats */}
        <div className="flex items-center space-x-3 text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">Underlying:</span>
            <span className="font-semibold text-slate-200">
              {currentDisplay.underlyingPrice.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-slate-400">P&amp;L:</span>
            <span
              className={`font-semibold ${
                currentDisplay.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {currentDisplay.pnl >= 0 ? '+' : ''}₹
              {currentDisplay.pnl.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Diagram Canvas */}
      <div className="relative mt-3 w-full overflow-hidden rounded-lg border border-slate-800/80 bg-[#090d16]">
        {/* Legend */}
        <div className="absolute top-2.5 right-3 z-10 flex items-center space-x-3 text-[10px] font-mono">
          <div className="flex items-center space-x-1 text-emerald-400">
            <span className="h-2 w-2 rounded-xs bg-emerald-500/40 border border-emerald-400" />
            <span>Profit Zone</span>
          </div>
          <div className="flex items-center space-x-1 text-rose-400">
            <span className="h-2 w-2 rounded-xs bg-rose-500/40 border border-rose-400" />
            <span>Loss Zone</span>
          </div>
          <div className="flex items-center space-x-1 text-indigo-300">
            <span className="h-2 w-0.5 bg-indigo-400" />
            <span>Current Spot</span>
          </div>
        </div>

        {/* Responsive SVG Chart */}
        <svg
          viewBox="0 0 800 300"
          className="w-full h-64 sm:h-72 select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="profitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="lossGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="50"
            y1={zeroY}
            x2="750"
            y2={zeroY}
            stroke="#475569"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x="55"
            y={zeroY - 6}
            fill="#94a3b8"
            fontSize="10"
            fontFamily="monospace"
          >
            Zero P&amp;L (₹0)
          </text>

          {/* Vertical Spot line */}
          <line
            x1={spotX}
            y1="25"
            x2={spotX}
            y2="275"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeDasharray="2 3"
          />
          <text
            x={spotX + 4}
            y="38"
            fill="#a5b4fc"
            fontSize="10"
            fontFamily="monospace"
          >
            Spot ({NIFTY_SPOT_PRICE.toFixed(0)})
          </text>

          {/* Shaded Area */}
          <path d={profitAreaPath} fill="url(#profitGrad)" />

          {/* Main Payoff Line */}
          <path
            d={pointsPath}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Breakeven markers */}
          {breakevens.map((be) => {
            const bx =
              50 +
              ((be - minPrice) / (maxPrice - minPrice || 1)) * (800 - 100);
            return (
              <g key={be}>
                <circle cx={bx} cy={zeroY} r="4" fill="#f59e0b" />
                <text
                  x={bx}
                  y={zeroY + 18}
                  fill="#fbbf24"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  BE: {be}
                </text>
              </g>
            );
          })}

          {/* Hover Crosshair */}
          {hoveredPoint && (
            <g>
              {(() => {
                const hx =
                  50 +
                  ((hoveredPoint.underlyingPrice - minPrice) /
                    (maxPrice - minPrice || 1)) *
                    (800 - 100);
                const hy =
                  275 -
                  ((hoveredPoint.pnl - minPnl) / (maxPnl - minPnl || 1)) *
                    (300 - 50);
                return (
                  <>
                    <line
                      x1={hx}
                      y1="25"
                      x2={hx}
                      y2="275"
                      stroke="#94a3b8"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                    />
                    <circle
                      cx={hx}
                      cy={hy}
                      r="5"
                      fill={hoveredPoint.pnl >= 0 ? '#10b981' : '#f43f5e'}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                );
              })()}
            </g>
          )}

          {/* X Axis bounds */}
          <text
            x="50"
            y="290"
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
          >
            {minPrice}
          </text>
          <text
            x="750"
            y="290"
            fill="#64748b"
            fontSize="10"
            fontFamily="monospace"
            textAnchor="end"
          >
            {maxPrice}
          </text>
        </svg>
      </div>

      {/* Footer */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span>Hover over curve to inspect expiry payout at any strike price</span>
        <span>Green = Profitable • Red = Capital Loss</span>
      </div>
    </div>
  );
};

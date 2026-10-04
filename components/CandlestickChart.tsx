'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MarketCandle } from '@/types';
import {
  createChart,
  CandlestickSeries,
  ColorType,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';
import { BarChart2, Maximize2, RefreshCw } from 'lucide-react';

interface CandlestickChartProps {
  candles: MarketCandle[];
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
  candles,
  title = 'NIFTY 50',
  subtitle = 'Daily Candlestick • Spot: 22,450.50 (Mock Data)',
  onRefresh,
  isLoading = false,
}) => {
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [selectedCandle, setSelectedCandle] = useState<MarketCandle | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart before recreating
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const container = chartContainerRef.current;

    // Create chart with dark finance theme
    const chart = createChart(container, {
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 11,
        fontFamily: 'var(--font-mono), monospace, system-ui',
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.45)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.45)' },
      },
      crosshair: {
        vertLine: {
          color: '#6366f1',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#6366f1',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        scaleMargins: {
          top: 0.1,
          bottom: 0.15,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
      width: container.clientWidth || 600,
      height: 380,
    });

    // Add Candlestick series using v5 API
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    // Transform and set data
    const formattedData = candles.map((c) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    // Subscribe to crosshair move for tooltip stats
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setSelectedCandle(null);
        return;
      }
      const data = param.seriesData.get(candlestickSeries) as
        | { time: string; open: number; high: number; low: number; close: number }
        | undefined;

      if (data) {
        setSelectedCandle({
          time: typeof data.time === 'string' ? data.time : String(data.time),
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
        });
      }
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle responsive container resize
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width } = entries[0].contentRect;
      if (width > 0) {
        chartRef.current.applyOptions({ width });
      }
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [candles]);

  const activeCandle = selectedCandle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
      {/* Chart Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-slate-800 text-indigo-400">
            <BarChart2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-100 font-mono tracking-tight">
                {title}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LIVE SPOT (DEMO)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{subtitle}</p>
          </div>
        </div>

        {/* OHLC Bar Statistics */}
        {activeCandle && (
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono">
            <span className="text-slate-400">
              O: <span className="text-slate-200">{activeCandle.open.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              H: <span className="text-emerald-400">{activeCandle.high.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              L: <span className="text-rose-400">{activeCandle.low.toFixed(2)}</span>
            </span>
            <span className="text-slate-400">
              C:{' '}
              <span
                className={
                  activeCandle.close >= activeCandle.open
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }
              >
                {activeCandle.close.toFixed(2)}
              </span>
            </span>
            <span className="text-slate-500 text-[10px]">
              ({activeCandle.time})
            </span>
          </div>
        )}
      </div>

      {/* Chart Canvas Container */}
      <div className="relative mt-3 w-full overflow-hidden rounded-lg border border-slate-800/80 bg-[#090d16]">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs">
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading market candle stream...</span>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Footer Meta */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-mono">
          TradingView Lightweight Charts v5 • Ready for FastAPI WebSocket stream
        </span>
        <span className="hidden sm:inline">
          Scroll to zoom • Drag to pan • Hover for crosshair
        </span>
      </div>
    </div>
  );
};

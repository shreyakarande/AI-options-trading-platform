'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  OptionLeg,
  StrategyMetrics,
  PayoffPoint,
  EquityPoint,
  MarketCandle,
  MarketIndex,
} from '@/types';
import {
  getMarketData,
  generateStrategy,
  getPayoffData,
  getEquityCurve,
} from '@/lib/api';
import { DEFAULT_OPTION_LEGS } from '@/mock/strategyData';

import { Header } from '@/components/Header';
import { MarketOverview } from '@/components/MarketOverview';
import { StrategyBuilder } from '@/components/StrategyBuilder';
import { StrategySummary } from '@/components/StrategySummary';
import { CandlestickChart } from '@/components/CandlestickChart';
import { PayoffChart } from '@/components/PayoffChart';
import { EquityCurve } from '@/components/EquityCurve';
import { AIOptimization } from '@/components/AIOptimization';
import { ToastContainer, ToastMessage } from '@/components/Toast';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Market data states
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [candles, setCandles] = useState<MarketCandle[]>([]);
  const [isRefreshingMarket, setIsRefreshingMarket] = useState(false);

  // Strategy states
  const [legs, setLegs] = useState<OptionLeg[]>(DEFAULT_OPTION_LEGS);
  const [strategyMetrics, setStrategyMetrics] = useState<StrategyMetrics | null>(null);
  const [payoffPoints, setPayoffPoints] = useState<PayoffPoint[]>([]);
  const [equityPoints, setEquityPoints] = useState<EquityPoint[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Helper to add toast
  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial load
  const loadInitialData = useCallback(async () => {
    try {
      const market = await getMarketData();
      setIndices(market.indices);
      setCandles(market.candles);

      const generated = await generateStrategy(DEFAULT_OPTION_LEGS);
      setStrategyMetrics(generated.metrics);
      setPayoffPoints(generated.payoff);
      setEquityPoints(generated.equity);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      addToast('error', 'Failed to initialize market feeds.');
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Handle Refresh Market
  const handleRefreshMarket = async () => {
    setIsRefreshingMarket(true);
    try {
      const market = await getMarketData();
      setIndices(market.indices);
      setCandles(market.candles);
      addToast('info', 'Market feeds refreshed (simulated ticks updated).');
    } catch (err) {
      console.error(err);
      addToast('error', 'Error refreshing market data.');
    } finally {
      setIsRefreshingMarket(false);
    }
  };

  // Handle Generate Strategy
  const handleGenerateStrategy = async () => {
    setIsGenerating(true);
    try {
      const result = await generateStrategy(legs);
      setStrategyMetrics(result.metrics);
      setPayoffPoints(result.payoff);
      setEquityPoints(result.equity);
      addToast('success', 'Strategy analytics and charts recalculated.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to calculate strategy metrics.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply AI-Optimized legs back to Builder
  const handleApplyAILegs = async (optimizedLegs: OptionLeg[]) => {
    setLegs(optimizedLegs);
    setIsGenerating(true);
    try {
      const result = await generateStrategy(optimizedLegs);
      setStrategyMetrics(result.metrics);
      setPayoffPoints(result.payoff);
      setEquityPoints(result.equity);
      addToast('success', 'Applied AI-optimized legs into Strategy Builder!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06090f] text-slate-100 flex flex-col font-sans">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshMarket={handleRefreshMarket}
        isRefreshing={isRefreshingMarket}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 sm:px-6 space-y-6">
        {/* 1. Market Overview Strip */}
        <MarketOverview indices={indices} isLoading={isRefreshingMarket} />

        {/* Tab-controlled or full Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Visual Strategy Builder */}
            <StrategyBuilder
              legs={legs}
              setLegs={setLegs}
              onGenerate={handleGenerateStrategy}
              isGenerating={isGenerating}
            />

            {/* Strategy Summary */}
            <StrategySummary
              metrics={strategyMetrics}
              isLoading={isGenerating}
            />

            {/* Charts Multi-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Candlestick Market Chart */}
              <CandlestickChart
                candles={candles}
                title="NIFTY 50"
                subtitle="Daily OHLC Candlestick • Spot: 22,450.50 (Mock Data)"
                onRefresh={handleRefreshMarket}
                isLoading={isRefreshingMarket}
              />

              {/* Options Payoff Diagram */}
              <PayoffChart
                payoffData={payoffPoints}
                breakevens={strategyMetrics?.breakevenPoints || []}
                isLoading={isGenerating}
              />
            </div>

            {/* Strategy Equity Curve Backtest */}
            <EquityCurve
              equityData={equityPoints}
              isLoading={isGenerating}
            />

            {/* AI Optimization & Comparison */}
            <AIOptimization
              legs={legs}
              onApplyOptimizedLegs={handleApplyAILegs}
            />
          </div>
        )}

        {/* Builder View Only */}
        {activeTab === 'builder' && (
          <div className="space-y-6">
            <StrategyBuilder
              legs={legs}
              setLegs={setLegs}
              onGenerate={handleGenerateStrategy}
              isGenerating={isGenerating}
            />
            <StrategySummary
              metrics={strategyMetrics}
              isLoading={isGenerating}
            />
            <PayoffChart
              payoffData={payoffPoints}
              breakevens={strategyMetrics?.breakevenPoints || []}
              isLoading={isGenerating}
            />
          </div>
        )}

        {/* Charts & Analytics View Only */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <CandlestickChart
                candles={candles}
                title="NIFTY 50"
                subtitle="Daily OHLC Candlestick • Spot: 22,450.50 (Mock Data)"
                onRefresh={handleRefreshMarket}
                isLoading={isRefreshingMarket}
              />
              <PayoffChart
                payoffData={payoffPoints}
                breakevens={strategyMetrics?.breakevenPoints || []}
                isLoading={isGenerating}
              />
            </div>
            <EquityCurve
              equityData={equityPoints}
              isLoading={isGenerating}
            />
          </div>
        )}

        {/* AI Lab View Only */}
        {activeTab === 'ai-lab' && (
          <div className="space-y-6">
            <AIOptimization
              legs={legs}
              onApplyOptimizedLegs={handleApplyAILegs}
            />
            <StrategySummary
              metrics={strategyMetrics}
              isLoading={isGenerating}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PayoffChart
                payoffData={payoffPoints}
                breakevens={strategyMetrics?.breakevenPoints || []}
                isLoading={isGenerating}
              />
              <EquityCurve
                equityData={equityPoints}
                isLoading={isGenerating}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-300">
              AI Options Trading Platform
            </span>
            <span className="text-slate-500">•</span>
            <span>Frontend &amp; UI/UX Lead (Person J)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Simulated Demo Mode • Ready for Person C&apos;s FastAPI backend integration
          </div>
        </div>
      </footer>
    </div>
  );
}

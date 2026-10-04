'use client';

import React, { useState } from 'react';
import { OptionLeg, OptimizationResult } from '@/types';
import { optimizeStrategy } from '@/lib/api';
import { AI_OPTIMIZATION_STEPS } from '@/mock/optimizationData';
import { StrategyComparison } from './StrategyComparison';
import {
  Cpu,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
  RotateCw,
  SlidersHorizontal,
} from 'lucide-react';

interface AIOptimizationProps {
  legs: OptionLeg[];
  onApplyOptimizedLegs: (optimizedLegs: OptionLeg[]) => void;
}

export const AIOptimization: React.FC<AIOptimizationProps> = ({
  legs,
  onApplyOptimizedLegs,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applySuccess, setApplySuccess] = useState(false);

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    setError(null);
    setApplySuccess(false);
    setActiveStepIndex(0);

    // Step cycle animation
    const stepInterval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < AI_OPTIMIZATION_STEPS.length - 1) return prev + 1;
        return prev;
      });
    }, 280);

    try {
      const optimizationData = await optimizeStrategy(legs);
      setResult(optimizationData);
    } catch (err) {
      console.error('Optimization failed:', err);
      setError('Unable to run AI optimization model. Please retry.');
    } finally {
      clearInterval(stepInterval);
      setIsOptimizing(false);
    }
  };

  const handleApply = () => {
    if (!result || !result.optimizedLegs) return;
    onApplyOptimizedLegs(result.optimizedLegs);
    setApplySuccess(true);
    setTimeout(() => setApplySuccess(false), 3500);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-semibold text-slate-100">
                AI Strategy Optimization
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Monte Carlo Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Refine strike positioning, hedge tail-risk drawdowns, and maximize expected Sharpe ratio.
            </p>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-amber-300/90 font-mono bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Demo / Mock AI Optimization
          </span>
        </div>
      </div>

      {/* Main Trigger Callout */}
      {!result && !isOptimizing && (
        <div className="mt-4 rounded-xl border border-dashed border-indigo-900/50 bg-indigo-950/20 p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-200">
            Ready to Optimize Current Strategy
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Our machine learning risk model analyzes option chain IV smiles, Greeks decay curves, and historic volatility cones to propose enhanced multi-leg trade structures.
          </p>
          <button
            type="button"
            onClick={handleRunOptimization}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>One-Click AI Optimization</span>
          </button>
        </div>
      )}

      {/* Loading Progress State */}
      {isOptimizing && (
        <div className="mt-4 rounded-xl border border-indigo-500/30 bg-slate-950/80 p-6 text-center">
          <div className="relative mx-auto mb-3 flex h-10 w-10 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Cpu className="h-4 w-4 text-indigo-400" />
          </div>
          <h4 className="text-sm font-semibold text-slate-200 mb-1">
            AI is analyzing your strategy...
          </h4>
          <p className="text-xs text-indigo-400 font-mono">
            {AI_OPTIMIZATION_STEPS[activeStepIndex]}
          </p>

          {/* Step dots */}
          <div className="mt-4 flex justify-center space-x-1.5">
            {AI_OPTIMIZATION_STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-6 rounded-full transition-all ${
                  i <= activeStepIndex ? 'bg-indigo-500' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 flex items-center justify-between p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={handleRunOptimization}
            className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Optimization Results */}
      {result && !isOptimizing && (
        <div className="mt-4 space-y-4">
          {/* Top action bar when result is available */}
          <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <span className="text-xs text-slate-300 font-medium">
                Optimization Complete: Enhanced Alpha &amp; Reduced Drawdown
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleRunOptimization}
                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors"
              >
                <RotateCw className="h-3 w-3" />
                <span>Re-run Optimization</span>
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Apply AI Strategy to Builder</span>
              </button>
            </div>
          </div>

          {applySuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                AI-Optimized legs applied to the Visual Strategy Builder above!
              </span>
            </div>
          )}

          {/* Side-by-side Comparison Matrix */}
          <StrategyComparison optimizationResult={result} />

          {/* AI-Optimized Option Legs List */}
          <div className="rounded-xl border border-indigo-950/60 bg-indigo-950/10 p-4">
            <h4 className="text-xs font-semibold text-indigo-300 mb-3 flex items-center space-x-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Recommended AI-Optimized Option Structure:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.optimizedLegs.map((leg) => (
                <div
                  key={leg.id}
                  className="rounded-lg bg-slate-900/90 p-3 border border-indigo-500/30 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">
                      Leg #{leg.legNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        leg.action === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {leg.action} {leg.optionType}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1 font-mono text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Strike:</span>
                      <span className="text-slate-200 font-semibold">
                        {leg.strikePrice}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Quantity:</span>
                      <span className="text-slate-200">{leg.quantity}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Est. Premium:</span>
                      <span className="text-indigo-300">₹{leg.premium}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Optimal SL / Target:</span>
                      <span className="text-slate-300">
                        ₹{leg.stopLoss} / ₹{leg.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

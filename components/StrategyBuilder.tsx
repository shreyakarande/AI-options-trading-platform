'use client';

import React, { useState } from 'react';
import { OptionLeg, OptionAction, OptionType, StrategyValidationErrors } from '@/types';
import {
  AVAILABLE_STRIKES,
  STRATEGY_PRESETS,
  estimatePremium,
  DEFAULT_OPTION_LEGS,
} from '@/mock/strategyData';
import {
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  SlidersHorizontal,
} from 'lucide-react';

interface StrategyBuilderProps {
  legs: OptionLeg[];
  setLegs: React.Dispatch<React.SetStateAction<OptionLeg[]>>;
  onGenerate: () => Promise<void>;
  isGenerating: boolean;
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({
  legs,
  setLegs,
  onGenerate,
  isGenerating,
}) => {
  const [validationErrors, setValidationErrors] = useState<StrategyValidationErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validate the strategy legs
  const validateStrategy = (): boolean => {
    const errors: StrategyValidationErrors = {};
    let hasError = false;

    if (legs.length === 0) {
      errors.general = 'Please add at least one option leg to construct a strategy.';
      setValidationErrors(errors);
      return false;
    }

    const legErrors: NonNullable<StrategyValidationErrors['legs']> = {};

    legs.forEach((leg) => {
      const currentLegErr: Record<string, string> = {};

      if (!leg.quantity || leg.quantity <= 0) {
        currentLegErr.quantity = 'Qty must be > 0';
        hasError = true;
      }
      if (!leg.strikePrice || leg.strikePrice <= 0) {
        currentLegErr.strikePrice = 'Select valid strike';
        hasError = true;
      }
      if (leg.stopLoss === undefined || leg.stopLoss === null || leg.stopLoss < 0) {
        currentLegErr.stopLoss = 'SL must be ≥ 0';
        hasError = true;
      }
      if (!leg.target || leg.target <= 0) {
        currentLegErr.target = 'Target must be > 0';
        hasError = true;
      }

      if (Object.keys(currentLegErr).length > 0) {
        legErrors[leg.id] = currentLegErr;
      }
    });

    if (hasError) {
      errors.legs = legErrors;
      setValidationErrors(errors);
      return false;
    }

    setValidationErrors({});
    return true;
  };

  // Handle generation click
  const handleGenerate = async () => {
    setSuccessMessage(null);
    if (!validateStrategy()) {
      return;
    }
    await onGenerate();
    setSuccessMessage('Strategy metrics, payoff diagram & backtest equity curve updated successfully.');
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Add new blank leg
  const handleAddLeg = () => {
    const newLegNumber = legs.length + 1;
    const defaultStrike = 22450;
    const newLeg: OptionLeg = {
      id: `leg-${Date.now()}`,
      legNumber: newLegNumber,
      action: 'BUY',
      optionType: 'CE',
      strikePrice: defaultStrike,
      quantity: 50,
      stopLoss: 50,
      target: 150,
      premium: estimatePremium(defaultStrike, 'CE'),
    };
    setLegs([...legs, newLeg]);
    setValidationErrors({});
    setSuccessMessage(null);
  };

  // Remove leg
  const handleRemoveLeg = (id: string) => {
    const updated = legs
      .filter((leg) => leg.id !== id)
      .map((leg, idx) => ({ ...leg, legNumber: idx + 1 }));
    setLegs(updated);
    setValidationErrors({});
    setSuccessMessage(null);
  };

  // Update specific leg field
  const handleUpdateLeg = <K extends keyof OptionLeg>(id: string, field: K, value: OptionLeg[K]) => {
    setLegs((prev) =>
      prev.map((leg) => {
        if (leg.id !== id) return leg;

        const updated = { ...leg, [field]: value };

        // Recalculate estimated premium if strike or optionType changed
        if (field === 'strikePrice' || field === 'optionType') {
          updated.premium = estimatePremium(
            field === 'strikePrice' ? (value as number) : leg.strikePrice,
            field === 'optionType' ? (value as OptionType) : leg.optionType
          );
        }

        return updated;
      })
    );

    // Clear specific error
    if (validationErrors.legs?.[id]) {
      const currentLegErrors = { ...validationErrors.legs[id] };
      delete currentLegErrors[field as string];
      setValidationErrors((prev) => ({
        ...prev,
        legs: {
          ...prev.legs,
          [id]: currentLegErrors,
        },
      }));
    }
  };

  // Reset to default Bull Call Spread
  const handleReset = () => {
    setLegs(DEFAULT_OPTION_LEGS);
    setValidationErrors({});
    setSuccessMessage('Reset to standard Bull Call Spread template.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Apply a preset
  const handleApplyPreset = (presetName: string) => {
    const preset = STRATEGY_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;

    const formattedLegs: OptionLeg[] = preset.legs.map((leg, idx) => ({
      id: `preset-${Date.now()}-${idx}`,
      legNumber: idx + 1,
      action: leg.action,
      optionType: leg.optionType,
      strikePrice: leg.strikePrice,
      quantity: leg.quantity,
      stopLoss: leg.stopLoss,
      target: leg.target,
      premium: estimatePremium(leg.strikePrice, leg.optionType),
    }));

    setLegs(formattedLegs);
    setValidationErrors({});
    setSuccessMessage(`Loaded "${preset.name}" preset.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 shadow-sm">
      {/* Top Header & Preset Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="h-4 w-4 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Visual Strategy Builder
            </h3>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              {legs.length} {legs.length === 1 ? 'Leg' : 'Legs'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure multi-leg options structures for NIFTY 50 with custom strikes and stops.
          </p>
        </div>

        {/* Preset Selectors */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1 hidden lg:inline">
            Presets:
          </span>
          {STRATEGY_PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p.name)}
              className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/60 text-slate-300 hover:text-indigo-300 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* General Validation Banner */}
      {validationErrors.general && (
        <div className="mt-3 flex items-center space-x-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{validationErrors.general}</span>
        </div>
      )}

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mt-3 flex items-center space-x-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Legs List / Table */}
      <div className="mt-4 space-y-3">
        {legs.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
            <AlertCircle className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-300">No Option Legs Configured</p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;+ Add Option Leg&quot; or choose a preset above to begin.
            </p>
          </div>
        ) : (
          legs.map((leg) => {
            const legErr = validationErrors.legs?.[leg.id];

            return (
              <div
                key={leg.id}
                className="relative rounded-lg border border-slate-800 bg-slate-950/60 p-3.5 transition-all hover:border-slate-700/80"
              >
                <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-center">
                  {/* Leg Index Badge */}
                  <div className="col-span-2 sm:col-span-1 flex items-center">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-mono font-semibold text-slate-300">
                      #{leg.legNumber}
                    </span>
                  </div>

                  {/* Action Toggle: BUY / SELL */}
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Action
                    </label>
                    <div className="grid grid-cols-2 rounded bg-slate-900 p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleUpdateLeg(leg.id, 'action', 'BUY')}
                        className={`py-1 text-xs font-semibold rounded transition-colors ${
                          leg.action === 'BUY'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        BUY
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateLeg(leg.id, 'action', 'SELL')}
                        className={`py-1 text-xs font-semibold rounded transition-colors ${
                          leg.action === 'SELL'
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        SELL
                      </button>
                    </div>
                  </div>

                  {/* Option Type: CE / PE */}
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Type
                    </label>
                    <div className="grid grid-cols-2 rounded bg-slate-900 p-0.5 border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleUpdateLeg(leg.id, 'optionType', 'CE')}
                        className={`py-1 text-xs font-semibold rounded transition-colors ${
                          leg.optionType === 'CE'
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        CE (Call)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateLeg(leg.id, 'optionType', 'PE')}
                        className={`py-1 text-xs font-semibold rounded transition-colors ${
                          leg.optionType === 'PE'
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        PE (Put)
                      </button>
                    </div>
                  </div>

                  {/* Strike Price Select */}
                  <div className="col-span-2 sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[10px] uppercase font-semibold text-slate-400">
                        Strike Price
                      </label>
                      <span className="text-[10px] font-mono text-indigo-400">
                        ₹{leg.premium}
                      </span>
                    </div>
                    <select
                      value={leg.strikePrice}
                      onChange={(e) =>
                        handleUpdateLeg(leg.id, 'strikePrice', Number(e.target.value))
                      }
                      className={`w-full rounded bg-slate-900 px-2 py-1.5 text-xs font-mono text-slate-100 border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        legErr?.strikePrice
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {AVAILABLE_STRIKES.map((strike) => (
                        <option key={strike} value={strike}>
                          {strike} {strike === 22450 ? '(ATM)' : ''}
                        </option>
                      ))}
                    </select>
                    {legErr?.strikePrice && (
                      <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">
                        {legErr.strikePrice}
                      </span>
                    )}
                  </div>

                  {/* Quantity (lots) */}
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      step="50"
                      min="50"
                      value={leg.quantity}
                      onChange={(e) =>
                        handleUpdateLeg(leg.id, 'quantity', Number(e.target.value))
                      }
                      className={`w-full rounded bg-slate-900 px-2 py-1.5 text-xs font-mono text-slate-100 border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        legErr?.quantity
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    />
                    {legErr?.quantity && (
                      <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">
                        {legErr.quantity}
                      </span>
                    )}
                  </div>

                  {/* Stop Loss (₹ / pts) */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Stop Loss (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={leg.stopLoss}
                      onChange={(e) =>
                        handleUpdateLeg(leg.id, 'stopLoss', Number(e.target.value))
                      }
                      className={`w-full rounded bg-slate-900 px-2 py-1.5 text-xs font-mono text-slate-100 border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        legErr?.stopLoss
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    />
                    {legErr?.stopLoss && (
                      <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">
                        {legErr.stopLoss}
                      </span>
                    )}
                  </div>

                  {/* Target (₹ / pts) */}
                  <div className="col-span-1 sm:col-span-1">
                    <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-1">
                      Target (₹)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={leg.target}
                      onChange={(e) =>
                        handleUpdateLeg(leg.id, 'target', Number(e.target.value))
                      }
                      className={`w-full rounded bg-slate-900 px-2 py-1.5 text-xs font-mono text-slate-100 border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                        legErr?.target
                          ? 'border-rose-500 bg-rose-500/5'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    />
                    {legErr?.target && (
                      <span className="text-[10px] text-rose-400 font-mono mt-0.5 block">
                        {legErr.target}
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <div className="col-span-1 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveLeg(leg.id)}
                      title="Remove Leg"
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer Buttons */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleAddLeg}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
            <span>Add Option Leg</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center space-x-1 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Strategy</span>
          </button>
        </div>

        {/* Primary Generate Strategy Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Generating Analytics...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 text-indigo-200" />
              <span>Generate Strategy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

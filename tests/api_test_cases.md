# API Test Cases

| Test ID | API / Feature | Input | Expected Result |
|---|---|---|---|
| T01 | Backtest | Valid strategy with Buy CE | Returns P&L, Win Rate, Sharpe Ratio and Max Drawdown |
| T02 | Backtest | Empty strategy | Returns a validation error |
| T03 | Backtest | Quantity = 0 | Returns a validation error |
| T04 | Backtest | Negative stop-loss | Returns a validation error |
| T05 | Market Regime | Valid market data | Returns Trending, Range-Bound or Volatile |
| T06 | AI Optimizer | Valid strategy and market regime | Returns optimized stop-loss and target |
| T07 | Health API | Open health endpoint | Returns API is running |
| T08 | Invalid Date | Date range with no data | Returns no-data message |
# Backtest Verification Sheet

## Formula Used

For a Buy option:

Profit/Loss = Exit Premium - Entry Premium

For a Sell option:

Profit/Loss = Entry Premium - Exit Premium

Total P&L = Profit/Loss per unit × Quantity

## Manual Test Cases

| Test ID | Trade Type | Entry | Exit | Quantity | Expected P&L | Actual P&L | Status |
|---|---|---:|---:|---:|---:|---:|---|
| B01 | Buy CE profit | 100 | 120 | 50 | +1000 |  | Pending |
| B02 | Buy PE loss | 80 | 70 | 50 | -500 |  | Pending |
| B03 | Sell CE profit | 150 | 130 | 50 | +1000 |  | Pending |
| B04 | Sell PE loss | 90 | 110 | 50 | -1000 |  | Pending |

## Metrics to Verify
- Total P&L
- Total number of trades
- Win Rate
- Sharpe Ratio
- Maximum Drawdown
# Dataset Preparation and Preprocessing

## Dataset Used
Historical Nifty 50 price data and India VIX data were collected using the yfinance library.

## Input Features
- Open price
- High price
- Low price
- Close price
- Volume
- India VIX

## Preprocessing Steps
1. Downloaded historical Nifty 50 and India VIX data.
2. Selected only relevant market columns.
3. Merged both datasets using the trading date.
4. Removed rows containing missing values.
5. Renamed columns into lowercase consistent names.
6. Saved the cleaned final dataset as `nifty_market_data.csv`.

## Output Dataset
The cleaned dataset is used by the backend for:
- Calculating technical indicators
- Identifying market regime
- Backtesting strategies
- Generating AI-based strategy suggestions
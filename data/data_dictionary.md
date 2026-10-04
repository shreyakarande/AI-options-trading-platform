# Nifty Market Dataset – Data Dictionary

## Source
Historical Nifty 50 and India VIX data collected using yfinance.

## Purpose
Used for market-regime prediction and educational backtesting in the AI Options Trading Platform.

| Column | Meaning |
|---|---|
| date | Trading date |
| open | Nifty opening price |
| high | Highest price of the day |
| low | Lowest price of the day |
| close | Nifty closing price |
| volume | Available trading volume |
| india_vix | India VIX value, indicating expected market volatility |

## Data Cleaning
- Selected only required columns.
- Combined Nifty 50 and India VIX data by date.
- Removed missing values.
- Used consistent lowercase column names.
- Kept data in date order.

## Disclaimer
This dataset is for educational AI/ML analysis and paper-backtesting only. It is not investment advice.
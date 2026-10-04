import pandas as pd
import yfinance as yf

nifty = yf.download("^NSEI", period="5y", interval="1d", auto_adjust=False)
vix = yf.download("^INDIAVIX", period="5y", interval="1d", auto_adjust=False)

nifty = nifty[["Open", "High", "Low", "Close", "Volume"]].copy()
vix = vix[["Close"]].copy()

nifty.columns = ["open", "high", "low", "close", "volume"]
vix.columns = ["india_vix"]

data = nifty.join(vix, how="left")
data = data.dropna().reset_index()
data = data.rename(columns={"Date": "date"})

data.to_csv("data/nifty_market_data.csv", index=False)

print("Dataset created successfully!")
print(data.head())
print("Total rows:", len(data))
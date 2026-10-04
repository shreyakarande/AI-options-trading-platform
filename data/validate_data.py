import pandas as pd

data = pd.read_csv("data/nifty_market_data.csv")

required_columns = ["date", "open", "high", "low", "close", "volume", "india_vix"]

print("Total rows:", len(data))
print("Columns:", list(data.columns))
print("\nMissing values:")
print(data.isnull().sum())

print("\nDuplicate rows:", data.duplicated().sum())

invalid_price_rows = data[
    (data["open"] <= 0) |
    (data["high"] <= 0) |
    (data["low"] <= 0) |
    (data["close"] <= 0) |
    (data["high"] < data["low"])
]

print("Invalid price rows:", len(invalid_price_rows))

missing_columns = [column for column in required_columns if column not in data.columns]
print("Missing required columns:", missing_columns)

report = f"""DATA QUALITY REPORT

Total rows: {len(data)}
Columns: {list(data.columns)}
Duplicate rows: {data.duplicated().sum()}
Invalid price rows: {len(invalid_price_rows)}
Missing required columns: {missing_columns}

Missing values:
{data.isnull().sum().to_string()}
"""

with open("data/data_quality_report.txt", "w") as file:
    file.write(report)

print("\nData quality report saved successfully!")
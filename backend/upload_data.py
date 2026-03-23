import pandas as pd
from pymongo import MongoClient

# 🔥 MongoDB connection
client = MongoClient("mongodb+srv://repogen:repogen123@cluster0.vsupc9p.mongodb.net/edwisely_db?retryWrites=true&w=majority")

db = client["edwisely_db"]

# 📊 LOAD CSV (CHANGE FILE NAME HERE)
df = pd.read_csv("StudentsPerformance.csv")

# 🔥 PRINT TO CHECK
print(df.head())

# ✅ CLEAN COLUMN NAMES (IMPORTANT)
df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

# convert to dictionary
data = df.to_dict(orient="records")

# insert into MongoDB
db.student_performance.insert_many(data)

print("✅ FULL CSV DATA UPLOADED SUCCESSFULLY")
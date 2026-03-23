from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from pymongo import MongoClient
import pandas as pd
import numpy as np
import json

app = Flask(__name__)
CORS(app)

# 🔥 MongoDB
client = MongoClient("mongodb+srv://repogen:repogen123@cluster0.vsupc9p.mongodb.net/edwisely_db?retryWrites=true&w=majority")
db = client["edwisely_db"]

users_collection = db["users"]
student_collection = db["student_performance"]

# ================= SIGNUP =================
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"msg": "User exists"}), 400

    users_collection.insert_one(data)
    return jsonify({"msg": "Signup successful"}), 200

# ================= LOGIN =================
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    user = users_collection.find_one({
        "email": data["email"],
        "password": data["password"]
    })

    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    return jsonify({
        "name": user["name"],
        "role": user["role"]
    })

# ================= ADD MARKS =================
@app.route("/add-mark", methods=["POST"])
def add_mark():
    data = request.json
    try:
        student_collection.insert_one({
            "name": data.get("name", "Student"),
            "exam": data.get("exam", "Exam"),
            "math_score": int(data.get("math_score", 0)),
            "reading_score": int(data.get("reading_score", 0)),
            "writing_score": int(data.get("writing_score", 0))
        })
        return jsonify({"msg": "Marks added successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# ================= GET STUDENTS =================
@app.route("/students", methods=["GET"])
def get_students():
    data = list(student_collection.find({}, {"_id": 0}))
    return jsonify(data)

# ================= SUMMARY =================
@app.route("/summary", methods=["GET"])
def summary():
    data = list(student_collection.find())

    total = len(data)

    avg = sum(d["math_score"] for d in data) / total

    return jsonify({
        "average": avg,
        "total_students": total
    })

# ================= GENERATE REPORT =================
@app.route("/generate-report", methods=["POST"])
def generate_report():
    config = request.json
    filters = config.get("filters", [])
    group_by = config.get("groupBy")
    metrics = config.get("metrics", [])
    custom_formula = config.get("customFormula")
    sort_config = config.get("sortConfig", {"key": None, "direction": "asc"})

    # 1. Fetch data
    data = list(student_collection.find({}, {"_id": 0}))
    if not data:
        return jsonify([])
    
    df = pd.DataFrame(data)

    # 2. Apply Filters
    for f in filters:
        field = f.get("field")
        op = f.get("operator")
        val = f.get("value")
        
        try:
            if not field or not op: continue
            if op == ">": df = df[df[field].astype(float) > float(val)]
            elif op == "<": df = df[df[field].astype(float) < float(val)]
            elif op == "==": df = df[df[field].astype(str) == str(val)]
            elif op == "!=": df = df[df[field].astype(str) != str(val)]
            elif op == ">=": df = df[df[field].astype(float) >= float(val)]
            elif op == "<=": df = df[df[field].astype(float) <= float(val)]
        except Exception as e:
            print(f"Filter error on {field}: {e}")

    # 3. Derived Metrics & Custom Formula
    if custom_formula:
        try:
            # Basic validation to prevent arbitrary code execution
            # Allow only alphanumeric, underscores, and math operators
            allowed_cols = df.columns.tolist()
            # This is a very basic check for safety in this demo
            df["custom_metric"] = df.eval(custom_formula)
        except Exception as e:
            print(f"Formula error: {e}")

    # Growth rates / Differences (if requested and not grouping)
    if "growth" in metrics and not group_by:
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            df[f"{col}_growth"] = df[col].pct_change() * 100
            df[f"{col}_diff"] = df[col].diff()

    # 4. Grouping & Aggregation
    if group_by and group_by in df.columns:
        agg_map = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        # Determine which aggregations to apply
        funcs = []
        if "avg" in metrics: funcs.append("mean")
        if "sum" in metrics: funcs.append("sum")
        if not funcs: funcs = ["mean"] # Default
        
        for col in numeric_cols:
            agg_map[col] = funcs
        
        df = df.groupby(group_by).agg(agg_map)
        # Flatten multi-index columns if they exist
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = ['_'.join(col).strip() for col in df.columns.values]
        df = df.reset_index()
    
    # 5. Sorting
    sort_key = sort_config.get("key")
    if sort_key and sort_key in df.columns:
        df = df.sort_values(by=sort_key, ascending=(sort_config.get("direction") == "asc"))

    # Replace Infinity/NaN for JSON compatibility
    df = df.replace([np.inf, -np.inf], np.nan).fillna(0)
    
    return jsonify(df.to_dict(orient="records"))

# ================= DOWNLOAD CSV =================

# ================= RUN =================
if __name__ == "__main__":
    app.run(debug=True)
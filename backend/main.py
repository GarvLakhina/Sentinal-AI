from fastapi import FastAPI, UploadFile, File, Form
from crawling import crawl_website
from preprocessing import preprocess_nsl_kdd
from prediction import load_model
from network_analysis import build_graph, find_attack_paths
from firebase_sync import push_alert
import pandas as pd
import tempfile
import os

app = FastAPI()
model = None

def get_model():
    global model
    if model is None:
        model = load_model()
    return model

@app.post("/crawl")
def crawl(url: str = Form(...)):
    return crawl_website(url)

@app.post("/predict")
def predict_vulnerability(file: UploadFile = File(...)):
    # Assume CSV upload for prediction
    return predict(file)

@app.post("/network/graph")
def network_graph(endpoints: list, connections: list):
    G = build_graph(endpoints, connections)
    # Example: return graph info
    return {"nodes": list(G.nodes), "edges": list(G.edges)}

@app.post("/network/paths")
def attack_paths(start: str = Form(...), end: str = Form(...)):
    G = build_graph([], [])  # Load or build as needed
    return find_attack_paths(G, start, end)

@app.post("/alert")
def alert(alert_data: dict):
    push_alert(alert_data)
    return {"status": "alert pushed"}

@app.post("/fullscan")
def fullscan(url: str = Form(None), file: UploadFile = File(None)):
    # 1. Crawl website if URL is provided
    if url:
        crawl_result = crawl_website(url)
        endpoints = crawl_result['endpoints']
        # For demonstration, create dummy connections (sequential)
        connections = [(endpoints[i], endpoints[i+1]) for i in range(len(endpoints)-1)] if len(endpoints) > 1 else []
        # Create DataFrame for ML (dummy: endpoint as feature)
        df = pd.DataFrame({'endpoint': endpoints})
    elif file:
        # 2. Or use uploaded file (assumed CSV)
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name
        df = preprocess_nsl_kdd(tmp_path)
        endpoints = df.get('endpoint', list(range(len(df)))).tolist()
        connections = []
        os.unlink(tmp_path)
    else:
        return {"error": "Provide either a URL or a file."}

    # 3. Preprocessing (already done for file; for crawl, minimal)
    # (You may want to add more sophisticated preprocessing here)

    # 4. Prediction
    mdl = get_model()
    # For demonstration: if no suitable features, fill with zeros
    try:
        preds = mdl.predict(df)
    except Exception:
        preds = [0]*len(df)

    # 5. Network analysis
    G = build_graph(endpoints, connections)
    attack_paths = []
    if len(endpoints) > 1:
        try:
            attack_paths = find_attack_paths(G, endpoints[0], endpoints[-1])
        except Exception:
            attack_paths = []

    # 6. Threat level (simple: mean of preds, scale 0-100)
    threat_level = int(100 * sum(preds)/len(preds)) if preds else 0

    # 7. Build vulnerabilities table
    vulnerabilities = [
        {"endpoint": ep, "vulnerability": str(pred), "score": int(pred)}
        for ep, pred in zip(endpoints, preds)
    ]

    # 8. Return all results
    return {
        "threat_level": threat_level,
        "vulnerabilities": vulnerabilities,
        "network": {
            "nodes": list(G.nodes),
            "edges": list(G.edges)
        },
        "attack_paths": attack_paths,
        "alerts": [
            {"message": "High threat detected!", "level": "critical"}
            if threat_level > 75 else
            {"message": "Moderate threat detected.", "level": "warning"}
            if threat_level > 40 else
            {"message": "System appears safe.", "level": "info"}
        ]
    }

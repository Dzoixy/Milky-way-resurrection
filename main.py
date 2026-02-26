import os # เพิ่ม os เข้ามา
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uvicorn

app = FastAPI(title="Milky Way CDSS Backend")

# 1. หาตำแหน่งโฟลเดอร์ปัจจุบันที่ไฟล์ main.py อยู่
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 2. นำไปเชื่อมกับชื่อโฟลเดอร์ static และ templates (ทำให้เซิร์ฟเวอร์หาเจอแน่นอน)
app.mount("/static", StaticFiles(directory=os.path.join(BASE_DIR, "static")), name="static")
templates = Jinja2Templates(directory=os.path.join(BASE_DIR, "templates"))

# ... (โค้ดส่วนอื่นๆ คงไว้เหมือนเดิม) ...

# กำหนดโฟลเดอร์สำหรับไฟล์ HTML
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def serve_frontend(request: Request):
    """เสิร์ฟหน้าเว็บหลัก"""
    return templates.TemplateResponse("index.html", {"request": request})

@app.post("/api/calculate_risk")
async def calculate_risk_async(data: dict):
    """
    Endpoint ตัวอย่างสำหรับการคำนวณความเสี่ยงด้วย Python
    ในอนาคตคุณสามารถย้าย Logic การคำนวณจาก JavaScript หรือเรียกใช้ ML Model ที่นี่ได้
    """
    # ตัวอย่างการรับข้อมูลและส่งกลับ
    # risk_score = await my_ml_model.predict(data)
    
    return {
        "status": "success",
        "message": "Data received successfully",
        "received_data": data
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
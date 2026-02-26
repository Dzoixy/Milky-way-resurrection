from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import uvicorn

app = FastAPI(title="Milky Way CDSS")

# กำหนดโฟลเดอร์สำหรับไฟล์ Static (CSS, JS)
app.mount("/static", StaticFiles(directory="static"), name="static")

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
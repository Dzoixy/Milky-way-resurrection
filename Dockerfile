FROM continuumio/miniconda3

WORKDIR /app

# ก๊อปปี้ไฟล์ environment และติดตั้ง
COPY environment.yml .
RUN conda env create -f environment.yml

# ก๊อปปี้โค้ดทั้งหมดลงไป
COPY . .

# ตั้งค่าให้รันผ่าน environment ที่สร้างไว้
SHELL ["conda", "run", "-n", "milkyway", "/bin/bash", "-c"]

# Render กำหนดให้ใช้ Port 10000 เป็นค่าเริ่มต้น (สามารถตั้งค่าใน Dashboard ได้)
CMD ["conda", "run", "-n", "milkyway", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "10000"]
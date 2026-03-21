from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Optional
from ..services.metrics import process_freshdesk_csv
import traceback

router = APIRouter()

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        content = await file.read()
        metrics = process_freshdesk_csv(content, start_date, end_date)
        return metrics
    except Exception as e:
        full_trace = traceback.format_exc()
        print("=== UPLOAD ERROR ===")
        print(full_trace)
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, File, UploadFile, HTTPException
from ..services.metrics import process_freshdesk_csv

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    try:
        content = await file.read()
        metrics = process_freshdesk_csv(content)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

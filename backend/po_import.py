# --- PO Search endpoint ---
from fastapi import Query
from datetime import datetime

@app.get("/po/search")
def search_pos(
    po_number: str = Query(None),
    vendor: str = Query(None),
    status: str = Query(None),
    start_date: str = Query(None),
    end_date: str = Query(None),
    min_amount: float = Query(None),
    max_amount: float = Query(None),
    keyword: str = Query(None),
    user: str = Depends(get_current_user)
):
    results = po_store
    # Filter by PO number
    if po_number:
        results = [po for po in results if po.get('po_number', '').lower() == po_number.lower()]
    # Filter by vendor
    if vendor:
        results = [po for po in results if vendor.lower() in po.get('vendor', '').lower()]
    # Filter by status
    if status:
        results = [po for po in results if po.get('status', '').lower() == status.lower()]
    # Filter by date range (assume po_date is YYYY-MM-DD)
    if start_date:
        try:
            sd = datetime.strptime(start_date, '%Y-%m-%d')
            results = [po for po in results if 'po_date' in po and po['po_date'] and datetime.strptime(po['po_date'], '%Y-%m-%d') >= sd]
        except Exception:
            pass
    if end_date:
        try:
            ed = datetime.strptime(end_date, '%Y-%m-%d')
            results = [po for po in results if 'po_date' in po and po['po_date'] and datetime.strptime(po['po_date'], '%Y-%m-%d') <= ed]
        except Exception:
            pass
    # Filter by amount range
    if min_amount is not None:
        results = [po for po in results if float(po.get('amount', 0)) >= min_amount]
    if max_amount is not None:
        results = [po for po in results if float(po.get('amount', 0)) <= max_amount]
    # Keyword search (multi-field)
    if keyword:
        kw = keyword.lower()
        def match(po):
            return any(kw in str(po.get(f, '')).lower() for f in ['po_number', 'vendor', 'status', 'remarks', 'department', 'project_name'])
        results = [po for po in results if match(po)]
    return {"items": results}
from pydantic import BaseModel
from typing import List

class PurchaseOrder(BaseModel):
    po_number: str
    vendor: str
    amount: float
    status: str

# In-memory PO store for demo
po_store = []

# --- Import endpoint ---
from fastapi import UploadFile, File, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
import os

SECRET_KEY = os.environ.get('SECRET_KEY', 'supersecretkey')
ALGORITHM = os.environ.get('ALGORITHM', 'HS256')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = payload.get("sub")
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
import csv

@app.post("/po/import")
def import_po(file: UploadFile = File(...), user: str = Depends(get_current_user)):
    try:
        content = file.file.read().decode()
        reader = csv.DictReader(content.splitlines())
        imported = []
        errors = []
        for i, row in enumerate(reader):
            try:
                po = PurchaseOrder(
                    po_number=row["PO Number"],
                    vendor=row["Vendor"],
                    amount=float(row["Amount"]),
                    status=row["Status"]
                )
                po_store.append(po.dict())
                imported.append(po.po_number)
            except Exception as e:
                errors.append({"row": i+2, "error": str(e)})
        return {"imported": imported, "errors": errors}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Import failed: {e}")

@app.get("/po/list")
def list_pos(user: str = Depends(get_current_user)):

# Add similar protection for /po/add and /po/search if present
    return {"items": po_store}

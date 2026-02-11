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
from fastapi import UploadFile, File
import csv

@app.post("/po/import")
def import_po(file: UploadFile = File(...)):
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
def list_pos():
    return {"items": po_store}

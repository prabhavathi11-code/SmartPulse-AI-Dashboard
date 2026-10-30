from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import Notification
from app.schemas import NotificationResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    limit: int = Query(15, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return db.query(Notification).order_by(desc(Notification.created_at)).limit(limit).all()

@router.put("/{notif_id}/read")
def mark_as_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"success": True}

@router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).update({Notification.is_read: True})
    db.commit()
    return {"success": True}


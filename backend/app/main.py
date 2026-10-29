import os
import secrets
from datetime import timezone
from fastapi import FastAPI, Depends, HTTPException, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import select
from .database import Base, engine, get_db
from .models import User, CheckoutSubmission
from .schemas import (
    RegistrationRequest, RegistrationResponse, RecognitionResponse,
    VerifyOTPRequest, UserResponse, CheckoutRequest, CheckoutResponse
)
from .security import generate_otp, create_otp_material, verify_otp_hash, utc_now

Base.metadata.create_all(bind=engine)
app = FastAPI(title="Bolt OTP Checkout API", version="1.0.0")
origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])
SESSION_COOKIE = "bolt_session"
SESSION_COOKIE_SECURE = os.getenv("SESSION_COOKIE_SECURE", "false").lower() == "true"

@app.get("/api/health")
def health():
    return {"status": "ok"}

@app.post("/api/register", response_model=RegistrationResponse, status_code=201)
def register(payload: RegistrationRequest, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    otp = generate_otp()
    otp_hash, otp_salt, expires = create_otp_material(otp)
    user = User(email=email, first_name=payload.first_name.strip(), last_name=payload.last_name.strip(),
                otp_hash=otp_hash, otp_salt=otp_salt, otp_expires_at=expires)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=409, detail="Could not register this email. It may already be registered.")
    # Returning the OTP is intentional for the assignment's demo requirement.
    return RegistrationResponse(message="Registration successful. Save this demo OTP for login.",
                                email=email, otp=otp)

@app.get("/api/recognize", response_model=RecognitionResponse)
def recognize(email: str, db: Session = Depends(get_db)):
    from pydantic import TypeAdapter, EmailStr, ValidationError
    try:
        normalized = str(TypeAdapter(EmailStr).validate_python(email)).lower().strip()
    except ValidationError:
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    user = db.scalar(select(User).where(User.email == normalized))
    if not user:
        return RecognitionResponse(registered=False)
    return RecognitionResponse(registered=True, first_name=user.first_name, last_name=user.last_name)

@app.post("/api/verify-otp", response_model=UserResponse)
def verify_otp(payload: VerifyOTPRequest, response: Response, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or OTP.")
    expires = user.otp_expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if utc_now() > expires:
        raise HTTPException(status_code=401, detail="This OTP has expired. Register a new demo account to continue.")
    if not verify_otp_hash(payload.otp, user.otp_hash, user.otp_salt):
        raise HTTPException(status_code=401, detail="Incorrect OTP. Please try again.")
    # One-time use: invalidate the OTP after successful verification.
    replacement_hash, replacement_salt, replacement_expiry = create_otp_material(secrets.token_hex(8))
    user.otp_hash, user.otp_salt, user.otp_expires_at = replacement_hash, replacement_salt, replacement_expiry
    db.commit()
    response.set_cookie(key=SESSION_COOKIE, value=str(user.id), httponly=True,
                        secure=SESSION_COOKIE_SECURE, samesite="lax", max_age=28800, path="/")
    return user

def get_session_user(request: Request, db: Session):
    raw_id = request.cookies.get(SESSION_COOKIE)
    if not raw_id or not raw_id.isdigit():
        return None
    return db.get(User, int(raw_id))

@app.get("/api/me", response_model=UserResponse)
def me(request: Request, db: Session = Depends(get_db)):
    user = get_session_user(request, db)
    if not user:
        raise HTTPException(status_code=401, detail="Not logged in.")
    return user

@app.post("/api/logout")
def logout(response: Response):
    response.delete_cookie(key=SESSION_COOKIE, path="/")
    return {"message": "Logged out."}

@app.post("/api/checkout", response_model=CheckoutResponse, status_code=201)
def checkout(payload: CheckoutRequest, request: Request, db: Session = Depends(get_db)):
    email = str(payload.email).lower().strip()
    session_user = get_session_user(request, db)
    matched_user_id = session_user.id if session_user and session_user.email == email else None
    record = CheckoutSubmission(user_id=matched_user_id, email=email,
                                phone=payload.phone.strip(), shipping_address=payload.shipping_address.strip())
    db.add(record)
    db.commit()
    db.refresh(record)
    return CheckoutResponse(message="Checkout details saved successfully.", checkout_id=record.id)

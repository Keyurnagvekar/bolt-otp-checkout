import hashlib
import hmac
import secrets
import string
from datetime import datetime, timedelta, timezone

OTP_TTL_MINUTES = 10

def generate_otp() -> str:
    return "".join(secrets.choice(string.digits) for _ in range(6))

def hash_otp(otp: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac("sha256", otp.encode(), salt.encode(), 120_000).hex()

def create_otp_material(otp: str):
    salt = secrets.token_hex(16)
    expires = datetime.now(timezone.utc) + timedelta(minutes=OTP_TTL_MINUTES)
    return hash_otp(otp, salt), salt, expires

def verify_otp_hash(otp: str, expected_hash: str, salt: str) -> bool:
    return hmac.compare_digest(hash_otp(otp, salt), expected_hash)

def utc_now():
    return datetime.now(timezone.utc)

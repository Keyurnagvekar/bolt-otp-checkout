import os
import uuid
os.environ["DATABASE_URL"] = "sqlite:///./test_otp_checkout.db"
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine
import pytest

@pytest.fixture()
def client():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)

def test_register_recognize_verify_and_checkout(client):
    email = f"candidate-{uuid.uuid4().hex[:8]}@example.com"
    response = client.post("/api/register", json={"email": email, "first_name": "Keyur", "last_name": "Tester"})
    assert response.status_code == 201
    otp = response.json()["otp"]
    assert len(otp) == 6 and otp.isdigit()
    assert client.get("/api/recognize", params={"email": email}).json()["registered"] is True
    wrong_otp = "000000" if otp != "000000" else "111111"
    assert client.post("/api/verify-otp", json={"email": email, "otp": wrong_otp}).status_code == 401
    login = client.post("/api/verify-otp", json={"email": email, "otp": otp})
    assert login.status_code == 200
    assert login.json()["first_name"] == "Keyur"
    checkout = client.post("/api/checkout", json={
        "email": email, "phone": "+91 9876543210", "shipping_address": "123 Test Street, Bengaluru"
    })
    assert checkout.status_code == 201
    assert checkout.json()["checkout_id"] > 0

def test_duplicate_registration_rejected(client):
    email = f"duplicate-{uuid.uuid4().hex[:8]}@example.com"
    body = {"email": email, "first_name": "Test", "last_name": "User"}
    assert client.post("/api/register", json=body).status_code == 201
    assert client.post("/api/register", json=body).status_code == 409

def test_unknown_email_not_registered(client):
    email = f"unknown-{uuid.uuid4().hex}@example.com"
    assert client.get("/api/recognize", params={"email": email}).json()["registered"] is False

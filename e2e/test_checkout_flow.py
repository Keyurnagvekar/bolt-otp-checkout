import os
import re
from playwright.sync_api import Page, expect

BASE_URL = os.getenv("BASE_URL", "http://localhost:5173")

def test_registration_and_otp_login(page: Page):
    page.goto(BASE_URL)
    email = f"e2e-{page.evaluate('Date.now()')}@example.com"
    page.get_by_role("button", name="Register").click()
    page.get_by_label("Registration email").fill(email)
    page.get_by_label("First name").fill("Taylor")
    page.get_by_label("Last name").fill("Morgan")
    page.get_by_role("button", name=re.compile("Create account")).click()
    otp_locator = page.get_by_label("Generated OTP")
    expect(otp_locator).to_be_visible()
    otp = otp_locator.inner_text()
    assert re.fullmatch(r"\d{6}", otp)
    page.get_by_role("button", name="Continue to Checkout").click()
    page.get_by_label("Checkout email").fill(email)
    page.get_by_label("Phone number").fill("+91 9876543210")
    page.get_by_label("Shipping address").fill("123 Test Street, Bengaluru")
    expect(page.get_by_role("dialog")).to_be_visible()
    page.get_by_label("One-time code").fill(otp)
    page.get_by_role("button", name=re.compile("Verify and continue")).click()
    expect(page.get_by_text("Taylor Morgan")).to_be_visible()
    page.get_by_role("button", name=re.compile("Save checkout details")).click()
    expect(page.get_by_text(re.compile("Checkout details saved successfully"))).to_be_visible()

def test_unknown_email_can_checkout_as_guest(page: Page):
    page.goto(BASE_URL)
    page.get_by_label("Checkout email").fill("guest-checkout@example.com")
    page.get_by_label("Phone number").fill("+91 9999999999")
    page.get_by_label("Shipping address").fill("22 Example Road, Bengaluru")
    page.get_by_role("button", name=re.compile("Save checkout details")).click()
    expect(page.get_by_text(re.compile("Checkout details saved successfully"))).to_be_visible()

from pydantic import BaseModel, EmailStr, Field, ConfigDict

class RegistrationRequest(BaseModel):
    email: EmailStr
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)

class RegistrationResponse(BaseModel):
    message: str
    email: EmailStr
    otp: str

class RecognitionResponse(BaseModel):
    registered: bool
    first_name: str | None = None
    last_name: str | None = None

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(pattern=r"^\d{6}$")

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    first_name: str
    last_name: str
    model_config = ConfigDict(from_attributes=True)

class CheckoutRequest(BaseModel):
    email: EmailStr
    phone: str = Field(min_length=5, max_length=40)
    shipping_address: str = Field(min_length=5, max_length=2000)

class CheckoutResponse(BaseModel):
    message: str
    checkout_id: int

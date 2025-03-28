from pydantic import BaseModel
from datetime import datetime

class Vacancy(BaseModel):
    id: int
    created_at: datetime
    status: str
    company_name: str
    company_address: str
    logo_url: str
    description: str

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class RefreshToken(BaseModel):
    refresh_token: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
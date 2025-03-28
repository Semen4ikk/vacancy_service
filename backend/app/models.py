from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from passlib.context import CryptContext

Base = declarative_base()


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class Vacancy(Base):
    __tablename__ = 'vacancies'

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    company_address = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    description = Column(String, nullable=False)

    def __repr__(self):
        return f"<Vacancy(id={self.id}, company_name={self.company_name}, status={self.status})>"


class UserToken(Base):
    __tablename__ = "user_tokens"

    id = Column(Integer, primary_key=True, index=True)
    access_token = Column(String, nullable=False)
    refresh_token = Column(String, nullable=False, unique=True)
    expires_in = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def verify_password(self, plain_password: str) -> bool:
        return pwd_context.verify(plain_password, self.hashed_password)
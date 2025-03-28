from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
from .database import engine, Base
from .routers import vacancy, auth



app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(vacancy.router, prefix="/api/v1/vacancy", tags=["vacancies"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])


@app.on_event("startup")
def startup():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully.")
    except SQLAlchemyError as e:
        print(f"Error creating database tables: {e}")

@app.get("/")
async def root():
    return {"message": "Welcome to the Vacancy Service API!"}
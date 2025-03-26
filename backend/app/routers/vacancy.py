from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
import aiohttp
import logging
from .. import schemas, crud, models
from ..database import get_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

HH_API_URL = "https://api.hh.ru/vacancies"

async def fetch_vacancy_from_hh(vacancy_id: str):

    async with aiohttp.ClientSession() as session:
        async with session.get(f"{HH_API_URL}/{vacancy_id}") as response:
            if response.status == 200:
                return await response.json()
            else:
                logger.error(f"Error fetching vacancy from hh.ru: status={response.status}")
                raise HTTPException(status_code=response.status, detail="Error fetching vacancy from hh.ru")


@router.post("/create", response_model=schemas.Vacancy)
async def create_vacancy(vacancy_id: str, db: Session = Depends(get_db)):
    logger.info(f"Fetching vacancy with ID: {vacancy_id} from hh.ru")
    vacancy_data = await fetch_vacancy_from_hh(vacancy_id)

    existing_vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    if existing_vacancy:
        logger.error(f"Vacancy with ID {vacancy_id} already exists in the database")
        raise HTTPException(status_code=400, detail="Vacancy already exists")

    employer = vacancy_data.get("employer", {})
    address = vacancy_data.get("address", {})
    vacancy = models.Vacancy(
        id=vacancy_id,
        status=vacancy_data.get("status", "unknown"),
        company_name=employer.get("name", "N/A"),
        company_address=address.get("formatted", "N/A") if address else "N/A",
        logo_url=employer.get("logo", {}).get("url", "N/A"),
        description=vacancy_data.get("description", "N/A")
    )

    db.add(vacancy)
    db.commit()
    db.refresh(vacancy)
    logger.info(f"Vacancy created: {vacancy.company_name}")
    return vacancy

@router.put("/update/{vacancy_id}", response_model=schemas.Vacancy)
async def update_vacancy(vacancy_id: str, db: Session = Depends(get_db)):
    logger.info(f"Updating vacancy with ID: {vacancy_id}")

    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    if not vacancy:
        logger.error(f"Vacancy with ID {vacancy_id} not found in the database")
        raise HTTPException(status_code=404, detail="Vacancy not found")


    vacancy_data = await fetch_vacancy_from_hh(vacancy_id)

    employer = vacancy_data.get("employer", {})
    address = vacancy_data.get("address", {})
    vacancy.status = vacancy_data.get("status", vacancy.status)
    vacancy.company_name = employer.get("name", vacancy.company_name)
    vacancy.company_address = address.get("formatted", vacancy.company_address) if address else vacancy.company_address  # Добавлена проверка на None
    vacancy.logo_url = employer.get("logo", {}).get("url", vacancy.logo_url)
    vacancy.description = vacancy_data.get("description", vacancy.description)

    db.commit()
    db.refresh(vacancy)
    logger.info(f"Vacancy updated: {vacancy.company_name}")
    return vacancy


@router.get("/list", response_model=List[schemas.Vacancy])
def list_vacancies(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):

    logger.info(f"Listing vacancies with skip={skip}, limit={limit}")
    vacancies = db.query(models.Vacancy).offset(skip).limit(limit).all()
    return vacancies


@router.get("/get/{vacancy_id}", response_model=schemas.Vacancy)
def get_vacancy(vacancy_id: str, db: Session = Depends(get_db)):

    logger.info(f"Fetching vacancy with ID: {vacancy_id}")
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    if vacancy is None:
        logger.error(f"Vacancy with ID {vacancy_id} not found in the database")
        raise HTTPException(status_code=404, detail="Vacancy not found")
    return vacancy


@router.delete("/delete/{vacancy_id}", response_model=schemas.Vacancy)
def delete_vacancy(vacancy_id: str, db: Session = Depends(get_db)):

    logger.info(f"Deleting vacancy with ID: {vacancy_id}")
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    if vacancy is None:
        logger.error(f"Vacancy with ID {vacancy_id} not found in the database")
        raise HTTPException(status_code=404, detail="Vacancy not found")

    db.delete(vacancy)
    db.commit()
    logger.info(f"Vacancy deleted: {vacancy_id}")
    return vacancy
from sqlalchemy.orm import Session

from . import models, schemas

def create_vacancy(db: Session, vacancy: schemas.Vacancy) -> models.Vacancy:
    db_vacancy = models.Vacancy(
        status=vacancy.status,
        company_name=vacancy.company_name,
        company_address=vacancy.company_address,
        logo_url=vacancy.logo_url,
        description=vacancy.description
    )
    db.add(db_vacancy)
    db.commit()
    db.refresh(db_vacancy)
    return db_vacancy

def get_vacancy(db: Session, vacancy_id: int) -> models.Vacancy:
    return db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()

def get_vacancies(db: Session, skip: int = 0, limit: int = 10) -> list[models.Vacancy]:
    return db.query(models.Vacancy).offset(skip).limit(limit).all()

def update_vacancy(db: Session, vacancy_id: int, vacancy_data: schemas.Vacancy) -> models.Vacancy:
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    if vacancy:
        vacancy.status = vacancy_data.status
        vacancy.company_name = vacancy_data.company_name
        vacancy.company_address = vacancy_data.company_address
        vacancy.logo_url = vacancy_data.logo_url
        vacancy.description = vacancy_data.description
        db.commit()
        db.refresh(vacancy)
        return vacancy
    return None

def delete_vacancy(db: Session, vacancy_id: int) -> models.Vacancy:
    vacancy = db.query(models.Vacancy).filter(models.Vacancy.id == vacancy_id).first()
    if vacancy:
        db.delete(vacancy)
        db.commit()
        return vacancy
    return None


def create_user_token(db: Session, access_token: str, refresh_token: str, expires_in: int) -> models.UserToken:
    user_token = models.UserToken(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=expires_in
    )
    db.add(user_token)
    db.commit()
    db.refresh(user_token)
    return user_token

def get_user_token(db: Session, refresh_token: str) -> models.UserToken:
    return db.query(models.UserToken).filter(models.UserToken.refresh_token == refresh_token).first()

def update_user_token(db: Session, refresh_token: str, access_token: str, new_refresh_token: str, expires_in: int) -> models.UserToken:
    user_token = get_user_token(db, refresh_token)
    if user_token:
        user_token.access_token = access_token
        user_token.refresh_token = new_refresh_token
        user_token.expires_in = expires_in
        db.commit()
        db.refresh(user_token)
        return user_token
    return None
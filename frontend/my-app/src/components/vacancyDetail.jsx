import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/token';
import { useParams, useNavigate } from 'react-router-dom';
import styles from '../CSS/VacancyDetails.module.css';

const VacancyDetails = () => {
    const { accessToken } = useAuth();
    const { vacancyId } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVacancyDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/v1/vacancy/get/${vacancyId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setVacancy(response.data);
            } catch (error) {
                console.error('Failed to fetch vacancy details:', error);
                if (error.response) {
                    console.error('Server responded with:', error.response.data);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVacancyDetails();
    }, [accessToken, vacancyId]);

    if (loading) {
        return <div className={styles['vacancy-details-page']}>Загрузка...</div>;
    }

    if (!vacancy) {
        return <div className={styles['vacancy-details-page']}>Вакансия не найдена.</div>;
    }

    return (
        <div className={styles['vacancy-details-page']}>
            <h2>Детали вакансии</h2>
            <div className={styles['details-container']}>
                <p><strong>Когда была создана:</strong> {new Date(vacancy.created_at).toLocaleDateString()}</p>
                <p><strong>Статус вакансии:</strong> {vacancy.status}</p>
                <p><strong>Название компании:</strong> {vacancy.company_name}</p>
                <p><strong>Адрес компании:</strong> {vacancy.company_address}</p>
                <p><strong>Логотип:</strong></p>
                <img
                    src={vacancy.logo_url && vacancy.logo_url !== "N/A" ? vacancy.logo_url : '/mood-look-up.svg'}
                    alt="Company Logo"
                    className={styles['logo']}
                />
                <p><strong>Описание вакансии:</strong></p>
                <div
                    className={styles['description']}
                    dangerouslySetInnerHTML={{ __html: vacancy.description }}
                />
            </div>
            <button className={styles['back-button']} onClick={() => navigate(-1)}>
                Назад
            </button>
        </div>
    );
};

export default VacancyDetails;
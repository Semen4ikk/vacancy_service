import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/token';
import { useNavigate } from 'react-router-dom';
import styles from '../CSS/Home.module.css';

const Home = () => {
    const { accessToken, logout } = useAuth();
    const [vacancies, setVacancies] = useState([]);
    const [skip, setSkip] = useState(0);
    const [limit, setLimit] = useState(10);
    const [isCreating, setIsCreating] = useState(false);
    const [newVacancyId, setNewVacancyId] = useState('');
    const navigate = useNavigate();

    const fetchVacancies = async () => {
        try {
            const response = await axios.get('/api/v1/vacancy/list', {
                params: { skip, limit },
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            setVacancies(response.data);
        } catch (error) {
            console.error('Failed to fetch vacancies:', error);
        }
    };

    useEffect(() => {
        fetchVacancies();
    }, [accessToken, skip, limit]);

    const handleCreateVacancySubmit = async () => {
        if (!newVacancyId.trim()) {
            console.error('Vacancy ID cannot be empty');
            return;
        }

        try {
            const response = await axios.post(
                '/api/v1/vacancy/create',
                {},
                {
                    params: { vacancy_id: newVacancyId },
                    headers: { Authorization: `Bearer ${accessToken}` },
                }
            );
            console.log('Vacancy created:', response.data);
            setIsCreating(false);
            setNewVacancyId('');
            fetchVacancies();
        } catch (error) {
            if (error.response) {
                console.error('Server responded with:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error:', error.message);
            }
            setIsCreating(false);
        }
    };

    const handleDeleteVacancy = async (vacancyId) => {
        try {
            await axios.delete(`/api/v1/vacancy/delete/${vacancyId}`, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            console.log('Vacancy deleted');
            setVacancies(vacancies.filter(v => v.id !== vacancyId));
        } catch (error) {
            console.error('Failed to delete vacancy:', error);
        }
    };

    // Обработка выхода из системы
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className={styles['home-page']}>
            <h2>Список вакансий</h2>
            <div className={styles['actions-container']}>
                {!isCreating ? (
                    <button onClick={() => setIsCreating(true)}>Создать вакансию</button>
                ) : (
                    <div>
                        <input
                            type="text"
                            placeholder="ID вакансии"
                            value={newVacancyId}
                            onChange={(e) => setNewVacancyId(e.target.value)}
                        />
                        <button onClick={handleCreateVacancySubmit}>Подтвердить</button>
                        <button onClick={() => setIsCreating(false)}>Отмена</button>
                    </div>
                )}
                <img
                    src="/logout-2.svg"
                    alt="Logout"
                    className={styles['logout-icon']}
                    onClick={handleLogout}
                />
            </div>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Когда была создана</th>
                    <th>Статус</th>
                    <th>Название компании</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {vacancies.map((vacancy) => (
                    <tr key={vacancy.id} onClick={() => navigate(`/vacancy/${vacancy.id}`)} style={{ cursor: 'pointer' }}>
                        <td>{vacancy.id}</td>
                        <td>{new Date(vacancy.created_at).toLocaleDateString()}</td>
                        <td>{vacancy.status}</td>
                        <td>{vacancy.company_name}</td>
                        <td>
                            <button onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVacancy(vacancy.id);
                            }}>Удалить</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div className={styles['pagination']}>
                <button onClick={() => setSkip(skip - limit)} disabled={skip === 0}>
                    Предыдущая
                </button>
                <button onClick={() => setSkip(skip + limit)}>
                    Следующая
                </button>
            </div>
        </div>
    );
};

export default Home;
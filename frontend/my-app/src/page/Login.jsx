import React, { useState } from 'react';
import { useAuth } from '../utils/token';
import { useNavigate } from 'react-router-dom';
import styles from '../CSS/Login.module.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError(null);

        try {
            await login(form);
            navigate('/', { replace: true });
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Неправильный логин или пароль');
            } else {
                setError('Произошла ошибка при входе. Попробуйте позже.');
            }
        }
    };

    return (
        <div className={styles['login-page']}>
            <form onSubmit={handleSubmit} className={styles['form']}>
                <h2 className={styles['title']}>Вход в систему</h2>

                <div className={styles['form-group']}>
                    <label htmlFor="username" className={styles['label']}>
                        Логин:
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={form.username}
                        onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                        className={styles['input']}
                        required
                    />
                </div>

                <div className={styles['form-group']}>
                    <label htmlFor="password" className={styles['label']}>
                        Пароль:
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                        className={styles['input']}
                        required
                    />
                </div>

                {error && <div className={styles['error']}>{error}</div>}

                <button type="submit" className={styles['button']}>
                    Войти
                </button>
            </form>
        </div>
    );
};

export default Login;
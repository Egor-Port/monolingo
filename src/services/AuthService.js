const API_URL = 'http://localhost:5000/api';

class AuthService {
    // Сохранение токена в localStorage
    static setToken(token) {
        localStorage.setItem('auth_token', token);
    }

    static getToken() {
        return localStorage.getItem('auth_token');
    }

    static removeToken() {
        localStorage.removeItem('auth_token');
    }

    static getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Проверка, авторизован ли пользователь
    static isAuthenticated() {
        return !!this.getToken();
    }

    // Получение данных текущего пользователя
    static async getCurrentUser() {
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                headers: this.getAuthHeader()
            });
            
            if (!response.ok) {
                this.removeToken();
                return null;
            }
            
            const data = await response.json();
            return data.user;
        } catch (error) {
            console.error('Ошибка получения данных пользователя:', error);
            return null;
        }
    }

    // Регистрация
    static async register(userData) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (response.ok) {
            this.setToken(data.token);
        }
        
        return data;
    }

    // Вход
    static async login(credentials) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        
        if (response.ok) {
            this.setToken(data.token);
        }
        
        return data;
    }

    // Выход
    static logout() {
        this.removeToken();
        window.location.href = '/login';
    }
}

export default AuthService;
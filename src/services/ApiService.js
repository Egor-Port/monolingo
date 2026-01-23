const API_URL = 'http://localhost:5000/api';

class AuthService {
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

    static isAuthenticated() {
        return !!this.getToken();
    }

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

    static logout() {
        this.removeToken();
        window.location.href = '/login';
    }
}

export const apiService = {
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...AuthService.getAuthHeader(),
            ...options.headers
        };

        console.log(`📡 Отправка запроса на: ${API_URL}${endpoint}`);
        
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers
            });

            // Проверяем тип контента
            const contentType = response.headers.get('content-type');
            
            if (!response.ok) {
                // Если ответ не JSON, пытаемся прочитать как текст
                let errorText = '';
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    errorText = errorData.error || `Ошибка ${response.status}`;
                } else {
                    errorText = await response.text();
                    // Обрезаем если слишком длинный HTML
                    if (errorText.includes('<!DOCTYPE')) {
                        errorText = 'Сервер вернул HTML вместо JSON. Проверьте URL или права доступа.';
                    }
                }
                
                console.error(`❌ Ошибка ${response.status} на ${endpoint}:`, errorText);
                
                // Если 401 - токен невалидный
                if (response.status === 401) {
                    AuthService.logout();
                    throw new Error('Сессия истекла. Требуется повторный вход.');
                }
                
                throw new Error(errorText);
            }

            // Проверяем что ответ JSON
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`Сервер вернул не JSON. Ответ: ${text.substring(0, 100)}...`);
            }

            return await response.json();
        } catch (error) {
            console.error(`💥 Ошибка при запросе ${endpoint}:`, error.message);
            throw error;
        }
    },

    async getPairs() {
        return this.request('/pairs');
    },

    async addPair(newPair) {
        console.log('📤 Отправка пары на сервер:', newPair.word);
        return this.request('/pairs', {
            method: 'POST',
            body: JSON.stringify(newPair)
        });
    },

    async deletePair(id) {
        return this.request(`/pairs/${id}`, {
            method: 'DELETE'
        });
    },

    async saveStats(stats) {
        return this.request('/stats', {
            method: 'POST',
            body: JSON.stringify(stats)
        });
    },

    async getMyStats() {
        return this.request('/stats');
    },

    // Методы для администраторов
    async getUsers() {
        return this.request('/users');
    },

    async toggleUserActive(userId) {
        return this.request(`/users/${userId}/toggle-active`, {
            method: 'PATCH'
        });
    }
};

export default AuthService;
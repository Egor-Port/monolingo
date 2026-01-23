import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthService from './services/AuthService';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import AdminPanel from './components/AdminPanel';
import UserStats from './components/UserStats';

function App() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (AuthService.isAuthenticated()) {
                try {
                    const user = await AuthService.getCurrentUser();
                    setCurrentUser(user);
                } catch (error) {
                    console.error('Ошибка проверки авторизации:', error);
                    AuthService.removeToken();
                }
            }
            setLoading(false);
        };
        
        checkAuth();
    }, []);

    const handleLogout = () => {
        AuthService.logout();
        setCurrentUser(null);
        window.location.href = '/login';
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Загрузка приложения...
            </div>
        );
    }

    return (
        <Router>
            <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
                {currentUser && (
                    <header style={{
                        backgroundColor: '#fff',
                        padding: '15px 30px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px'
                    }}>
                        <div>
                            <Link to="/" style={{
                                textDecoration: 'none',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#333',
                                marginRight: '30px'
                            }}>
                                🎵 АудиоСлово
                            </Link>
                            <span style={{ 
                                backgroundColor: currentUser.role === 'admin' ? '#dc3545' : '#6c757d',
                                color: 'white',
                                padding: '3px 8px',
                                borderRadius: '3px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>
                                {currentUser.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ color: '#666' }}>
                                <strong>{currentUser.username}</strong>
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                    {currentUser.email}
                                </div>
                            </div>
                            
                            <div>
                                {currentUser.role === 'admin' && (
                                    <Link to="/admin" style={{
                                        marginRight: '15px',
                                        textDecoration: 'none',
                                        color: '#007bff',
                                        fontWeight: '500'
                                    }}>
                                        📊 Панель админа
                                    </Link>
                                )}
                                <Link to="/stats" style={{
                                    marginRight: '15px',
                                    textDecoration: 'none',
                                    color: '#007bff',
                                    fontWeight: '500'
                                }}>
                                    📈 Статистика
                                </Link>
                                <button 
                                    onClick={handleLogout}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#f8f9fa',
                                        color: '#dc3545',
                                        border: '1px solid #dc3545',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Выйти
                                </button>
                            </div>
                        </div>
                    </header>
                )}
                
                <main style={{ 
                    maxWidth: '1200px', 
                    margin: '0 auto', 
                    padding: currentUser ? '0 20px 40px' : '0' 
                }}>
                    <Routes>
                        <Route 
                            path="/login" 
                            element={!currentUser ? <Login /> : <Navigate to="/" />} 
                        />
                        <Route 
                            path="/register" 
                            element={!currentUser ? <Register /> : <Navigate to="/" />} 
                        />
                        <Route 
                            path="/" 
                            element={currentUser ? <Game user={currentUser} /> : <Navigate to="/login" />} 
                        />
                        <Route 
                            path="/admin" 
                            element={
                                currentUser?.role === 'admin' ? 
                                <AdminPanel /> : 
                                <Navigate to="/" />
                            } 
                        />
                        <Route 
                            path="/stats" 
                            element={currentUser ? <UserStats /> : <Navigate to="/login" />} 
                        />
                    </Routes>
                </main>

                {!currentUser && (
                    <footer style={{
                        textAlign: 'center',
                        padding: '20px',
                        marginTop: '40px',
                        color: '#666',
                        borderTop: '1px solid #eee'
                    }}>
                        <p>АудиоСлово Игра © {new Date().getFullYear()}</p>
                    </footer>
                )}
            </div>
        </Router>
    );
}

export default App;
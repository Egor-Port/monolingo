import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import AuthService from './services/AuthService';
import Login from './components/Login';
import Register from './components/Register';
import Game from './components/Game';
import AdminPanel from './components/AdminPanel';
import UserStats from './components/UserStats';
import Header from './components/Header';

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
                
                <style>
                    {`
                        a:hover {
                            opacity: 0.8;
                        }
                        button:hover {
                            opacity: 0.9;
                            transform: translateY(-1px);
                            transition: all 0.2s ease;
                        }
                    `}
                </style>

                {currentUser && (
                    <Header user={currentUser} onLogout={handleLogout} />
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
                        <Route 
                            path="*" 
                            element={
                                <div style={{ textAlign: 'center', padding: '50px' }}>
                                    <h1>404 - Страница не найдена</h1>
                                    <p>Извините, запрашиваемая страница не существует.</p>
                                    <Link to="/" style={{ color: '#007bff' }}>
                                        Вернуться на главную
                                    </Link>
                                </div>
                            } 
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
                        <p>Monolingo © {new Date().getFullYear()}</p>
                    </footer>
                )}
            </div>
        </Router>
    );
}

export default App;
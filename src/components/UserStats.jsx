import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../services/ApiService';

const UserStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await apiService.getMyStats();
            setStats(data);
            setError('');
        } catch (err) {
            console.error('Ошибка загрузки статистики:', err);
            setError('Не удалось загрузить статистику. Проверьте настройки сервера.');
        } finally {
            setLoading(false);
        }
    };

    const handleStartNewGame = () => {
        // Переходим на главную страницу, где уже есть логика игры
        navigate('/');
        // Можно также обновить страницу, чтобы сбросить состояние игры
        setTimeout(() => window.location.reload(), 100);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ fontSize: '24px', marginBottom: '20px' }}>📊</div>
                <p>Загрузка статистики...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '40px', 
                textAlign: 'center',
                backgroundColor: '#f8d7da',
                borderRadius: '8px',
                color: '#721c24'
            }}>
                <h3>❌ Ошибка загрузки статистики</h3>
                <p>{error}</p>
                <button 
                    onClick={loadStats}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    Попробовать снова
                </button>
                <Link 
                    to="/"
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        display: 'inline-block'
                    }}
                >
                    🎮 На главную
                </Link>
            </div>
        );
    }

    if (!stats) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <h3>📊 Статистика</h3>
                <p>Нет данных о статистике</p>
                <p>Сыграйте несколько игр, чтобы увидеть статистику!</p>
                <button 
                    onClick={handleStartNewGame}
                    style={{
                        marginTop: '20px',
                        padding: '12px 25px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        margin: '0 auto'
                    }}
                >
                    🎮 Начать игру
                </button>
            </div>
        );
    }

    const { summary, recent_games } = stats;

    return (
        <div style={{ padding: '20px' }}>
            {/* Заголовок с кнопками */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px',
                flexWrap: 'wrap',
                gap: '20px'
            }}>
                <h1 style={{ margin: 0 }}>📊 Моя статистика</h1>
                
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <button
                        onClick={handleStartNewGame}
                        style={{
                            padding: '12px 25px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        🎮 Новая игра
                    </button>
                    
                    <Link 
                        to="/"
                        style={{
                            padding: '12px 25px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '6px',
                            fontSize: '16px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        🏠 На главную
                    </Link>
                </div>
            </div>
            
            {/* Основные метрики */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '40px'
            }}>
                <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: '25px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    cursor: 'pointer'
                }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2e7d32' }}>
                        {summary.total_games}
                    </div>
                    <div style={{ fontSize: '16px', color: '#555' }}>
                        Всего игр
                    </div>
                </div>
                
                <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: '25px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    cursor: 'pointer'
                }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1565c0' }}>
                        {summary.total_correct}
                    </div>
                    <div style={{ fontSize: '16px', color: '#555' }}>
                        Правильных ответов
                    </div>
                </div>
                
                <div style={{
                    backgroundColor: '#fff3e0',
                    padding: '25px',
                    borderRadius: '10px',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    cursor: 'pointer'
                }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                   onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e65100' }}>
                        {Math.round(summary.avg_accuracy || 0)}%
                    </div>
                    <div style={{ fontSize: '16px', color: '#555' }}>
                        Средняя точность
                    </div>
                </div>
            </div>

            {/* Последние игры */}
            <div style={{ 
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '25px'
                }}>
                    <h2 style={{ margin: 0 }}>Последние игры</h2>
                    <span style={{ 
                        backgroundColor: '#f8f9fa',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '14px',
                        color: '#6c757d'
                    }}>
                        Последние {recent_games.length} игр
                    </span>
                </div>
                
                {recent_games.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#666', padding: '30px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎮</div>
                        <p>У вас пока нет сыгранных игр</p>
                        <button 
                            onClick={handleStartNewGame}
                            style={{
                                marginTop: '20px',
                                padding: '12px 25px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        >
                            🚀 Начать первую игру!
                        </button>
                    </div>
                ) : (
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '15px'
                    }}>
                        {recent_games.map((game, index) => (
                            <div 
                                key={game.id}
                                style={{
                                    padding: '15px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef',
                                    transition: 'transform 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ 
                                    fontSize: '14px', 
                                    color: '#666',
                                    marginBottom: '5px'
                                }}>
                                    Игра #{recent_games.length - index}
                                </div>
                                <div style={{ 
                                    fontSize: '20px', 
                                    fontWeight: 'bold',
                                    color: game.correct_count > game.incorrect_count ? '#28a745' : '#dc3545'
                                }}>
                                    {game.correct_count}/{game.correct_count + game.incorrect_count}
                                </div>
                                <div style={{ fontSize: '14px', color: '#666' }}>
                                    Точность: {game.accuracy}%
                                </div>
                                <div style={{ 
                                    fontSize: '12px', 
                                    color: '#999',
                                    marginTop: '10px'
                                }}>
                                    {new Date(game.game_date).toLocaleDateString('ru-RU', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Детальная статистика */}
            <div style={{ 
                backgroundColor: '#fff',
                borderRadius: '10px',
                padding: '25px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ margin: 0 }}>Детальная статистика</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            onClick={loadStats}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Обновить
                        </button>
                        <button 
                            onClick={handleStartNewGame}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px'
                            }}
                        >
                            🎮 Играть
                        </button>
                    </div>
                </div>
                
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    <div>
                        <h4>Общая информация</h4>
                        <ul style={{ lineHeight: '2' }}>
                            <li><strong>Всего игр:</strong> {summary.total_games}</li>
                            <li><strong>Правильных ответов:</strong> {summary.total_correct}</li>
                            <li><strong>Неправильных ответов:</strong> {summary.total_incorrect}</li>
                            <li><strong>Общая точность:</strong> {Math.round(summary.avg_accuracy || 0)}%</li>
                            <li><strong>Среднее правильных за игру:</strong> {summary.avg_correct_per_game?.toFixed(1) || '0'}</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4>Последняя активность</h4>
                        {summary.last_game_date ? (
                            <div>
                                <p>Последняя игра: {new Date(summary.last_game_date).toLocaleString('ru-RU')}</p>
                                <div style={{ 
                                    marginTop: '20px',
                                    padding: '15px',
                                    backgroundColor: '#e9ecef',
                                    borderRadius: '6px'
                                }}>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>Хотите улучшить статистику?</p>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
                                        Сыграйте еще одну игру!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p>Еще не было игр</p>
                                <button 
                                    onClick={handleStartNewGame}
                                    style={{
                                        marginTop: '20px',
                                        padding: '12px 25px',
                                        backgroundColor: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        fontWeight: '600'
                                    }}
                                >
                                    🚀 Начать первую игру
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Кнопка быстрого старта внизу */}
            <div style={{ 
                marginTop: '30px', 
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#e9ecef',
                borderRadius: '10px'
            }}>
                <h3>Готовы сыграть?</h3>
                <p style={{ marginBottom: '20px' }}>Начните новую игру прямо сейчас!</p>
                <button 
                    onClick={handleStartNewGame}
                    style={{
                        padding: '15px 40px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
                        transition: 'transform 0.3s'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                    🎮 НАЧАТЬ НОВУЮ ИГРУ
                </button>
            </div>
        </div>
    );
};

export default UserStats;
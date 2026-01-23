import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';

const UserStats = () => {
    const [stats, setStats] = useState(null);
    const [recentGames, setRecentGames] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await apiService.getMyStats();
            setStats(data.summary);
            setRecentGames(data.recent_games || []);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка статистики...</div>;
    }

    const totalGames = stats?.total_games || 0;
    const totalCorrect = stats?.total_correct || 0;
    const totalIncorrect = stats?.total_incorrect || 0;
    const totalAnswers = totalCorrect + totalIncorrect;
    const successRate = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;

    return (
        <div>
            <h1 style={{ marginBottom: '30px' }}>Моя статистика</h1>
            
            <div style={{ 
                display: 'flex', 
                gap: '20px', 
                flexWrap: 'wrap',
                marginBottom: '40px'
            }}>
                <div style={{ 
                    padding: '25px', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    flex: '1',
                    minWidth: '250px'
                }}>
                    <h3 style={{ marginTop: 0, color: '#1976d2' }}>Всего игр</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '15px 0' }}>
                        {totalGames}
                    </p>
                    <p style={{ color: '#666' }}>сыграно раундов</p>
                </div>
                
                <div style={{ 
                    padding: '25px', 
                    backgroundColor: '#e8f5e9', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    flex: '1',
                    minWidth: '250px'
                }}>
                    <h3 style={{ marginTop: 0, color: '#388e3c' }}>Правильных ответов</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '15px 0' }}>
                        {totalCorrect}
                    </p>
                    <div style={{ 
                        height: '10px', 
                        backgroundColor: '#c8e6c9',
                        borderRadius: '5px',
                        marginBottom: '10px'
                    }}>
                        <div style={{ 
                            width: `${successRate}%`, 
                            height: '100%', 
                            backgroundColor: '#4caf50',
                            borderRadius: '5px'
                        }}></div>
                    </div>
                    <p style={{ color: '#666' }}>{successRate}% успеха</p>
                </div>
                
                <div style={{ 
                    padding: '25px', 
                    backgroundColor: '#ffebee', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    flex: '1',
                    minWidth: '250px'
                }}>
                    <h3 style={{ marginTop: 0, color: '#d32f2f' }}>Неправильных ответов</h3>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '15px 0' }}>
                        {totalIncorrect}
                    </p>
                    <p style={{ color: '#666' }}>ошибок совершено</p>
                </div>
            </div>

            {recentGames.length > 0 ? (
                <div>
                    <h2 style={{ marginBottom: '20px' }}>Последние игры</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f5f5f5' }}>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Дата игры</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Правильно</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Неправильно</th>
                                    <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #ddd' }}>Результат</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentGames.map((game, index) => (
                                    <tr key={game.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>
                                            {new Date(game.game_date).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                backgroundColor: '#4caf50', 
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '3px',
                                                fontWeight: 'bold'
                                            }}>
                                                {game.correct_count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{ 
                                                backgroundColor: '#f44336', 
                                                color: 'white',
                                                padding: '4px 8px',
                                                borderRadius: '3px',
                                                fontWeight: 'bold'
                                            }}>
                                                {game.incorrect_count}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            {game.correct_count > game.incorrect_count ? (
                                                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Победа</span>
                                            ) : game.correct_count < game.incorrect_count ? (
                                                <span style={{ color: '#f44336', fontWeight: 'bold' }}>Поражение</span>
                                            ) : (
                                                <span style={{ color: '#ff9800', fontWeight: 'bold' }}>Ничья</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ color: '#666' }}>У вас пока нет сыгранных игр</h3>
                    <p>Сыграйте несколько раундов, чтобы увидеть свою статистику</p>
                    <a href="/" style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '5px'
                    }}>
                        Начать играть
                    </a>
                </div>
            )}

            <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '5px'
            }}>
                <h3>Советы для улучшения результатов</h3>
                <ul style={{ lineHeight: '1.6' }}>
                    <li>Внимательно слушайте аудио перед выбором слова</li>
                    <li>Не торопитесь - у вас нет ограничения по времени</li>
                    <li>Если не уверены, пропустите пару и вернитесь к ней позже</li>
                    <li>Тренируйтесь регулярно для улучшения навыков</li>
                </ul>
            </div>
        </div>
    );
};

export default UserStats;
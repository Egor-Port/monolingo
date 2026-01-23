import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import AuthService from '../services/AuthService';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [pairs, setPairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setError('');
        setLoading(true);
        
        try {
            // Загружаем пользователей и пары параллельно
            const [usersData, pairsData] = await Promise.allSettled([
                apiService.getUsers(),
                apiService.getPairs()
            ]);
            
            // Обработка пользователей
            if (usersData.status === 'fulfilled') {
                // Проверяем структуру ответа
                const usersResponse = usersData.value;
                setUsers(usersResponse.users || usersResponse || []);
            } else {
                console.error('Ошибка загрузки пользователей:', usersData.reason);
                setError(`Не удалось загрузить пользователей: ${usersData.reason.message}`);
            }
            
            // Обработка пар
            if (pairsData.status === 'fulfilled') {
                setPairs(Array.isArray(pairsData.value) ? pairsData.value : []);
            } else {
                console.error('Ошибка загрузки пар:', pairsData.reason);
                if (!error) {
                    setError(`Не удалось загрузить пары: ${pairsData.reason.message}`);
                }
            }
            
        } catch (error) {
            console.error('Общая ошибка загрузки данных:', error);
            setError(`Ошибка загрузки: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleUserActive = async (userId, currentStatus) => {
        if (!window.confirm(`Вы уверены, что хотите ${currentStatus ? 'заблокировать' : 'разблокировать'} этого пользователя?`)) {
            return;
        }

        try {
            await apiService.toggleUserActive(userId);
            // Обновляем локальное состояние
            setUsers(users.map(user => 
                user.id === userId 
                    ? { ...user, is_active: !currentStatus }
                    : user
            ));
        } catch (error) {
            console.error('Ошибка изменения статуса:', error);
            alert('Ошибка: ' + error.message);
        }
    };

    const handleDeletePair = async (pairId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту пару?')) {
            return;
        }

        try {
            await apiService.deletePair(pairId);
            setPairs(pairs.filter(p => p.id !== pairId));
            alert('Пара успешно удалена');
        } catch (error) {
            console.error('Ошибка удаления пары:', error);
            alert('Ошибка: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '50px',
                color: '#666'
            }}>
                <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
                <p>Загрузка панели администратора...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '30px' }}>Панель администратора</h1>
            
            {error && (
                <div style={{ 
                    padding: '15px',
                    marginBottom: '20px',
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    border: '1px solid #f5c6cb',
                    borderRadius: '5px'
                }}>
                    <strong>Ошибка:</strong> {error}
                    <div style={{ marginTop: '10px' }}>
                        <button 
                            onClick={loadData}
                            style={{
                                padding: '5px 10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '3px',
                                cursor: 'pointer'
                            }}
                        >
                            Повторить загрузку
                        </button>
                    </div>
                </div>
            )}
            
            <div style={{ 
                marginBottom: '20px', 
                borderBottom: '1px solid #dee2e6',
                display: 'flex',
                gap: '10px'
            }}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'users' ? 'white' : '#007bff',
                        border: 'none',
                        borderBottom: activeTab === 'users' ? '2px solid #007bff' : 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        borderRadius: '5px 5px 0 0'
                    }}
                >
                    👥 Пользователи ({users.length})
                </button>
                <button
                    onClick={() => setActiveTab('pairs')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'pairs' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'pairs' ? 'white' : '#007bff',
                        border: 'none',
                        borderBottom: activeTab === 'pairs' ? '2px solid #007bff' : 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        borderRadius: '5px 5px 0 0'
                    }}
                >
                    🎵 Пары слов-аудио ({pairs.length})
                </button>
            </div>

            {activeTab === 'users' && (
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: 'white', 
                    borderRadius: '5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>Нет пользователей</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>ID</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Имя</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Email</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Роль</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Дата регистрации</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Статус</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td style={{ padding: '12px' }}>{user.id}</td>
                                            <td style={{ padding: '12px' }}>
                                                <strong>{user.username}</strong>
                                                {user.role === 'admin' && (
                                                    <span style={{ 
                                                        marginLeft: '5px', 
                                                        backgroundColor: '#dc3545', 
                                                        color: 'white',
                                                        padding: '2px 6px',
                                                        borderRadius: '3px',
                                                        fontSize: '12px'
                                                    }}>ADMIN</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px' }}>{user.email}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    backgroundColor: user.role === 'admin' ? '#dc3545' : '#6c757d',
                                                    color: 'white',
                                                    fontSize: '12px'
                                                }}>
                                                    {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    backgroundColor: user.is_active ? '#28a745' : '#dc3545',
                                                    color: 'white',
                                                    fontSize: '12px'
                                                }}>
                                                    {user.is_active ? 'Активен' : 'Заблокирован'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {user.role !== 'admin' && (
                                                    <button
                                                        onClick={() => handleToggleUserActive(user.id, user.is_active)}
                                                        style={{
                                                            padding: '6px 12px',
                                                            backgroundColor: user.is_active ? '#dc3545' : '#28a745',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'pairs' && (
                <div style={{ 
                    padding: '20px', 
                    backgroundColor: 'white', 
                    borderRadius: '5px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    {pairs.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                            <p>Нет пар слов-аудио</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>ID</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Слово</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Файл</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Автор</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Статус</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Дата создания</th>
                                        <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>Действия</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pairs.map(pair => (
                                        <tr key={pair.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                                            <td style={{ padding: '12px' }}>{pair.id}</td>
                                            <td style={{ padding: '12px' }}><strong>{pair.word}</strong></td>
                                            <td style={{ padding: '12px' }}>
                                                <code style={{ fontSize: '12px', color: '#666' }}>
                                                    {pair.file_name || 'без названия'}
                                                </code>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {pair.author || 'Неизвестно'}
                                                {pair.user_id && (
                                                    <div style={{ fontSize: '12px', color: '#666' }}>
                                                        ID: {pair.user_id}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '3px',
                                                    backgroundColor: pair.is_public ? '#28a745' : '#6c757d',
                                                    color: 'white',
                                                    fontSize: '12px'
                                                }}>
                                                    {pair.is_public ? 'Публичная' : 'Приватная'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                {pair.created_at ? new Date(pair.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <button
                                                    onClick={() => handleDeletePair(pair.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        backgroundColor: '#dc3545',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '4px',
                                                        cursor: 'pointer',
                                                        fontSize: '14px'
                                                    }}
                                                >
                                                    Удалить
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '5px',
                border: '1px solid #dee2e6'
            }}>
                <h3>Статистика системы</h3>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: 'white', 
                        borderRadius: '5px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        flex: '1',
                        minWidth: '200px'
                    }}>
                        <h4 style={{ marginTop: 0, color: '#6c757d' }}>Пользователи</h4>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                            {users.length}
                        </p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Админов: {users.filter(u => u.role === 'admin').length}<br />
                            Активных: {users.filter(u => u.is_active).length}
                        </div>
                    </div>
                    
                    <div style={{ 
                        padding: '15px', 
                        backgroundColor: 'white', 
                        borderRadius: '5px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        flex: '1',
                        minWidth: '200px'
                    }}>
                        <h4 style={{ marginTop: 0, color: '#6c757d' }}>Пары слов-аудио</h4>
                        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>
                            {pairs.length}
                        </p>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                            Публичных: {pairs.filter(p => p.is_public).length}<br />
                            Приватных: {pairs.filter(p => !p.is_public).length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
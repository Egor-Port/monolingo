import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import AddPairForm from './AddPairForm';

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState('pairs');
    const [pairs, setPairs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddPairForm, setShowAddPairForm] = useState(false);

    // Загрузка пар
    const loadPairs = async () => {
        setLoading(true);
        try {
            const data = await apiService.getPairs();
            setPairs(data);
        } catch (error) {
            console.error('Ошибка загрузки пар:', error);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка пользователей
    const loadUsers = async () => {
        try {
            const data = await apiService.getUsers();
            setUsers(data.users);
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
        }
    };

    useEffect(() => {
        if (activeTab === 'pairs') {
            loadPairs();
        } else if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

    // Обработчик добавления новой пары
    const handlePairAdded = (newPair) => {
        setPairs(prev => [newPair, ...prev]);
        setShowAddPairForm(false);
    };

    // Удаление пары
    const handleDeletePair = async (pairId) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту пару?')) return;
        
        try {
            await apiService.deletePair(pairId);
            setPairs(prev => prev.filter(p => p.id !== pairId));
        } catch (error) {
            console.error('Ошибка удаления пары:', error);
            alert('Не удалось удалить пару');
        }
    };

    // Управление пользователями
    const handleToggleUserActive = async (userId) => {
        try {
            await apiService.toggleUserActive(userId);
            setUsers(prev => prev.map(user => 
                user.id === userId ? { ...user, is_active: !user.is_active } : user
            ));
        } catch (error) {
            console.error('Ошибка изменения статуса пользователя:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1 style={{ marginBottom: '30px' }}>Панель администратора</h1>
            
            {/* Навигация по вкладкам */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '30px',
                borderBottom: '2px solid #e9ecef',
                paddingBottom: '10px'
            }}>
                <button
                    onClick={() => setActiveTab('pairs')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: activeTab === 'pairs' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'pairs' ? 'white' : '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                    }}
                >
                    📝 Пары слов-аудио
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'users' ? 'white' : '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                    }}
                >
                    👥 Пользователи
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    style={{
                        padding: '12px 25px',
                        backgroundColor: activeTab === 'stats' ? '#007bff' : '#f8f9fa',
                        color: activeTab === 'stats' ? 'white' : '#495057',
                        border: '1px solid #dee2e6',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '16px'
                    }}
                >
                    📊 Статистика
                </button>
            </div>

            {/* Вкладка пар */}
            {activeTab === 'pairs' && (
                <div>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{ margin: 0 }}>Управление парами</h2>
                        <button
                            onClick={() => setShowAddPairForm(!showAddPairForm)}
                            style={{
                                padding: '12px 25px',
                                backgroundColor: showAddPairForm ? '#6c757d' : '#28a745',
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
                            {showAddPairForm ? '✖️ Отмена' : '➕ Добавить пару'}
                        </button>
                    </div>

                    {/* Форма добавления пары */}
                    {showAddPairForm && (
                        <div style={{ marginBottom: '40px' }}>
                            <AddPairForm 
                                onPairAdded={handlePairAdded}
                                user={{ role: 'admin' }}
                            />
                        </div>
                    )}

                    {/* Список пар */}
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '50px' }}>
                            Загрузка пар...
                        </div>
                    ) : (
                        <div style={{ 
                            backgroundColor: '#fff',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                            overflow: 'hidden'
                        }}>
                            <div style={{ 
                                display: 'grid',
                                gridTemplateColumns: '1fr 2fr 2fr 1fr',
                                backgroundColor: '#f8f9fa',
                                padding: '15px 20px',
                                fontWeight: 'bold',
                                borderBottom: '1px solid #dee2e6'
                            }}>
                                <div>ID</div>
                                <div>Слово</div>
                                <div>Автор</div>
                                <div>Действия</div>
                            </div>
                            
                            {pairs.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#6c757d' }}>
                                    Нет добавленных пар
                                </div>
                            ) : (
                                pairs.map(pair => (
                                    <div 
                                        key={pair.id}
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 2fr 2fr 1fr',
                                            padding: '15px 20px',
                                            borderBottom: '1px solid #f1f1f1',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <div style={{ fontWeight: 'bold', color: '#495057' }}>
                                            {pair.id}
                                        </div>
                                        <div>
                                            <strong>{pair.word}</strong>
                                            {pair.file_name && (
                                                <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '5px' }}>
                                                    {pair.file_name}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div>{pair.author || 'Система'}</div>
                                            <div style={{ fontSize: '13px', color: '#6c757d' }}>
                                                {pair.created_at ? new Date(pair.created_at).toLocaleDateString() : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <button
                                                onClick={() => handleDeletePair(pair.id)}
                                                style={{
                                                    padding: '8px 16px',
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
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '6px'
                    }}>
                        <p><strong>Всего пар:</strong> {pairs.length}</p>
                        <p><strong>Публичных пар:</strong> {pairs.filter(p => p.is_public).length}</p>
                        <p><strong>Приватных пар:</strong> {pairs.filter(p => !p.is_public).length}</p>
                    </div>
                </div>
            )}

            {/* Вкладка пользователей */}
            {activeTab === 'users' && (
                <div>
                    <h2 style={{ marginBottom: '30px' }}>Управление пользователями</h2>
                    
                    <div style={{ 
                        backgroundColor: '#fff',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        overflow: 'hidden'
                    }}>
                        <div style={{ 
                            display: 'grid',
                            gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr',
                            backgroundColor: '#f8f9fa',
                            padding: '15px 20px',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #dee2e6'
                        }}>
                            <div>ID</div>
                            <div>Имя</div>
                            <div>Email</div>
                            <div>Роль</div>
                            <div>Статус</div>
                        </div>
                        
                        {users.map(user => (
                            <div 
                                key={user.id}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 2fr 2fr 1fr 1fr',
                                    padding: '15px 20px',
                                    borderBottom: '1px solid #f1f1f1',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ fontWeight: 'bold' }}>
                                    {user.id}
                                </div>
                                <div>
                                    <strong>{user.username}</strong>
                                    <div style={{ fontSize: '13px', color: '#6c757d' }}>
                                        Регистрация: {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div>{user.email}</div>
                                <div>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: user.role === 'admin' ? '#dc3545' : '#6c757d',
                                        color: 'white',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}>
                                        {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                                    </span>
                                </div>
                                <div>
                                    <button
                                        onClick={() => handleToggleUserActive(user.id)}
                                        style={{
                                            padding: '8px 16px',
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
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div style={{ 
                        marginTop: '20px', 
                        padding: '15px',
                        backgroundColor: '#e9ecef',
                        borderRadius: '6px'
                    }}>
                        <p><strong>Всего пользователей:</strong> {users.length}</p>
                        <p><strong>Администраторов:</strong> {users.filter(u => u.role === 'admin').length}</p>
                        <p><strong>Активных пользователей:</strong> {users.filter(u => u.is_active).length}</p>
                    </div>
                </div>
            )}

            {/* Вкладка статистики */}
            {activeTab === 'stats' && (
                <div>
                    <h2 style={{ marginBottom: '30px' }}>Статистика системы</h2>
                    
                    <div style={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '20px',
                        marginBottom: '30px'
                    }}>
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                                {pairs.length}
                            </div>
                            <div style={{ color: '#6c757d' }}>Всего пар</div>
                        </div>
                        
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                                {users.length}
                            </div>
                            <div style={{ color: '#6c757d' }}>Всего пользователей</div>
                        </div>
                        
                        <div style={{
                            backgroundColor: '#fff',
                            padding: '20px',
                            borderRadius: '8px',
                            border: '1px solid #dee2e6',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6f42c1' }}>
                                {pairs.filter(p => p.is_public).length}
                            </div>
                            <div style={{ color: '#6c757d' }}>Публичных пар</div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        backgroundColor: '#fff',
                        padding: '20px',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6'
                    }}>
                        <h3>Информация о системе</h3>
                        <ul style={{ lineHeight: '1.8' }}>
                            <li>Панель администратора позволяет управлять всеми данными приложения</li>
                            <li>Вы можете добавлять, просматривать и удалять пары "слово-аудио"</li>
                            <li>Управляйте пользователями: блокируйте/разблокируйте аккаунты</li>
                            <li>Все изменения сразу применяются ко всему приложению</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
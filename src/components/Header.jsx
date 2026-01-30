import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ user, onLogout }) => {
    return (
        <header style={{
            backgroundColor: '#fff',
            padding: '15px 20px',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <div>
                <Link to="/" style={{
                    textDecoration: 'none',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333',
                    marginRight: '30px'
                }}>
                    🎵 Monolingo
                </Link>
                <span style={{ 
                    backgroundColor: user.role === 'admin' ? '#dc3545' : '#6c757d',
                    color: 'white',
                    padding: '3px 8px',
                    borderRadius: '3px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {user.role === 'admin' ? 'АДМИНИСТРАТОР' : 'ПОЛЬЗОВАТЕЛЬ'}
                </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ color: '#666' }}>
                    <strong>{user.username}</strong>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                        {user.email}
                    </div>
                </div>
                
                <div>
                    {user.role === 'admin' && (
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
                        onClick={onLogout}
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
    );
};

export default Header;
import React, { useState, useRef } from 'react';
import { apiService } from '../services/ApiService';

const AddPairForm = ({ onPairAdded, user }) => {
    const [formData, setFormData] = useState({
        word: '',
        is_public: true
    });
    const [audioFile, setAudioFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                setError('Пожалуйста, выберите аудиофайл (MP3, WAV, etc.)');
                return;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                setError('Файл слишком большой. Максимальный размер 5MB.');
                return;
            }
            setAudioFile(file);
            setError('');
        }
    };

    const readFileAsBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.word.trim()) {
            setError('Введите слово');
            return;
        }

        if (!audioFile) {
            setError('Выберите аудиофайл');
            return;
        }

        setLoading(true);

        try {
            // Читаем файл как Base64
            const audioData = await readFileAsBase64(audioFile);

            // Отправляем на сервер
            const result = await apiService.addPair({
                word: formData.word.trim(),
                audioData: audioData,
                fileName: audioFile.name,
                is_public: formData.is_public
            });

            setSuccess(`Пара "${formData.word}" успешно добавлена!`);
            
            // Сбрасываем форму
            setFormData({ word: '', is_public: true });
            setAudioFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Вызываем колбэк, если передан
            if (onPairAdded && result.pair) {
                onPairAdded(result.pair);
            }

        } catch (err) {
            console.error('Ошибка добавления пары:', err);
            setError(err.message || 'Ошибка при добавлении пары');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto',
            padding: '25px',
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            boxShadow: '0 2px 15px rgba(0,0,0,0.1)'
        }}>
            <h2 style={{ 
                marginBottom: '25px', 
                textAlign: 'center',
                color: '#333'
            }}>
                Добавить новую пару
            </h2>
            
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600',
                        color: '#555'
                    }}>
                        Слово/Фраза:
                    </label>
                    <input
                        type="text"
                        name="word"
                        value={formData.word}
                        onChange={handleChange}
                        placeholder="То что говорят в аудио"
                        style={{ 
                            width: '100%', 
                            padding: '12px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '6px',
                            fontSize: '16px',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#007bff'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                        disabled={loading}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                        display: 'block', 
                        marginBottom: '8px', 
                        fontWeight: '600',
                        color: '#555'
                    }}>
                        Аудиофайл:
                    </label>
                    <div style={{ 
                        border: '2px dashed #e0e0e0',
                        borderRadius: '6px',
                        padding: '20px',
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        transition: 'border-color 0.3s'
                    }}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="audio/*"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="audioFileInput"
                            disabled={loading}
                        />
                        <label htmlFor="audioFileInput" style={{ 
                            display: 'block',
                            cursor: loading ? 'not-allowed' : 'pointer'
                        }}>
                            <div style={{ fontSize: '48px', color: '#6c757d', marginBottom: '10px' }}>
                                🎵
                            </div>
                            {audioFile ? (
                                <div>
                                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        {audioFile.name}
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#666' }}>
                                        {(audioFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                                        Нажмите для выбора файла
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#666' }}>
                                        Поддерживаемые форматы: MP3, WAV, OGG
                                    </p>
                                    <p style={{ fontSize: '12px', color: '#999' }}>
                                        Максимальный размер: 5MB
                                    </p>
                                </div>
                            )}
                        </label>
                    </div>
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}>
                        <input
                            type="checkbox"
                            name="is_public"
                            checked={formData.is_public}
                            onChange={handleChange}
                            disabled={loading}
                            style={{ 
                                marginRight: '10px',
                                transform: 'scale(1.2)'
                            }}
                        />
                        <span style={{ color: '#555' }}>
                            Сделать пару публичной (доступной всем пользователям)
                        </span>
                    </label>
                    <small style={{ 
                        display: 'block', 
                        marginTop: '5px', 
                        color: '#888',
                        fontSize: '14px'
                    }}>
                        {user.role === 'admin' 
                            ? 'Как администратор, вы можете создавать публичные пары для всех пользователей'
                            : 'Ваши приватные пары будут доступны только вам'}
                    </small>
                </div>

                {error && (
                    <div style={{ 
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        border: '1px solid #f5c6cb',
                        borderRadius: '6px',
                        fontSize: '15px'
                    }}>
                        ❌ {error}
                    </div>
                )}

                {success && (
                    <div style={{ 
                        padding: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        border: '1px solid #c3e6cb',
                        borderRadius: '6px',
                        fontSize: '15px'
                    }}>
                        ✅ {success}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: loading ? '#6c757d' : '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        fontWeight: '600',
                        transition: 'background-color 0.3s',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '10px'
                    }}
                >
                    {loading ? (
                        <>
                            <span className="spinner" style={{
                                width: '20px',
                                height: '20px',
                                border: '3px solid rgba(255,255,255,0.3)',
                                borderTop: '3px solid white',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}></span>
                            Добавление...
                        </>
                    ) : (
                        '➕ Добавить пару'
                    )}
                </button>
            </form>

            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    );
};

export default AddPairForm;
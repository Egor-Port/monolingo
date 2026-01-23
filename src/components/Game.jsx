import React, { useState, useEffect } from 'react';
import { apiService } from '../services/ApiService';
import AuthService from '../services/AuthService';

const Game = ({ user }) => {
    const [uploadedPairs, setUploadedPairs] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [pairs, setPairs] = useState([]);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [checkResult, setCheckResult] = useState(null);
    const [colors, setColors] = useState([]);
    const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
    const [loading, setLoading] = useState(true);

    // Загрузка пар при монтировании
    useEffect(() => {
        loadPairs();
    }, []);

    const loadPairs = async () => {
        try {
            const data = await apiService.getPairs();
            setUploadedPairs(data);
            setLoading(false);
        } catch (error) {
            console.error('Ошибка загрузки пар:', error);
            setLoading(false);
        }
    };

    const generateColors = () => {
        const colorPalette = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
            '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
        ];
        return [...colorPalette].sort(() => Math.random() - 0.5);
    };

    const generateNewData = () => {
        if (uploadedPairs.length < 3) return null;

        const itemCount = Math.min(uploadedPairs.length, Math.floor(Math.random() * 4) + 3);
        const selectedPairs = [...uploadedPairs]
            .sort(() => Math.random() - 0.5)
            .slice(0, itemCount);

        const audioArray = [];
        const wordArray = [];

        selectedPairs.forEach((pair, index) => {
            audioArray.push({
                id: pair.id,
                audioData: pair.audio_data,
                displayName: `Аудио ${index + 1}`,
                originalWord: pair.word
            });

            wordArray.push({
                id: pair.id,
                word: pair.word,
                originalId: pair.id
            });
        });

        const shuffledWords = [...wordArray].sort(() => Math.random() - 0.5);
        const correctPairs = selectedPairs.map(pair => ({
            audioId: pair.id,
            wordId: pair.id
        }));

        return {
            audio: audioArray,
            words: shuffledWords,
            correctPairs: correctPairs
        };
    };

    const initializeGame = () => {
        const newData = generateNewData();
        if (newData) {
            setCurrentTask(newData);
            setPairs([]);
            setCurrentAudio(null);
            setCheckResult(null);
            setColors(generateColors());
        }
    };

    const handleAudioSelect = (audioId) => {
        if (checkResult !== null) return;
        if (pairs.some(pair => pair.audioId === audioId)) return;
        setCurrentAudio(audioId);
    };

    const handleWordSelect = (wordId) => {
        if (checkResult !== null || !currentAudio) return;
        if (pairs.some(pair => pair.wordId === wordId)) return;
        
        const newPair = {
            audioId: currentAudio,
            wordId: wordId,
            color: colors[pairs.length % colors.length]
        };
        
        setPairs(prev => [...prev, newPair]);
        setCurrentAudio(null);
    };

    const handleRemovePair = (index) => {
        if (checkResult !== null) return;
        setPairs(prev => prev.filter((_, i) => i !== index));
    };

    const handleCheckAnswer = async () => {
        if (!currentTask) return;

        const userPairsCorrect = pairs.every(pair => 
            currentTask.correctPairs.some(correctPair => 
                correctPair.audioId === pair.audioId && correctPair.wordId === pair.wordId
            )
        );

        const allCorrectPairsFound = currentTask.correctPairs.every(correctPair =>
            pairs.some(pair => 
                pair.audioId === correctPair.audioId && pair.wordId === correctPair.wordId
            )
        );

        const isCorrect = userPairsCorrect && allCorrectPairsFound && 
                         pairs.length === currentTask.correctPairs.length;

        setCheckResult(isCorrect);

        // Сохраняем статистику
        try {
            await apiService.saveStats({
                correct_count: isCorrect ? 1 : 0,
                incorrect_count: isCorrect ? 0 : 1,
                total_time_seconds: 0 // Можно добавить таймер
            });
        } catch (error) {
            console.error('Ошибка сохранения статистики:', error);
        }
    };

    const handlePlayAudio = (audioId) => {
        if (!currentTask) return;
        
        const audioItem = currentTask.audio.find(a => a.id === audioId);
        if (!audioItem || !audioItem.audioData) {
            console.warn('Аудио не найдено');
            return;
        }
        
        setCurrentPlayingAudio(audioId);
        
        const audio = new Audio(audioItem.audioData);
        audio.play();
        
        audio.onended = () => setCurrentPlayingAudio(null);
        audio.onerror = () => {
            console.error('Ошибка воспроизведения аудио');
            setCurrentPlayingAudio(null);
        };
    };

    const getElementColor = (type, id) => {
        const pair = pairs.find(p => 
            type === 'audio' ? p.audioId === id : p.wordId === id
        );
        return pair ? pair.color : null;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Загрузка игры...</div>;
    }

    return (
        <div>
            <h1 style={{ marginBottom: '20px' }}>Аудио-Слово Игра</h1>
            <p>Привет, <strong>{user.username}</strong>! Ваша роль: {user.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
            
            <div style={{ 
                marginBottom: '30px', 
                padding: '15px', 
                backgroundColor: '#e3f2fd',
                borderRadius: '5px'
            }}>
                <h3>Инструкция:</h3>
                <p>1. Двойной клик по кнопке "Аудио" - чтобы прослушать</p>
                <p>2. Нажмите на аудио, затем на соответствующее слово, чтобы создать пару</p>
                <p>3. Найдите все правильные пары и нажмите "Проверить"</p>
            </div>

            {!currentTask ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>
                    <p>Для начала игры необходимо минимум 3 пары слов-аудио</p>
                    <p>Сейчас доступно пар: {uploadedPairs.length}</p>
                    {uploadedPairs.length >= 3 && (
                        <button
                            onClick={initializeGame}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginTop: '20px'
                            }}
                        >
                            Начать игру
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div style={{ marginBottom: '30px' }}>
                        <h2>Аудио ({currentTask.audio.length}):</h2>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {currentTask.audio.map(audioItem => {
                                const pairColor = getElementColor('audio', audioItem.id);
                                const isUsed = pairs.some(p => p.audioId === audioItem.id);
                                const isPlaying = currentPlayingAudio === audioItem.id;
                                
                                return (
                                    <button
                                        key={audioItem.id}
                                        onClick={() => handleAudioSelect(audioItem.id)}
                                        onDoubleClick={() => handlePlayAudio(audioItem.id)}
                                        disabled={isUsed || checkResult !== null}
                                        style={{
                                            padding: '10px 15px',
                                            border: '2px solid',
                                            borderColor: pairColor || 
                                                (currentAudio === audioItem.id ? '#007bff' : '#ccc'),
                                            backgroundColor: pairColor ? 
                                                `${pairColor}20` : 
                                                (currentAudio === audioItem.id ? '#e3f2fd' : 
                                                isPlaying ? '#fff3cd' : 'white'),
                                            cursor: (isUsed || checkResult !== null) ? 'not-allowed' : 'pointer',
                                            borderRadius: '5px',
                                            opacity: isUsed ? 0.7 : 1,
                                            position: 'relative'
                                        }}
                                    >
                                        {audioItem.displayName}
                                        {isPlaying && (
                                            <span style={{
                                                position: 'absolute',
                                                top: '-5px',
                                                right: '-5px',
                                                backgroundColor: '#ffc107',
                                                borderRadius: '50%',
                                                width: '10px',
                                                height: '10px',
                                                animation: 'pulse 1s infinite'
                                            }}></span>
                                        )}
                                        {pairColor && ' ✓'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h2>Слова ({currentTask.words.length}):</h2>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {currentTask.words.map(wordItem => {
                                const pairColor = getElementColor('word', wordItem.id);
                                const isUsed = pairs.some(p => p.wordId === wordItem.id);
                                
                                return (
                                    <button
                                        key={wordItem.id}
                                        onClick={() => handleWordSelect(wordItem.id)}
                                        disabled={!currentAudio || isUsed || checkResult !== null}
                                        style={{
                                            padding: '10px 15px',
                                            border: '2px solid',
                                            borderColor: pairColor || '#ccc',
                                            backgroundColor: pairColor ? `${pairColor}20` : 'white',
                                            cursor: (!currentAudio || isUsed || checkResult !== null) ? 
                                                'not-allowed' : 'pointer',
                                            borderRadius: '5px',
                                            opacity: isUsed ? 0.7 : 1
                                        }}
                                    >
                                        {wordItem.word}
                                        {pairColor && ' ✓'}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {pairs.length > 0 && (
                        <div style={{ marginBottom: '30px' }}>
                            <h2>Созданные пары ({pairs.length} из {currentTask.correctPairs.length}):</h2>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {pairs.map((pair, index) => {
                                    const audioItem = currentTask.audio.find(a => a.id === pair.audioId);
                                    const wordItem = currentTask.words.find(w => w.id === pair.wordId);
                                    
                                    return (
                                        <div
                                            key={index}
                                            onClick={() => handleRemovePair(index)}
                                            style={{
                                                padding: '10px 15px',
                                                border: `2px solid ${pair.color}`,
                                                backgroundColor: `${pair.color}20`,
                                                borderRadius: '5px',
                                                cursor: checkResult !== null ? 'default' : 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px'
                                            }}
                                        >
                                            <span>{audioItem.displayName}</span>
                                            <span>→</span>
                                            <span>{wordItem.word}</span>
                                            {checkResult === null && <span style={{ color: 'red' }}>×</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {currentAudio && (
                        <div style={{ 
                            marginBottom: '20px',
                            padding: '10px',
                            backgroundColor: '#fff3cd',
                            borderRadius: '5px'
                        }}>
                            <p>Выбрано аудио. Теперь выберите соответствующее слово.</p>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                            onClick={handleCheckAnswer}
                            disabled={checkResult !== null}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: checkResult === null ? 'pointer' : 'not-allowed',
                                fontSize: '16px'
                            }}
                        >
                            Проверить ({pairs.length}/{currentTask.correctPairs.length})
                        </button>

                        <button
                            onClick={initializeGame}
                            disabled={checkResult === null}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '5px',
                                cursor: checkResult !== null ? 'pointer' : 'not-allowed',
                                fontSize: '16px'
                            }}
                        >
                            Новое задание
                        </button>
                    </div>

                    {checkResult !== null && (
                        <div style={{
                            padding: '15px',
                            backgroundColor: checkResult ? '#d4edda' : '#f8d7da',
                            border: `1px solid ${checkResult ? '#c3e6cb' : '#f5c6cb'}`,
                            borderRadius: '5px',
                            color: checkResult ? '#155724' : '#721c24',
                            marginBottom: '20px'
                        }}>
                            <h3 style={{ marginTop: 0 }}>
                                {checkResult ? '✅ Правильно!' : '❌ Неправильно!'}
                            </h3>
                            <p>
                                {checkResult 
                                    ? `Вы нашли все ${currentTask.correctPairs.length} правильных пар!` 
                                    : `Попробуйте еще раз! Нужно найти все ${currentTask.correctPairs.length} правильных пар.`}
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
                        <h3>Информация о доступных парах</h3>
                        <p>Всего пар в базе: {uploadedPairs.length}</p>
                        <p>Из них ваших пар: {
                            uploadedPairs.filter(p => p.user_id === user.id).length
                        }</p>
                    </div>
                </>
            )}

            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; }
                        50% { opacity: 0.5; }
                        100% { opacity: 1; }
                    }
                `}
            </style>
        </div>
    );
};

export default Game;
import { useState, useEffect } from 'react';
import { apiService } from './services/ApiService'; // Импорт нового сервиса
import Stats from './components/Stats';
import PairManager from './components/PairManager';
import GameBoard from './components/GameBoard';

function App() {
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });
  const [currentTask, setCurrentTask] = useState(null);
  const [pairs, setPairs] = useState([]);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [checkResult, setCheckResult] = useState(null);
  const [colors, setColors] = useState([]);
  const [uploadedPairs, setUploadedPairs] = useState([]);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Инициализация данных из API (замена IndexedDB)
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Загружаем пары с сервера
        const data = await apiService.getPairs();
        setUploadedPairs(data);
        setIsInitialized(true);
      } catch (err) {
        console.error('Ошибка загрузки пар:', err);
        setError('Не удалось загрузить пары с сервера');
        setIsInitialized(true); // Все равно инициализируем, но с пустыми данными
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Сохранение статистики - можно оставить в localStorage или перенести на сервер
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('audioWordGameStats', JSON.stringify(stats));
    }
  }, [stats, isInitialized]);

useEffect(() => {
    if (currentTask && checkResult === null) {
        // Если идет игра - не обновляем список, чтобы не сбивать пользователя
        return;
    }
    
    const loadPairs = async () => {
        try {
            const data = await apiService.getPairs();
            setUploadedPairs(data);
            console.log('Список пар обновлен с сервера:', data.length, 'пар');
        } catch (error) {
            console.warn('Не удалось обновить список пар:', error.message);
        }
    };
    
    // Обновляем при монтировании и после каждого добавления/удаления
    loadPairs();
    
    // Можно добавить периодическое обновление (опционально)
    // const interval = setInterval(loadPairs, 30000); // Каждые 30 секунд
    // return () => clearInterval(interval);
  }, [currentTask, checkResult]); // Зависимости
  
  const generateColors = () => {
    const colorPalette = [
      '#FF6B6B', '#cb1099ff', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#28463eff', '#7f6ff7ff', '#5b396aff', '#85C1E9'
    ];
    return [...colorPalette].sort(() => Math.random() - 0.5);
  };

  // НОВАЯ ЛОГИКА ГЕНЕРАЦИИ ЗАДАНИЙ
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
        id: pair.id, // Теперь ID приходит с сервера
        audioData: pair.audio_data || pair.audioData, // Учитываем разное именование полей
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

  useEffect(() => {
    if (isInitialized && uploadedPairs.length >= 3) {
      initializeGame();
    }
  }, [uploadedPairs, isInitialized]);

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

  const handleCheckAnswer = () => {
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
    setStats(prev => ({
      ...prev,
      [isCorrect ? 'correct' : 'incorrect']: prev[isCorrect ? 'correct' : 'incorrect'] + 1
    }));
  };

  const handlePlayAudio = (audioId) => {
    if (!currentTask) return;
    
    const audioItem = currentTask.audio.find(a => a.id === audioId);
    if (!audioItem || !audioItem.audioData) {
      console.warn('Аудио не найдено или данные отсутствуют');
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

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Обновленная функция добавления пары с отправкой на сервер
 const handleAddPair = async (newPairData) => {
    setIsLoading(true);
    
    try {
        // 1. Преобразуем файл в Base64
        const audioData = await readFileAsBase64(newPairData.audioFile);
        
        // 2. Отправляем на сервер
        const result = await apiService.addPair({
            word: newPairData.word.trim(),
            audioData: audioData,
            fileName: newPairData.audioFile.name
        });
        
        console.log('✅ Результат от сервера:', result);
        
        // 3. ТОЛЬКО ПОСЛЕ УСПЕШНОГО ОТВЕТА ОБНОВЛЯЕМ СОСТОЯНИЕ
        const newUploadedPair = {
            id: result.pair?.id || result.id,
            word: result.pair?.word || newPairData.word.trim(),
            audioData: audioData,
            fileName: result.pair?.file_name || newPairData.audioFile.name
        };
        
        // 4. ОБНОВЛЯЕМ состояние пар (важно делать через предыдущее состояние)
        setUploadedPairs(prev => {
            const updated = [...prev, newUploadedPair];
            console.log('🔄 Обновленный список пар:', updated);
            return updated;
        });
        
        // 5. Показываем сообщение об успехе
        alert(`✅ Пара "${newPairData.word.trim()}" успешно добавлена! (ID: ${newUploadedPair.id})`);
        
        return result;
        
    } catch (error) {
        console.error('❌ Ошибка при добавлении пары:', error);
        
        let userMessage = error.message;
        
        if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
            userMessage = 'Нет соединения с сервером. Проверьте, запущен ли сервер на localhost:5000';
        } else if (error.message.includes('большой') || error.message.includes('413')) {
            userMessage = 'Аудиофайл слишком большой. Попробуйте файл меньше 5MB.';
        } else if (error.message.includes('500')) {
            userMessage = 'Внутренняя ошибка сервера. Проверьте консоль сервера.';
        }
        
        alert(`❌ Ошибка добавления: ${userMessage}`);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  // Обновленная функция удаления пары с сервера
  const handleDeleteUploadedPair = async (id) => {
    // Сначала показываем подтверждение
    if (!window.confirm(`Удалить пару с ID ${id}?`)) {
        return;
    }

    try {
        // Пытаемся удалить на сервере
        const result = await apiService.deletePair(id);
        
        // Если успешно - обновляем локальное состояние
        const updatedPairs = uploadedPairs.filter(pair => pair.id !== id);
        setUploadedPairs(updatedPairs);
        
        console.log('Удалено успешно:', result.message);
        alert(`Пара успешно удалена из базы данных!`);
        
    } catch (error) {
        console.error('Ошибка удаления:', error.message);
        
        // Если сервер вернул 404 (не найдено), удаляем только локально
        if (error.message.includes('404') || error.message.includes('не найдена')) {
            const updatedPairs = uploadedPairs.filter(pair => pair.id !== id);
            setUploadedPairs(updatedPairs);
            alert(`Пара не найдена на сервере. Удаление выполнено локально.`);
        } else {
            // Другие ошибки (проблемы с сетью, сервером и т.д.)
            alert(`Ошибка удаления: ${error.message}`);
        }
    }
  };

  // Обновленная функция очистки всех пар с сервера
  const handleClearAllPairs = async () => {
    if (uploadedPairs.length === 0) {
      alert('Нет пар для удаления');
      return;
    }
    
    if (!window.confirm(`Вы уверены, что хотите удалить ВСЕ пары (${uploadedPairs.length} шт.)? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      // Очищаем все пары на сервере через API
      await apiService.clearAllPairs();
      
      // Очищаем локальное состояние
      setUploadedPairs([]);
      
      alert(`Все пары (${uploadedPairs.length} шт.) успешно удалены с сервера`);
      
    } catch (err) {
      console.error('Ошибка при удалении всех пар:', err);
      
      if (err.message.includes('Failed to fetch')) {
        alert('Ошибка подключения к серверу. Пары не удалены.');
      } else {
        alert(`Ошибка при удалении всех пар: ${err.message}`);
      }
    }
  };

  const handleResetStats = () => {
    if (window.confirm('Вы уверены, что хотите сбросить статистику?')) {
      setStats({ correct: 0, incorrect: 0 });
    }
  };

  // Показываем состояние загрузки
  if (!isInitialized || isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'black', color: 'white', minHeight: '100vh' }}>
        <h1>monolingo Игра 1</h1>
        <p>Загрузка данных с сервера...</p>
      </div>
    );
  }
  
  return (
    <div style={{background:'black', color:'white', padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>monolingo Игра 1</h1>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          ⚠️ {error}
        </div>
      )}
      
      <Stats 
        stats={stats} 
        onResetStats={handleResetStats} 
      />

      <PairManager
        uploadedPairs={uploadedPairs}
        onAddPair={handleAddPair}
        onDeletePair={handleDeleteUploadedPair}
        onClearAllPairs={handleClearAllPairs}
      />

      <GameBoard
        currentTask={currentTask}
        pairs={pairs}
        currentAudio={currentAudio}
        checkResult={checkResult}
        currentPlayingAudio={currentPlayingAudio}
        onAudioSelect={handleAudioSelect}
        onWordSelect={handleWordSelect}
        onRemovePair={handleRemovePair}
        onCheckAnswer={handleCheckAnswer}
        onNextGame={initializeGame}
        onPlayAudio={handlePlayAudio}
      />

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
}

export default App;
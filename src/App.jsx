import { useState, useEffect } from 'react';
import IndexedDBService from './services/IndexedDBService'
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

  // Инициализация данных из IndexedDB
  useEffect(() => {
    const initializeData = async () => {
      try {
        await IndexedDBService.init();
        const [savedPairs, savedStats] = await Promise.all([
          IndexedDBService.getAllPairs(),
          IndexedDBService.getStats()
        ]);
        
        setUploadedPairs(savedPairs);
        setStats(savedStats);
        setIsInitialized(true);
      } catch (error) {
        console.error('Ошибка при инициализации данных:', error);
        setIsInitialized(true);
      }
    };

    initializeData();
  }, []);

  // Сохранение статистики при изменении
  useEffect(() => {
    if (isInitialized) {
      IndexedDBService.saveStats(stats);
    }
  }, [stats, isInitialized]);

  const generateColors = () => {
    const colorPalette = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return [...colorPalette].sort(() => Math.random() - 0.5);
  };

  const generateNewData = () => {
    if (uploadedPairs.length < 3) return null;

    const maxItems = Math.min(uploadedPairs.length, 6);
    const itemCount = Math.max(3, Math.floor(Math.random() * (maxItems - 2)) + 3);
    
    const selectedPairs = [...uploadedPairs]
      .sort(() => Math.random() - 0.5)
      .slice(0, itemCount);

    const audioArray = [];
    const wordArray = [];

    selectedPairs.forEach((pair, index) => {
      audioArray.push({
        id: pair.id,
        audioData: pair.audioData,
        displayName: `Аудио ${index + 1}`
      });

      wordArray.push({
        id: pair.id,
        word: pair.word
      });
    });

    const matchingPairs = [];
    const usedIds = new Set();
    
    const pairCount = Math.min(Math.floor(Math.random() * 4), selectedPairs.length);
    for (let i = 0; i < pairCount; i++) {
      let pairId;
      
      do {
        const randomIndex = Math.floor(Math.random() * selectedPairs.length);
        pairId = selectedPairs[randomIndex].id;
      } while (usedIds.has(pairId));
      
      usedIds.add(pairId);
      matchingPairs.push({ audioId: pairId, wordId: pairId });
    }

    const shuffledAudio = [...audioArray].sort(() => Math.random() - 0.5);
    const shuffledWords = [...wordArray].sort(() => Math.random() - 0.5);

    return {
      audio: shuffledAudio,
      words: shuffledWords,
      correctPairs: matchingPairs
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

    const allCorrectPairsSelected = currentTask.correctPairs.every(correctPair =>
      pairs.some(pair => 
        pair.audioId === correctPair.audioId && pair.wordId === correctPair.wordId
      )
    );

    const isCorrect = userPairsCorrect && allCorrectPairsSelected && 
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

  const handleAddPair = async (newPairData) => {
    const newId = uploadedPairs.length > 0 
      ? Math.max(...uploadedPairs.map(p => p.id)) + 1 
      : 1;

    const audioData = await readFileAsBase64(newPairData.audioFile);

    const newUploadedPair = {
      id: newId,
      word: newPairData.word.trim(),
      audioData: audioData,
      fileName: newPairData.audioFile.name
    };

    const updatedPairs = [...uploadedPairs, newUploadedPair];
    setUploadedPairs(updatedPairs);
    await IndexedDBService.savePair(newUploadedPair);
  };

  const handleDeleteUploadedPair = async (id) => {
    const updatedPairs = uploadedPairs.filter(pair => pair.id !== id);
    setUploadedPairs(updatedPairs);
    await IndexedDBService.deletePair(id);
  };

  const handleClearAllPairs = async () => {
    if (window.confirm('Вы уверены, что хотите удалить все пары?')) {
      setUploadedPairs([]);
      await IndexedDBService.clearAllPairs();
    }
  };

  const handleResetStats = () => {
    if (window.confirm('Вы уверены, что хотите сбросить статистику?')) {
      setStats({ correct: 0, incorrect: 0 });
    }
  };

  if (!isInitialized) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Аудио-Слово Игра</h1>
      
      <Stats stats={stats} onResetStats={handleResetStats} />

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
import React from 'react';

const GameBoard = ({ 
  currentTask, 
  pairs, 
  currentAudio, 
  checkResult, 
  currentPlayingAudio,
  onAudioSelect, 
  onWordSelect, 
  onRemovePair, 
  onCheckAnswer, 
  onNextGame, 
  onPlayAudio 
}) => {
  const getElementColor = (type, id) => {
    const pair = pairs.find(p => 
      type === 'audio' ? p.audioId === id : p.wordId === id
    );
    return pair ? pair.color : null;
  };

  if (!currentTask) {
    return (
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd',
        borderRadius: '5px',
        textAlign: 'center'
      }}>
        <p>Добавьте пары слов и аудио, чтобы начать игру. Необходимо минимум 3 пары.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#f0f8ff',
        borderRadius: '5px'
      }}>
        <p><strong>Инструкция:</strong> Последовательно выбирайте аудио и соответствующее ему слово.</p>
        <p>Созданные пары будут отображаться ниже и выделяться цветом.</p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Аудио:</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {currentTask.audio.map(audioItem => {
            const pairColor = getElementColor('audio', audioItem.id);
            const isUsed = pairs.some(p => p.audioId === audioItem.id);
            const isPlaying = currentPlayingAudio === audioItem.id;
            
            return (
              <button
                key={audioItem.id}
                onClick={() => onAudioSelect(audioItem.id)}
                onDoubleClick={() => onPlayAudio(audioItem.id)}
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
        <h2>Слова:</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {currentTask.words.map(wordItem => {
            const pairColor = getElementColor('word', wordItem.id);
            const isUsed = pairs.some(p => p.wordId === wordItem.id);
            
            return (
              <button
                key={wordItem.id}
                onClick={() => onWordSelect(wordItem.id)}
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
          <h2>Созданные пары:</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {pairs.map((pair, index) => {
              const audioItem = currentTask.audio.find(a => a.id === pair.audioId);
              const wordItem = currentTask.words.find(w => w.id === pair.wordId);
              
              return (
                <div
                  key={index}
                  onClick={() => onRemovePair(index)}
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
          <p>Выбрано аудио {currentTask.audio.find(a => a.id === currentAudio).displayName}. Теперь выберите соответствующее слово.</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={onCheckAnswer}
          disabled={checkResult !== null}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: checkResult === null ? 'pointer' : 'not-allowed'
          }}
        >
          Проверить
        </button>

        <button
          onClick={onNextGame}
          disabled={checkResult === null}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: checkResult !== null ? 'pointer' : 'not-allowed'
          }}
        >
          Далее
        </button>
      </div>

      {checkResult !== null && (
        <div style={{
          padding: '15px',
          backgroundColor: checkResult ? '#d4edda' : '#f8d7da',
          border: `1px solid ${checkResult ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '5px',
          color: checkResult ? '#155724' : '#721c24'
        }}>
          <h3>{checkResult ? '✅ Правильно!' : '❌ Неправильно!'}</h3>
          <p>
            {checkResult 
              ? 'Все пары совпали!' 
              : `Правильные пары: ${currentTask.correctPairs.map(p => {
                const audioItem = currentTask.audio.find(a => a.id === p.audioId);
                const wordItem = currentTask.words.find(w => w.id === p.wordId);
                return `${audioItem.displayName} - ${wordItem.word}`;
              }).join(', ') || 'нет пар'}`}
          </p>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>💡 Подсказка: Двойной клик по аудио для прослушивания</p>
        <p>💡 Для удаления пары - кликните на неё в списке пар</p>
      </div>
    </>
  );
};

export default GameBoard;
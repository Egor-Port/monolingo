import React, { useState, useRef } from 'react';

const PairManager = ({ 
  uploadedPairs, 
  onAddPair, 
  onDeletePair, 
  onClearAllPairs 
}) => {
  const [newPair, setNewPair] = useState({ word: '', audioFile: null });
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        alert('Пожалуйста, выберите аудиофайл');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('Файл слишком большой. Максимальный размер 10MB.');
        return;
      }
      setNewPair(prev => ({ ...prev, audioFile: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newPair.word.trim() || !newPair.audioFile) {
      alert('Пожалуйста, введите слово и выберите аудиофайл');
      return;
    }

    setIsLoading(true);
    try {
      await onAddPair(newPair);
      setNewPair({ word: '', audioFile: null });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert(`Пара "${newPair.word}" добавлена успешно!`);
    } catch (error) {
      console.error('Ошибка при добавлении пары:', error);
      alert('Произошла ошибка при добавлении пары');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      marginBottom: '30px', 
      padding: '20px', 
      backgroundColor: '#5d5d5dff',
      borderRadius: '8px',
      border: '1px solid #dee2e6'
    }}>
      <h2>Добавить новую пару (аудио + слово)</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1'}}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Слово:
          </label>
          <input
            type="text"
            value={newPair.word}
            onChange={(e) => setNewPair(prev => ({ ...prev, word: e.target.value }))}
            placeholder="Введите слово"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ flex: '1 1' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Аудиофайл:
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <small style={{ color: '#666' }}>Максимальный размер: 10MB</small>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '8px 16px',
            backgroundColor: isLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            flex: '0 0 auto'
          }}
        >
          {isLoading ? 'Добавление...' : 'Добавить пару'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Загруженные пары ({uploadedPairs.length}):</h3>
          {uploadedPairs.length > 0 && (
            <button
              onClick={onClearAllPairs}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Удалить все
            </button>
          )}
        </div>
        {uploadedPairs.length === 0 ? (
          <p>Нет загруженных пар. Добавьте первую пару, используя форму выше!</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {uploadedPairs.map(pair => (
              <div
                key={pair.id}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #007bff',
                  borderRadius: '5px',
                  backgroundColor: '#333333ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  flex: '1 1 200px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div><strong>ID {pair.id}:</strong> {pair.word}</div>
                  {pair.fileName && (
                    <div style={{ fontSize: '0.8em', color: '#666' }}>
                      {pair.fileName}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => onDeletePair(pair.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'red',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PairManager;
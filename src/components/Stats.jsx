import React from 'react';

const Stats = ({ 
  stats, 
  onResetStats 
}) => {
  return (
    <div style={{ 
      marginBottom: '20px', 
      padding: '15px', 
      backgroundColor: '#5d5d5dff',
      borderRadius: '5px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div>
        <p><strong>Правильно:</strong> {stats.correct} | <strong>Неправильно:</strong> {stats.incorrect}</p>
        {stats.correct + stats.incorrect > 0 && (
          <p>
            <strong>Процент правильных:</strong> {Math.round(stats.correct / (stats.correct + stats.incorrect) * 100)}%
          </p>
        )}
      </div>
      <button
        onClick={onResetStats}
        style={{
          padding: '5px 10px',
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Сбросить статистику
      </button>
    </div>
  );
};

export default Stats;
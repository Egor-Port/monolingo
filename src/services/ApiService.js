const API_URL = 'http://localhost:5000/api';

export const apiService = {
    // Получить все пары
    async getPairs() {
        try {
            const response = await fetch(`${API_URL}/pairs`);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка HTTP:', response.status, errorText);
                throw new Error(`Ошибка загрузки пар: ${response.status}`);
            }
            
            const data = await response.json();
            return data; // Предполагаем, что сервер возвращает массив пар напрямую
            
        } catch (error) {
            console.error('Ошибка в getPairs:', error);
            throw error;
        }
    },

    // Добавить новую пару - УЛУЧШЕННАЯ ОБРАБОТКА
    async addPair(newPair) {
        try {
            const response = await fetch(`${API_URL}/pairs`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    word: newPair.word,
                    audioData: newPair.audioData,
                    fileName: newPair.fileName
                })
            });
            
            console.log('Статус ответа:', response.status);
            const responseText = await response.text();
            console.log('Текст ответа:', responseText);
            
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (parseError) {
                console.error('Не удалось распарсить JSON:', parseError);
                throw new Error(`Сервер вернул некорректный JSON: ${responseText.substring(0, 100)}`);
            }
            
            if (!response.ok) {
                console.error('Ошибка от сервера:', responseData);
                throw new Error(responseData.error || `Ошибка ${response.status}: ${responseData.message || 'Неизвестная ошибка'}`);
            }
            
            if (!responseData.success) {
                throw new Error(responseData.error || 'Сервер сообщил об ошибке');
            }
            
            console.log('Успешно сохранено:', responseData);
            return responseData.data; // Возвращаем данные созданной пары
            
        } catch (error) {
            console.error('Ошибка в addPair:', error);
            throw error;
        }
    },
    
    // Удалить пару (если нужно)
    async deletePair(id) {
        try {
            const response = await fetch(`${API_URL}/pairs/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`Ошибка удаления: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Ошибка в deletePair:', error);
            throw error;
        }
    }
};
const API_URL = 'http://localhost:5000/api';

export const apiService = {
    async getPairs() {
        const response = await fetch(`${API_URL}/pairs`);
        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.status}`);
        return await response.json();
    },

    async addPair(newPair) {
        console.log('📤 Отправка данных на сервер:', { 
            word: newPair.word,
            fileName: newPair.fileName,
            audioLength: newPair.audioData?.length 
        });
        
        const response = await fetch(`${API_URL}/pairs`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newPair)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error('❌ Ошибка сервера:', data);
            throw new Error(data.error || `Ошибка ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Успешный ответ сервера:', data);
        return data;
    },

    async deletePair(id) {
        const response = await fetch(`${API_URL}/pairs/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
        return await response.json();
    }
};
class IndexedDBService {
  constructor() {
    this.dbName = 'AudioWordGameDB';
    this.version = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        if (!db.objectStoreNames.contains('pairs')) {
          const store = db.createObjectStore('pairs', { keyPath: 'id' });
          store.createIndex('word', 'word', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('stats')) {
          db.createObjectStore('stats', { keyPath: 'id' });
        }
      };
    });
  }

  async getAllPairs() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pairs'], 'readonly');
      const store = transaction.objectStore('pairs');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async savePair(pair) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pairs'], 'readwrite');
      const store = transaction.objectStore('pairs');
      const request = store.put(pair);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deletePair(id) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pairs'], 'readwrite');
      const store = transaction.objectStore('pairs');
      const request = store.delete(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllPairs() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pairs'], 'readwrite');
      const store = transaction.objectStore('pairs');
      const request = store.clear();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getStats() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stats'], 'readonly');
      const store = transaction.objectStore('stats');
      const request = store.get('gameStats');

      request.onsuccess = () => resolve(request.result || { correct: 0, incorrect: 0 });
      request.onerror = () => reject(request.error);
    });
  }

  async saveStats(stats) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stats'], 'readwrite');
      const store = transaction.objectStore('stats');
      const request = store.put({ id: 'gameStats', ...stats });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

export default new IndexedDBService();
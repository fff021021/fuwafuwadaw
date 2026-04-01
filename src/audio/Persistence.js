/**
 * DAW Local Persistence (IndexedDB)
 */
class Persistence {
  constructor() {
    this.dbName = 'FuwaDAW';
    this.dbVersion = 1;
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('projects')) {
          db.createObjectStore('projects', { keyPath: 'id' });
        }
      };
      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve();
      };
      request.onerror = reject;
    });
  }

  async saveProject(data) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readwrite');
      const store = transaction.objectStore('projects');
      store.put({ id: 'last_session', data, timestamp: Date.now() });
      transaction.oncomplete = resolve;
      transaction.onerror = reject;
    });
  }

  async loadProject() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['projects'], 'readonly');
      const store = transaction.objectStore('projects');
      const request = store.get('last_session');
      request.onsuccess = () => resolve(request.result ? request.result.data : null);
      request.onerror = reject;
    });
  }
}

const persistence = new Persistence();
export default persistence;

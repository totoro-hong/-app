const DB_NAME = 'important-dates';
const DB_VERSION = 2;
const STORE_NAME = 'dates';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('category', 'category', { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const db = {
  async add(item) {
    const conn = await openDB();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      item.createdAt = new Date().toISOString();
      item.sortOrder = item.sortOrder ?? Date.now();
      const req = store.add(item);
      req.onsuccess = () => { resolve(req.result); };
      req.onerror = () => reject(req.error);
    });
  },

  async getAll() {
    const conn = await openDB();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async remove(id) {
    const conn = await openDB();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async update(item) {
    const conn = await openDB();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async updateSortOrders(orders) {
    const conn = await openDB();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      let pending = orders.length;
      orders.forEach(({ id, sortOrder }) => {
        const getReq = store.get(id);
        getReq.onsuccess = () => {
          const item = getReq.result;
          if (item) {
            item.sortOrder = sortOrder;
            store.put(item);
          }
          pending--;
          if (pending === 0) resolve();
        };
        getReq.onerror = () => reject(getReq.error);
      });
    });
  },

  async clear() {
    const conn = await openDB();
    return new Promise((resolve, reject) => {
      const tx = conn.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async exportAll() {
    const items = await this.getAll();
    return JSON.stringify(items, null, 2);
  },

  async importAll(items) {
    await this.clear();
    for (const item of items) {
      const { id, ...rest } = item;
      await this.add(rest);
    }
    return items.length;
  }
};

// IndexedDB Helper for Memory Palace Storage

const DB_NAME = 'MemoryPalaceDB';
const DB_VERSION = 1;
const STORE_NAME = 'palaces';

// Initialize database
function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                
                // Create indexes for querying
                objectStore.createIndex('timestamp', 'timestamp', { unique: false });
                objectStore.createIndex('theme', 'theme', { unique: false });
            }
        };
    });
}

// Save Memory Palace to IndexedDB
async function saveMemoryPalace(content, theme, result) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        const palaceData = {
            content: content,
            theme: theme || '',
            result: result,
            timestamp: Date.now()
        };
        
        return new Promise((resolve, reject) => {
            const request = store.add(palaceData);
            request.onsuccess = () => {
                // Keep only last 20 entries
                cleanupOldEntries(store);
                resolve(request.result);
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error saving Memory Palace:', error);
        throw error;
    }
}

// Get the most recent Memory Palace
async function getLatestMemoryPalace() {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        
        return new Promise((resolve, reject) => {
            const request = index.openCursor(null, 'prev'); // Start from most recent
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    resolve(cursor.value);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting latest Memory Palace:', error);
        return null;
    }
}

// Get all Memory Palaces (for history)
async function getAllMemoryPalaces(limit = 20) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        
        return new Promise((resolve, reject) => {
            const palaces = [];
            const request = index.openCursor(null, 'prev'); // Most recent first
            
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && palaces.length < limit) {
                    palaces.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(palaces);
                }
            };
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error getting Memory Palaces:', error);
        return [];
    }
}

// Delete a Memory Palace by ID
async function deleteMemoryPalace(id) {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error deleting Memory Palace:', error);
        throw error;
    }
}

// Clear all Memory Palaces
async function clearAllMemoryPalaces() {
    try {
        const db = await initDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error('Error clearing Memory Palaces:', error);
        throw error;
    }
}

// Keep only the last 20 entries
async function cleanupOldEntries(store) {
    try {
        const index = store.index('timestamp');
        const request = index.openCursor(null, 'prev');
        let count = 0;
        const toDelete = [];
        
        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                count++;
                if (count > 20) {
                    toDelete.push(cursor.value.id);
                }
                cursor.continue();
            } else {
                // Delete old entries
                toDelete.forEach(id => {
                    store.delete(id);
                });
            }
        };
    } catch (error) {
        console.error('Error cleaning up old entries:', error);
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        saveMemoryPalace,
        getLatestMemoryPalace,
        getAllMemoryPalaces,
        deleteMemoryPalace,
        clearAllMemoryPalaces
    };
}


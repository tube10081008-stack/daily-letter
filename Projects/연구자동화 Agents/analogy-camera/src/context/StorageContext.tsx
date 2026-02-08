import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { v4 as uuidv4 } from 'uuid';

const DB_NAME = 'analogy-camera-db';
const STORE_NAME = 'photos';
const DEVELOPMENT_TIME_MS = 3 * 24 * 60 * 60 * 1000; // 3 Days

export interface Photo {
    id: string;
    blob: Blob;
    createdAt: number;
    developsAt: number;
    status: 'developing' | 'developed';
    filter?: string; // CSS filter string
}

interface AnalogyDB extends DBSchema {
    photos: {
        key: string;
        value: Photo;
        indexes: { 'by-status': string, 'by-date': number };
    };
}

interface StorageContextType {
    db: IDBPDatabase<AnalogyDB> | null;
    savePhoto: (blob: Blob, filter?: string) => Promise<void>;
    pendingCount: number;
    photos: Photo[];
    refreshPhotos: () => Promise<void>;
    forceDevelopAll: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | null>(null);

export const useStorage = () => {
    const context = useContext(StorageContext);
    if (!context) throw new Error("useStorage must be used within StorageProvider");
    return context;
};

export const StorageProvider = ({ children }: { children: ReactNode }) => {
    const [db, setDb] = useState<IDBPDatabase<AnalogyDB> | null>(null);
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const initDB = async () => {
            const db = await openDB<AnalogyDB>(DB_NAME, 1, {
                upgrade(db) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    store.createIndex('by-status', 'status');
                    store.createIndex('by-date', 'createdAt');
                },
            });
            setDb(db);
            checkDevelopmentStatus(db);
        };
        initDB();
    }, []);

    const checkDevelopmentStatus = async (database: IDBPDatabase<AnalogyDB>) => {
        const now = Date.now();
        const tx = database.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('by-status');

        // Get all developing photos
        const developing = await index.getAll('developing');

        let updated = false;
        for (const photo of developing) {
            if (now >= photo.developsAt) {
                photo.status = 'developed';
                await store.put(photo);
                updated = true;
            }
        }

        if (updated) await tx.done;
        loadPhotos(database);
    };

    const loadPhotos = async (database: IDBPDatabase<AnalogyDB>) => {
        const allPhotos = await database.getAllFromIndex(STORE_NAME, 'by-date');
        setPhotos(allPhotos.reverse()); // Newest first
        setPendingCount(allPhotos.filter(p => p.status === 'developing').length);
    };

    const refreshPhotos = async () => {
        if (db) {
            await checkDevelopmentStatus(db);
        }
    };

    const savePhoto = async (blob: Blob, filter?: string) => {
        if (!db) return;
        const now = Date.now();
        const photo: Photo = {
            id: uuidv4(),
            blob,
            createdAt: now,
            developsAt: now + DEVELOPMENT_TIME_MS,
            status: 'developing',
            filter: filter || '',
        };
        await db.add(STORE_NAME, photo);
        await refreshPhotos();
    };

    const forceDevelopAll = async () => {
        if (!db) return;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const index = store.index('by-status');
        const developing = await index.getAll('developing');

        for (const photo of developing) {
            photo.status = 'developed';
            photo.developsAt = 0; // Set to past
            await store.put(photo);
        }
        await tx.done;
        await refreshPhotos();
    };

    return (
        <StorageContext.Provider value={{ db, savePhoto, pendingCount, photos, refreshPhotos, forceDevelopAll }}>
            {children}
        </StorageContext.Provider>
    );
};

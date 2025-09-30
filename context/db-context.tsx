"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { openDB, IDBPDatabase } from "idb";

export interface BookMetadata {
  title: string;
  creator: string;
  series?: string;
  seriesIndex?: string;
  description?: string;
  language?: string;
  publisher?: string;
  rights?: string;
  modified_date?: string;
  coverBlob?: Blob; // Persisted cover image
  readingCfi?: string; // Last read position
  readingProgressPercent?: number; // 0-100
  finished?: boolean; // true when book is completed
  contentHash?: string; // SHA-256 of file content for duplicate detection
  readingSettings?: {
    fontSize: number;
    lineHeight: number;
    font: string;
    background: string;
    color: string;
    presetId?: string;
  };
}

interface DBContextType {
  addBook: (id: number, file: File) => Promise<void>;
  addBookMetadata: (id: number, metadata: BookMetadata) => Promise<void>;
  getBookMetadata: (id: number) => Promise<BookMetadata | undefined>;
  getAllBookMetadata: () => Promise<BookMetadata[]>;
  getBook: (id: number) => Promise<any>;
  getAllBooks: () => Promise<any[]>;
  getAllBookKeys: () => Promise<IDBValidKey[]>;
  hasBook: (id: number) => Promise<boolean>;
  deleteBook: (id: number) => Promise<void>;
  setReadingProgress: (
    id: number,
    cfi: string,
    percent?: number,
    finished?: boolean
  ) => Promise<void>;
  getReadingProgress: (id: number) => Promise<string | undefined>;
  clearReadingProgress: (id: number) => Promise<void>;
  setReadingSettings: (
    id: number,
    settings: NonNullable<BookMetadata["readingSettings"]>
  ) => Promise<void>;
  getReadingSettings: (
    id: number
  ) => Promise<BookMetadata["readingSettings"] | undefined>;
  isLoading: boolean;
}

const DBContext = createContext<DBContextType | null>(null);

const DB_NAME = process.env.NEXT_PUBLIC_APP_DB!;
const BOOKS_STORE_NAME = process.env.NEXT_PUBLIC_BOOKS_TABLE!;
const METADATA_STORE_NAME = process.env.NEXT_PUBLIC_BOOKS_METADATA_TABLE!;

const initializeDatabase = async () => {
  // Keep version at 3 to avoid downgrade errors for users who already opened v3
  // We no longer create a separate progress store; progress is stored in metadata
  return openDB(DB_NAME, 3, {
    upgrade(db) {
      // Create object stores if they do not already exist
      if (!db.objectStoreNames.contains(BOOKS_STORE_NAME)) {
        db.createObjectStore(BOOKS_STORE_NAME);
      }
      if (!db.objectStoreNames.contains(METADATA_STORE_NAME)) {
        db.createObjectStore(METADATA_STORE_NAME);
      }
    },
  });
};

export const DBProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dbImpl, setDbImpl] = useState<IDBPDatabase | null>(null);

  useEffect(() => {
    initializeDatabase().then((db) => {
      console.log("Initializing database");
      setDbImpl(db);
      setIsLoading(false);
    });

    return () => {
      if (dbImpl) {
        dbImpl.close();
      }
    };
  }, []);

  const addBook = async (id: number, book: File) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      await dbImpl.put(BOOKS_STORE_NAME, book, id);
    } catch (error) {
      console.error("Error adding book:", error);
      throw error;
    }
  };

  const getBook = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const file = await dbImpl.get(BOOKS_STORE_NAME, id);
      if (!file) {
        const errorMsg = "Book not found in IndexedDB";
        console.error(errorMsg);
        throw errorMsg;
      }
      return file;
    } catch (error) {
      console.error("Error getting book:", error);
      throw error;
    }
  };

  const getAllBooks = async () => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const books = await dbImpl.getAll(BOOKS_STORE_NAME);
      return books;
    } catch (error) {
      console.error("Error getting all books:", error);
      throw error;
    }
  };

  const getAllBookKeys = async () => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const keys = await dbImpl.getAllKeys(BOOKS_STORE_NAME);
      return keys;
    } catch (error) {
      console.error("Error getting all book keys:", error);
      throw error;
    }
  };

  const hasBook = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const exists = (await dbImpl.getKey(BOOKS_STORE_NAME, id)) != null;
      return exists;
    } catch (error) {
      console.error("Error checking if book exists:", error);
      throw error;
    }
  };

  const deleteBook = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      await dbImpl.delete(BOOKS_STORE_NAME, id);
      // Ensure metadata is also deleted to keep stores in sync
      await dbImpl.delete(METADATA_STORE_NAME, id);
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  };

  const addBookMetadata = async (id: number, metadata: BookMetadata) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      await dbImpl.put(METADATA_STORE_NAME, metadata, id);
    } catch (error) {
      console.error("Error adding book metadata:", error);
      throw error;
    }
  };

  const getBookMetadata = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const data = await dbImpl.get(METADATA_STORE_NAME, id);
      return data;
    } catch (error) {
      console.error("Error getting book metadata:", error);
      throw error;
    }
  };

  const getAllBookMetadata = async () => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const all = await dbImpl.getAll(METADATA_STORE_NAME);
      return all;
    } catch (error) {
      console.error("Error getting all book metadata:", error);
      throw error;
    }
  };

  const setReadingProgress = async (
    id: number,
    cfi: string,
    percent?: number,
    finished?: boolean
  ) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const existing = (await dbImpl.get(
        METADATA_STORE_NAME,
        id
      )) as BookMetadata | undefined;
      const updated: BookMetadata = {
        title: existing?.title || "Untitled",
        creator: existing?.creator || "",
        series: existing?.series,
        seriesIndex: existing?.seriesIndex,
        description: existing?.description,
        language: existing?.language,
        publisher: existing?.publisher,
        rights: existing?.rights,
        modified_date: existing?.modified_date,
        coverBlob: existing?.coverBlob,
        readingCfi: cfi,
        readingProgressPercent:
          typeof percent === "number"
            ? Math.max(0, Math.min(100, Math.round(percent)))
            : existing?.readingProgressPercent,
        finished: typeof finished === "boolean" ? finished : existing?.finished,
        readingSettings: existing?.readingSettings,
      };
      await dbImpl.put(METADATA_STORE_NAME, updated, id);
    } catch (error) {
      console.error("Error setting reading progress:", error);
      throw error;
    }
  };

  const setReadingSettings = async (
    id: number,
    settings: NonNullable<BookMetadata["readingSettings"]>
  ) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const existing = (await dbImpl.get(
        METADATA_STORE_NAME,
        id
      )) as BookMetadata | undefined;
      const updated: BookMetadata = {
        title: existing?.title || "Untitled",
        creator: existing?.creator || "",
        series: existing?.series,
        seriesIndex: existing?.seriesIndex,
        description: existing?.description,
        language: existing?.language,
        publisher: existing?.publisher,
        rights: existing?.rights,
        modified_date: existing?.modified_date,
        coverBlob: existing?.coverBlob,
        readingCfi: existing?.readingCfi,
        readingProgressPercent: existing?.readingProgressPercent,
        finished: existing?.finished,
        readingSettings: settings,
      };
      await dbImpl.put(METADATA_STORE_NAME, updated, id);
    } catch (error) {
      console.error("Error setting reading settings:", error);
      throw error;
    }
  };

  const getReadingSettings = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const existing = (await dbImpl.get(
        METADATA_STORE_NAME,
        id
      )) as BookMetadata | undefined;
      return existing?.readingSettings ?? undefined;
    } catch (error) {
      console.error("Error getting reading settings:", error);
      throw error;
    }
  };

  const getReadingProgress = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const existing = (await dbImpl.get(
        METADATA_STORE_NAME,
        id
      )) as BookMetadata | undefined;
      return existing?.readingCfi ?? undefined;
    } catch (error) {
      console.error("Error getting reading progress:", error);
      throw error;
    }
  };

  const clearReadingProgress = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      const existing = (await dbImpl.get(
        METADATA_STORE_NAME,
        id
      )) as BookMetadata | undefined;
      if (!existing) return;
      const { readingCfi, ...rest } = existing;
      await dbImpl.put(METADATA_STORE_NAME, { ...rest }, id);
    } catch (error) {
      console.error("Error clearing reading progress:", error);
      throw error;
    }
  };

  return (
    <DBContext.Provider
      value={{ addBook, addBookMetadata, getBookMetadata, getAllBookMetadata, getBook, getAllBooks, getAllBookKeys, hasBook, deleteBook, setReadingProgress, getReadingProgress, clearReadingProgress, setReadingSettings, getReadingSettings, isLoading }}
    >
      {children}
    </DBContext.Provider>
  );
};

export function useDB() {
  const context = useContext(DBContext);
  if (!context) {
    throw new Error("useDB must be used within a DBProvider");
  }
  return context;
}

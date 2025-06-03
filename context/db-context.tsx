"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { openDB, IDBPDatabase } from "idb";

interface DBContextType {
  addBook: (id: number, file: File) => Promise<void>;
  getBook: (id: number) => Promise<any>;
  getAllBooks: () => Promise<any[]>;
  deleteBook: (id: number) => Promise<void>;
  isLoading: boolean;
}

const DBContext = createContext<DBContextType | null>(null);

const DB_NAME = process.env.NEXT_PUBLIC_APP_DB!;
const BOOKS_STORE_NAME = process.env.NEXT_PUBLIC_BOOKS_TABLE!;
const METADATA_STORE_NAME = process.env.NEXT_PUBLIC_BOOKS_METADATA_TABLE!;

const initializeDatabase = async () => {
  return openDB(DB_NAME, 2, {
    upgrade(db) {
      db.createObjectStore(BOOKS_STORE_NAME);
      db.createObjectStore(METADATA_STORE_NAME);
    },
  });
};

export const DBProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [dbImpl, setDbImpl] = useState<IDBPDatabase | null>(null);

  useEffect(() => {
    initializeDatabase().then((db) => {
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

  const deleteBook = async (id: number) => {
    if (!dbImpl) throw new Error("Database not initialized");
    try {
      await dbImpl.delete(BOOKS_STORE_NAME, id);
    } catch (error) {
      console.error("Error deleting book:", error);
      throw error;
    }
  };

  return (
    <DBContext.Provider
      value={{ addBook, getBook, getAllBooks, deleteBook, isLoading }}
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

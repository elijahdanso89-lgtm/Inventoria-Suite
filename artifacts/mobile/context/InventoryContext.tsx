import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useState } from "react";

export type Category =
  | "electronics"
  | "clothing"
  | "food"
  | "tools"
  | "furniture"
  | "sports"
  | "books"
  | "other";

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  category: Category;
  quantity: number;
  minQuantity: number;
  price: number;
  location: string;
  description: string;
  createdAt: number;
  updatedAt: number;
};

export type Transaction = {
  id: string;
  itemId: string;
  type: "in" | "out" | "adjustment";
  quantity: number;
  note: string;
  timestamp: number;
};

const STORAGE_KEY = "@inventoria_items";
const TRANSACTIONS_KEY = "@inventoria_transactions";

type InventoryContextType = {
  items: InventoryItem[];
  transactions: Transaction[];
  addItem: (item: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, quantity: number, type: "in" | "out" | "adjustment", note: string) => void;
  getLowStockItems: () => InventoryItem[];
  getItemTransactions: (itemId: string) => Transaction[];
  isLoading: boolean;
};

const [InventoryContextHook, InventoryContextProvider] = createContextHook<InventoryContextType>(
  () => {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      loadData();
    }, []);

    const loadData = async () => {
      try {
        const [itemsData, txData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(TRANSACTIONS_KEY),
        ]);
        if (itemsData) setItems(JSON.parse(itemsData));
        if (txData) setTransactions(JSON.parse(txData));
      } catch (e) {
        console.error("Failed to load inventory data", e);
      } finally {
        setIsLoading(false);
      }
    };

    const saveItems = async (newItems: InventoryItem[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
    };

    const saveTransactions = async (newTx: Transaction[]) => {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTx));
    };

    const addItem = useCallback(
      (itemData: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">) => {
        const now = Date.now();
        const newItem: InventoryItem = {
          ...itemData,
          id: now.toString() + Math.random().toString(36).substring(2, 9),
          createdAt: now,
          updatedAt: now,
        };
        setItems((prev) => {
          const updated = [newItem, ...prev];
          saveItems(updated);
          return updated;
        });
      },
      []
    );

    const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
      setItems((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
        );
        saveItems(updated);
        return updated;
      });
    }, []);

    const deleteItem = useCallback((id: string) => {
      setItems((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        saveItems(updated);
        return updated;
      });
    }, []);

    const adjustStock = useCallback(
      (itemId: string, quantity: number, type: "in" | "out" | "adjustment", note: string) => {
        const now = Date.now();
        const tx: Transaction = {
          id: now.toString() + Math.random().toString(36).substring(2, 9),
          itemId,
          type,
          quantity,
          note,
          timestamp: now,
        };

        setTransactions((prev) => {
          const updated = [tx, ...prev];
          saveTransactions(updated);
          return updated;
        });

        setItems((prev) => {
          const updated = prev.map((item) => {
            if (item.id !== itemId) return item;
            let newQty = item.quantity;
            if (type === "in") newQty += quantity;
            else if (type === "out") newQty = Math.max(0, newQty - quantity);
            else newQty = quantity;
            return { ...item, quantity: newQty, updatedAt: now };
          });
          saveItems(updated);
          return updated;
        });
      },
      []
    );

    const getLowStockItems = useCallback(() => {
      return items.filter((item) => item.quantity <= item.minQuantity);
    }, [items]);

    const getItemTransactions = useCallback(
      (itemId: string) => {
        return transactions.filter((t) => t.itemId === itemId);
      },
      [transactions]
    );

    return {
      items,
      transactions,
      addItem,
      updateItem,
      deleteItem,
      adjustStock,
      getLowStockItems,
      getItemTransactions,
      isLoading,
    };
  }
);

export { InventoryContextHook as useInventory, InventoryContextProvider };

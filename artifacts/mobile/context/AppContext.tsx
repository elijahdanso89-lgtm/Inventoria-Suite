import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Currency = "GHS" | "USD" | "EUR" | "GBP";

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  GHS: "₵",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

export type Product = {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  costPrice: string;
  sellingPrice: string;
  quantity: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  createdAt: string;
};

export type Sale = {
  id: number;
  productId: number;
  quantity: number;
  totalPrice: string;
  profit: string;
  timestamp: string;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
};

const ACHIEVEMENTS_DEF: Achievement[] = [
  { id: "first_sale", title: "First Sale", description: "Recorded your first sale", icon: "🎯", unlockedAt: null },
  { id: "power_seller", title: "Power Seller", description: "Made 10 or more sales", icon: "🏆", unlockedAt: null },
  { id: "hot_streak", title: "Hot Streak", description: "Made 5+ sales in one day", icon: "⚡", unlockedAt: null },
  { id: "grand_master", title: "Grand Master", description: "Earned ₵1000+ in total revenue", icon: "💰", unlockedAt: null },
];

// ─── Storage keys ─────────────────────────────────────────────────────────────

const PRODUCTS_KEY = "inventoria_products_v1";
const SALES_KEY = "inventoria_sales_v1";
const CURRENCY_KEY = "inventoria_currency_v1";
const ACHIEVEMENTS_KEY = "inventoria_achievements_v1";

// ─── Context ──────────────────────────────────────────────────────────────────

type AppContextType = {
  products: Product[];
  sales: Sale[];
  currency: Currency;
  achievements: Achievement[];
  newAchievement: Achievement | null;
  isLoading: boolean;
  addProduct: (p: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (id: number, p: Partial<Product>) => void;
  deleteProduct: (id: number, deleteSales?: boolean) => void;
  recordSale: (productId: number, qty: number, discount?: number) => void;
  setCurrency: (c: Currency) => void;
  clearNewAchievement: () => void;
  // analytics
  totalRevenue: number;
  totalProfit: number;
  totalStockValue: number;
  todaysSales: number;
  lowStockProducts: Product[];
};

const [AppContextProvider, useApp] = createContextHook<AppContextType>(() => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currency, setCurrencyState] = useState<Currency>("GHS");
  const [achievements, setAchievements] = useState<Achievement[]>(ACHIEVEMENTS_DEF);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const salesRef = useRef(sales);
  salesRef.current = sales;
  const achievementsRef = useRef(achievements);
  achievementsRef.current = achievements;

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [pRaw, sRaw, cRaw, aRaw] = await Promise.all([
        AsyncStorage.getItem(PRODUCTS_KEY),
        AsyncStorage.getItem(SALES_KEY),
        AsyncStorage.getItem(CURRENCY_KEY),
        AsyncStorage.getItem(ACHIEVEMENTS_KEY),
      ]);
      if (pRaw) setProducts(JSON.parse(pRaw));
      if (sRaw) setSales(JSON.parse(sRaw));
      if (cRaw) setCurrencyState(JSON.parse(cRaw));
      if (aRaw) setAchievements(JSON.parse(aRaw));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProducts = async (p: Product[]) =>
    AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(p));
  const saveSales = async (s: Sale[]) =>
    AsyncStorage.setItem(SALES_KEY, JSON.stringify(s));
  const saveAchievements = async (a: Achievement[]) =>
    AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(a));

  const unlockAchievement = useCallback((id: string, updatedSales: Sale[], updatedAchievements: Achievement[]) => {
    const already = updatedAchievements.find((a) => a.id === id)?.unlockedAt;
    if (already) return updatedAchievements;
    const next = updatedAchievements.map((a) =>
      a.id === id ? { ...a, unlockedAt: new Date().toISOString() } : a
    );
    const unlocked = next.find((a) => a.id === id)!;
    setNewAchievement(unlocked);
    saveAchievements(next);
    return next;
  }, []);

  const checkAchievements = useCallback((updatedSales: Sale[], totalRevenue: number) => {
    let ach = achievementsRef.current;

    if (updatedSales.length >= 1) ach = unlockAchievement("first_sale", updatedSales, ach);
    if (updatedSales.length >= 10) ach = unlockAchievement("power_seller", updatedSales, ach);
    if (totalRevenue >= 1000) ach = unlockAchievement("grand_master", updatedSales, ach);

    const today = new Date().toDateString();
    const todaySales = updatedSales.filter(
      (s) => new Date(s.timestamp).toDateString() === today
    );
    if (todaySales.length >= 5) ach = unlockAchievement("hot_streak", updatedSales, ach);

    setAchievements(ach);
  }, [unlockAchievement]);

  const addProduct = useCallback((p: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...p,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      saveProducts(updated);
      return updated;
    });
  }, []);

  const updateProduct = useCallback((id: number, p: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, ...p } : item));
      saveProducts(updated);
      return updated;
    });
  }, []);

  const deleteProduct = useCallback((id: number, deleteSales = false) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveProducts(updated);
      return updated;
    });
    if (deleteSales) {
      setSales((prev) => {
        const updated = prev.filter((s) => s.productId !== id);
        saveSales(updated);
        return updated;
      });
    }
  }, []);

  const recordSale = useCallback((productId: number, qty: number, discount = 0) => {
    setProducts((prevProducts) => {
      const product = prevProducts.find((p) => p.id === productId);
      if (!product) throw new Error("Product not found");
      if (product.quantity < qty) throw new Error("Not enough stock");

      const unitSell = parseFloat(product.sellingPrice) * (1 - discount / 100);
      const totalPrice = (unitSell * qty).toFixed(2);
      const profit = ((unitSell - parseFloat(product.costPrice)) * qty).toFixed(2);

      const newSale: Sale = {
        id: Date.now(),
        productId,
        quantity: qty,
        totalPrice,
        profit,
        timestamp: new Date().toISOString(),
      };

      setSales((prevSales) => {
        const updatedSales = [newSale, ...prevSales];
        saveSales(updatedSales);

        const totalRev = updatedSales.reduce((s, x) => s + parseFloat(x.totalPrice), 0);
        checkAchievements(updatedSales, totalRev);
        return updatedSales;
      });

      const updatedProducts = prevProducts.map((p) =>
        p.id === productId ? { ...p, quantity: p.quantity - qty } : p
      );
      saveProducts(updatedProducts);
      return updatedProducts;
    });
  }, [checkAchievements]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    AsyncStorage.setItem(CURRENCY_KEY, JSON.stringify(c));
  }, []);

  const clearNewAchievement = useCallback(() => setNewAchievement(null), []);

  // ── Analytics (computed) ───────────────────────────────────────────────────
  const totalRevenue = sales.reduce((s, x) => s + parseFloat(x.totalPrice), 0);
  const totalProfit = sales.reduce((s, x) => s + parseFloat(x.profit), 0);
  const totalStockValue = products.reduce(
    (s, p) => s + parseFloat(p.costPrice) * p.quantity,
    0
  );
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todaysSales = sales
    .filter((s) => new Date(s.timestamp) >= todayStart)
    .reduce((acc, s) => acc + parseFloat(s.totalPrice), 0);

  const lowStockProducts = products.filter((p) => p.quantity <= p.lowStockThreshold);

  return {
    products,
    sales,
    currency,
    achievements,
    newAchievement,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
    setCurrency,
    clearNewAchievement,
    totalRevenue,
    totalProfit,
    totalStockValue,
    todaysSales,
    lowStockProducts,
  };
});

export { useApp, AppContextProvider };

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "mana:cart:v1";
const MAX_QTY = 20;

interface CartState {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  hydrated: boolean;
  /** Slug of the line touched most recently - used for the "added" flash. */
  touched: string | null;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  removeLine: (slug: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartState | null>(null);

function read(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is CartLine => {
        const line = entry as Partial<CartLine>;
        return typeof line?.slug === "string" && Number.isFinite(line?.price) && Number.isFinite(line?.quantity);
      })
      .map((line) => ({
        ...line,
        quantity: Math.min(Math.max(1, Math.floor(line.quantity)), MAX_QTY),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [touched, setTouched] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLines(read());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* private mode - the cart simply will not survive a refresh */
    }
  }, [lines, hydrated]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const flash = useCallback((slug: string) => {
    setTouched(slug);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setTouched(null), 1800);
  }, []);

  const addLine = useCallback<CartState["addLine"]>(
    (line, quantity = 1) => {
      setLines((current) => {
        const existing = current.find((entry) => entry.slug === line.slug);
        if (existing) {
          return current.map((entry) =>
            entry.slug === line.slug
              ? { ...entry, quantity: Math.min(entry.quantity + quantity, MAX_QTY) }
              : entry,
          );
        }
        return [...current, { ...line, quantity: Math.min(Math.max(1, quantity), MAX_QTY) }];
      });
      flash(line.slug);
      setIsOpen(true);
    },
    [flash],
  );

  const setQuantity = useCallback<CartState["setQuantity"]>((slug, quantity) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((entry) => entry.slug !== slug)
        : current.map((entry) =>
            entry.slug === slug ? { ...entry, quantity: Math.min(quantity, MAX_QTY) } : entry,
          ),
    );
  }, []);

  const removeLine = useCallback<CartState["removeLine"]>((slug) => {
    setLines((current) => current.filter((entry) => entry.slug !== slug));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartState>(() => {
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = Math.round(lines.reduce((sum, line) => sum + line.price * line.quantity, 0) * 100) / 100;
    return {
      lines,
      count,
      subtotal,
      isOpen,
      hydrated,
      touched,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addLine,
      setQuantity,
      removeLine,
      clearCart,
    };
  }, [lines, isOpen, hydrated, touched, addLine, setQuantity, removeLine, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>");
  return context;
}

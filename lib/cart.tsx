'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CartItem {
  id: string;
  slug: string;
  nome: string;
  preco: number; // preço efetivo no momento em que entrou no carrinho (o servidor revalida)
  imagem: string | null;
  estoque: number;
  qtd: number;
}

interface CartCtx {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'qtd'>, qtd?: number) => void;
  setQty: (id: string, qtd: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  ready: boolean;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'shine-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const value = useMemo<CartCtx>(() => ({
    items,
    ready,
    count: items.reduce((s, i) => s + i.qtd, 0),
    subtotal: items.reduce((s, i) => s + i.qtd * i.preco, 0),
    add(item, qtd = 1) {
      setItems((cur) => {
        const found = cur.find((i) => i.id === item.id);
        if (found) {
          return cur.map((i) => i.id === item.id
            ? { ...i, ...item, qtd: Math.min(item.estoque, i.qtd + qtd) } : i);
        }
        return [...cur, { ...item, qtd: Math.min(item.estoque, qtd) }];
      });
    },
    setQty(id, qtd) {
      setItems((cur) => cur.map((i) => i.id === id ? { ...i, qtd: Math.max(1, Math.min(i.estoque, qtd)) } : i));
    },
    remove: (id) => setItems((cur) => cur.filter((i) => i.id !== id)),
    clear: () => setItems([]),
  }), [items, ready]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart fora do CartProvider');
  return c;
}

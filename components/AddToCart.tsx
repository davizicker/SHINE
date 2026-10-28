'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

interface Props {
  id: string; slug: string; nome: string; preco: number; imagem: string | null; estoque: number;
}

export default function AddToCart(props: Props) {
  const { add } = useCart();
  const [qtd, setQtd] = useState(1);
  const [done, setDone] = useState(false);

  if (props.estoque <= 0) {
    return <button className="btn-dark w-full" disabled>Esgotado</button>;
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center rounded-full border border-ink/20">
          <button type="button" className="px-4 py-2" onClick={() => setQtd((q) => Math.max(1, q - 1))} aria-label="Menos">−</button>
          <span className="w-8 text-center text-sm">{qtd}</span>
          <button type="button" className="px-4 py-2" onClick={() => setQtd((q) => Math.min(props.estoque, q + 1))} aria-label="Mais">+</button>
        </div>
        <span className="text-xs text-ink/50">
          {props.estoque <= 3 ? `Últimas ${props.estoque} unidades` : `${props.estoque} disponíveis`}
        </span>
      </div>
      <button
        type="button"
        className="btn-gold w-full"
        onClick={() => { add(props, qtd); setDone(true); setTimeout(() => setDone(false), 3000); }}
      >
        Adicionar ao carrinho
      </button>
      {done && (
        <p className="text-center text-sm text-gold-dark">
          Adicionado! <Link href="/carrinho" className="underline">Ver carrinho</Link>
        </p>
      )}
    </div>
  );
}

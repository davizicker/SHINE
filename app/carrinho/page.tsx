'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { brl } from '@/lib/format';
import { Placeholder } from '@/components/ProductCard';

export default function Carrinho() {
  const { items, subtotal, setQty, remove, ready } = useCart();
  if (!ready) return <div className="container-x py-16 text-center text-ink/50">Carregando…</div>;
  if (items.length === 0) {
    return (
      <div className="container-x py-20 text-center">
        <h1 className="text-4xl">Seu carrinho está vazio</h1>
        <Link href="/produtos" className="btn-taupe mt-6">Ver joias</Link>
      </div>
    );
  }
  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="mb-6 text-4xl">Carrinho</h1>
        <ul className="space-y-4">
          {items.map((i) => (
            <li key={i.id} className="card flex gap-4">
              <Link href={`/produtos/${i.slug}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {i.imagem ? <img src={i.imagem} alt={i.nome} className="h-full w-full object-cover" /> : <Placeholder className="h-full w-full" />}
              </Link>
              <div className="flex-1">
                <Link href={`/produtos/${i.slug}`} className="text-lg">{i.nome}</Link>
                <p className="text-sm text-ink/60">{brl(i.preco)}</p>
                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-ink/20 text-sm">
                    <button className="px-3 py-1" onClick={() => setQty(i.id, i.qtd - 1)} aria-label="Menos">−</button>
                    <span className="w-6 text-center">{i.qtd}</span>
                    <button className="px-3 py-1" onClick={() => setQty(i.id, i.qtd + 1)} aria-label="Mais">+</button>
                  </div>
                  <button className="text-sm underline" onClick={() => remove(i.id)}>Remover</button>
                </div>
              </div>
              <p className="font-medium">{brl(i.preco * i.qtd)}</p>
            </li>
          ))}
        </ul>
      </div>
      <aside className="card h-fit">
        <h2 className="text-2xl">Resumo</h2>
        <p className="mt-4 flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></p>
        <p className="mt-1 text-xs text-ink/50">Frete calculado na próxima etapa.</p>
        <Link href="/checkout" className="btn-taupe mt-5 w-full">Finalizar compra</Link>
        <Link href="/produtos" className="mt-3 block text-center text-sm underline">Continuar comprando</Link>
      </aside>
    </div>
  );
}

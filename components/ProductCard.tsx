import Link from 'next/link';
import { brl } from '@/lib/format';
import { effectivePrice, onSale, sortedImages, type Product } from '@/lib/types';

export function Placeholder({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-blush to-gold-light text-4xl text-gold ${className}`}>
      ✦
    </div>
  );
}

export default function ProductCard({ p }: { p: Product }) {
  const imgs = sortedImages(p);
  const soldOut = p.estoque <= 0;
  return (
    <Link href={`/produtos/${p.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
        {imgs[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgs[0]} alt={p.nome} loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        ) : <Placeholder className="h-full w-full" />}
        {soldOut && <span className="badge absolute left-3 top-3 bg-ink text-cream">Esgotado</span>}
        {!soldOut && onSale(p) && <span className="badge absolute left-3 top-3 bg-gold text-white">Promoção</span>}
      </div>
      <h3 className="mt-3 text-lg leading-tight">{p.nome}</h3>
      <p className="mt-1 text-sm">
        {onSale(p) && <span className="mr-2 text-ink/40 line-through">{brl(p.preco)}</span>}
        <span className="font-medium text-gold-dark">{brl(effectivePrice(p))}</span>
      </p>
    </Link>
  );
}

'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';

export default function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/carrinho" className="relative hover:text-gold" aria-label="Carrinho">
      Carrinho
      {ready && count > 0 && (
        <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-xs text-white">{count}</span>
      )}
    </Link>
  );
}

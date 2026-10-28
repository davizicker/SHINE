import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { brl } from '@/lib/format';
import { effectivePrice, sortedImages, type Product } from '@/lib/types';
import { Placeholder } from '@/components/ProductCard';

export default async function Produtos({ searchParams }: { searchParams: Promise<{ salvo?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('products')
    .select('*, product_images(url, posicao), categories(nome, slug)').order('created_at', { ascending: false });
  const products = (data ?? []) as Product[];
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl">Produtos</h1>
        <Link href="/admin/produtos/novo" className="btn-gold">+ Nova peça</Link>
      </div>
      {sp.salvo && <p className="mb-4 text-sm text-green-700">Peça salva ✦</p>}
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead><tr className="border-b border-ink/10"><th className="th">Peça</th><th className="th">Categoria</th><th className="th">Preço</th><th className="th">Estoque</th><th className="th">Status</th></tr></thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={5} className="td text-ink/50">Nenhuma peça cadastrada ainda.</td></tr>}
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5 hover:bg-cream">
                <td className="td">
                  <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3">
                    <span className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {sortedImages(p)[0] ? <img src={sortedImages(p)[0]} alt="" className="h-full w-full object-cover" /> : <Placeholder className="h-full w-full text-xl" />}
                    </span>
                    <span>{p.nome}</span>
                  </Link>
                </td>
                <td className="td">{p.categories?.nome ?? '—'}</td>
                <td className="td">{brl(effectivePrice(p))}</td>
                <td className="td">{p.estoque === 0 ? <b className="text-red-600">Esgotado</b> : p.estoque}</td>
                <td className="td">{p.ativo ? 'Visível' : 'Oculto'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

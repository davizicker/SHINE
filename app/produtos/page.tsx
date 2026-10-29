import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import SetupNotice from '@/components/SetupNotice';
import { effectivePrice, type Category, type Product } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Joias' };

type SP = { q?: string; categoria?: string; ordem?: string; min?: string; max?: string };

export default async function Catalogo({ searchParams }: { searchParams: Promise<SP> }) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <SetupNotice />;
  const sp = await searchParams;
  const supabase = await createClient();

  const { data: cats } = await supabase.from('categories').select('*').order('nome');
  const categorias = (cats ?? []) as Category[];
  const cat = categorias.find((c) => c.slug === sp.categoria);

  let query = supabase
    .from('products')
    .select('*, product_images(url, posicao), categories(nome, slug)')
    .eq('ativo', true);
  if (cat) query = query.eq('category_id', cat.id);
  const q = (sp.q ?? '').replace(/[%,()]/g, ' ').trim();
  if (q) query = query.ilike('nome', `%${q}%`);
  query = query.order('created_at', { ascending: false });

  const { data } = await query;
  let products = (data ?? []) as Product[];

  const min = Number(sp.min), max = Number(sp.max);
  if (sp.min && !Number.isNaN(min)) products = products.filter((p) => effectivePrice(p) >= min);
  if (sp.max && !Number.isNaN(max)) products = products.filter((p) => effectivePrice(p) <= max);
  if (sp.ordem === 'menor') products.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (sp.ordem === 'maior') products.sort((a, b) => effectivePrice(b) - effectivePrice(a));

  const chip = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm ${active ? 'border-ink bg-ink text-cream' : 'border-ink/20 hover:border-ink'}`;

  return (
    <div className="container-x pb-10">
      <div className="-mx-4 mb-2 bg-sand px-4 py-10 text-center sm:-mx-6 sm:px-6">
        <p className="eyebrow">Coleção</p>
        <h1 className="mt-1 text-5xl">{cat ? cat.nome : 'Todas as peças'}</h1>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/produtos" className={chip(!cat)}>Todas</Link>
        {categorias.map((c) => (
          <Link key={c.id} href={`/produtos?categoria=${c.slug}`} className={chip(cat?.id === c.id)}>{c.nome}</Link>
        ))}
      </div>

      <form className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
        {cat && <input type="hidden" name="categoria" value={cat.slug} />}
        <input name="q" defaultValue={sp.q} placeholder="Buscar peça…" className="input" />
        <input name="min" type="number" min="0" defaultValue={sp.min} placeholder="Preço mín." className="input sm:w-32" />
        <input name="max" type="number" min="0" defaultValue={sp.max} placeholder="Preço máx." className="input sm:w-32" />
        <select name="ordem" defaultValue={sp.ordem ?? ''} className="input sm:w-44">
          <option value="">Mais recentes</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
        </select>
        <button className="btn-dark">Filtrar</button>
      </form>

      {products.length === 0 ? (
        <p className="mt-12 text-center text-ink/60">Nenhuma peça encontrada.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

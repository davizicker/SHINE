import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import SetupNotice from '@/components/SetupNotice';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

const SELECT = '*, product_images(url, posicao), categories(nome, slug)';

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <SetupNotice />;
  const supabase = await createClient();
  const [{ data: destaques }, { data: novos }, { data: cats }] = await Promise.all([
    supabase.from('products').select(SELECT).eq('ativo', true).eq('destaque', true).order('created_at', { ascending: false }).limit(4),
    supabase.from('products').select(SELECT).eq('ativo', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('categories').select('*').order('nome'),
  ]);

  return (
    <>
      <section className="bg-gradient-to-br from-blush via-cream to-gold-light/50">
        <div className="container-x py-20 text-center sm:py-28">
          <p className="text-sm uppercase tracking-[0.3em] text-gold-dark">Bijuterias</p>
          <h1 className="mx-auto mt-4 max-w-2xl text-5xl leading-tight sm:text-6xl">
            Brilho que combina com você
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-ink/70">
            Peças delicadas, escolhidas com carinho. Pague com Pix ou cartão e receba em todo o Brasil.
          </p>
          <Link href="/produtos" className="btn-gold mt-8">Ver todas as joias</Link>
        </div>
      </section>

      {(cats as Category[] | null)?.length ? (
        <section className="container-x mt-12 flex flex-wrap justify-center gap-3">
          {(cats as Category[]).map((c) => (
            <Link key={c.id} href={`/produtos?categoria=${c.slug}`} className="btn-outline">{c.nome}</Link>
          ))}
        </section>
      ) : null}

      {(destaques as Product[] | null)?.length ? (
        <section className="container-x mt-14">
          <h2 className="mb-6 text-3xl">Destaques</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {(destaques as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      ) : null}

      <section className="container-x mt-14">
        <h2 className="mb-6 text-3xl">Novidades</h2>
        {(novos as Product[] | null)?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {(novos as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <p className="text-ink/60">Em breve, novas peças por aqui ✦</p>
        )}
      </section>
    </>
  );
}

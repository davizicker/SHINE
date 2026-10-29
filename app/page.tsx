import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import SetupNotice from '@/components/SetupNotice';
import Logo from '@/components/Logo';
import TrustStrip from '@/components/TrustStrip';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

const wa = process.env.NEXT_PUBLIC_WHATSAPP;
const address = process.env.NEXT_PUBLIC_ADDRESS;
const ig = process.env.NEXT_PUBLIC_INSTAGRAM;
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
      <section className="bg-cream">
        <div className="container-x flex flex-col items-center py-20 text-center md:py-28">
          <Logo size="xxl" gold />
          <p className="eyebrow mt-12">Bijuterias &amp; semijoias</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/produtos" className="btn-taupe">Ver coleção</Link>
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-outline">Falar no WhatsApp</a>}
          </div>
        </div>
      </section>

      <TrustStrip />

      <section className="container-x py-20 text-center">
        <h2 className="mx-auto max-w-3xl text-4xl leading-tight sm:text-6xl">
          More than accessories,<br /><em className="font-normal text-taupe-dark">it’s a lifestyle.</em>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-ink/70">
          Colares, brincos, pulseiras e anéis para compor o seu look — do delicado ao statement. Pague com Pix ou cartão e receba em todo o Brasil.
        </p>
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
          <p className="eyebrow">Seleção</p>
          <h2 className="mb-6 mt-1 text-4xl">Destaques</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {(destaques as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      ) : null}

      <section className="container-x mt-14">
        <p className="eyebrow">Acabou de chegar</p>
        <h2 className="mb-6 mt-1 text-4xl">Novidades</h2>
        {(novos as Product[] | null)?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {(novos as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <p className="text-ink/60">Em breve, novas peças por aqui ✦</p>
        )}
      </section>
      <section className="container-x mt-20">
        <div className="grid gap-6 rounded-3xl bg-sand p-8 sm:p-12 md:grid-cols-2">
          <div>
            <p className="eyebrow">Ateliê</p>
            <h2 className="mt-2 text-4xl">Venha conhecer de pertinho</h2>
            <p className="mt-3 text-ink/70">
              Além da loja online, a Shine Factory tem showroom{address ? '' : ' em Minas Gerais'}. Fale com a gente para combinar sua visita.
            </p>
          </div>
          <div className="space-y-2 text-sm md:pt-8">
            {address && <p>📍 {address}</p>}
            {ig && <p>Instagram: <a className="underline" target="_blank" rel="noreferrer" href={`https://instagram.com/${ig}`}>@{ig}</a></p>}
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-taupe mt-3">Agendar visita</a>}
          </div>
        </div>
      </section>
    </>
  );
}

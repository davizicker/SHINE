import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import ProductCard from '@/components/ProductCard';
import SetupNotice from '@/components/SetupNotice';
import Logo from '@/components/Logo';
import TrustStrip from '@/components/TrustStrip';
import Marquee from '@/components/Marquee';
import Reveal from '@/components/Reveal';
import SectionTitle from '@/components/SectionTitle';
import AmbientSparkles from '@/components/AmbientSparkles';
import type { Category, Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

const wa = process.env.NEXT_PUBLIC_WHATSAPP;
const address = process.env.NEXT_PUBLIC_ADDRESS;
const ig = process.env.NEXT_PUBLIC_INSTAGRAM;
const SELECT = '*, product_images(url, posicao), categories(nome, slug)';

const TILES = [
  'from-[#8b8075] to-[#5f564e]', 'from-[#c4b295] to-[#8a7a64]', 'from-[#6d625a] to-[#3b332d]',
  'from-[#b5a287] to-[#7f756b]', 'from-[#d3c6b3] to-[#9c8d7d]', 'from-[#4a403a] to-[#2a2420]',
];

export default async function Home() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return <SetupNotice />;
  const supabase = await createClient();
  const [{ data: destaques }, { data: novos }, { data: cats }] = await Promise.all([
    supabase.from('products').select(SELECT).eq('ativo', true).eq('destaque', true).order('created_at', { ascending: false }).limit(4),
    supabase.from('products').select(SELECT).eq('ativo', true).order('created_at', { ascending: false }).limit(8),
    supabase.from('categories').select('*').order('nome'),
  ]);
  const categorias = (cats ?? []) as Category[];

  return (
    <>
      {/* HERO escuro: o dourado brilha mais sobre o marrom-café */}
      <section
        className="relative overflow-hidden text-cream"
        style={{ background: 'radial-gradient(ellipse at 50% 38%, rgba(184,138,59,0.28), transparent 62%), linear-gradient(180deg, #2c2520 0%, #1b1613 100%)' }}
      >
        <AmbientSparkles />
        <div className="container-x relative flex flex-col items-center py-24 text-center md:py-36">
          <Logo size="xxl" gold light />
          <p className="mt-14 text-xs uppercase tracking-[0.4em] text-cream/60">Bijuterias &amp; semijoias</p>
          <p className="mt-3 font-serif text-xl italic text-cream/80 sm:text-2xl">More than accessories, it’s a lifestyle.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/produtos" className="btn-champagne">Ver coleção</Link>
            {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-ghost">Falar no WhatsApp</a>}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
      </section>

      <Marquee />
      <TrustStrip />

      {categorias.length > 0 && (
        <section className="container-x py-20">
          <Reveal>
            <SectionTitle eyebrow="Compre por" title="Categorias" />
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
              {categorias.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/produtos?categoria=${c.slug}`}
                  className={`tile group relative flex aspect-[4/5] flex-col items-center justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-center text-cream ${TILES[i % TILES.length]}`}
                >
                  <span className="absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 text-4xl text-champagne transition duration-500 group-hover:scale-125 group-hover:rotate-45">✦</span>
                  <h3 className="font-serif text-3xl">{c.nome}</h3>
                  <span className="mt-1 text-[11px] uppercase tracking-[0.25em] text-cream/70">Ver peças</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>
      )}

      {(destaques as Product[] | null)?.length ? (
        <section className="bg-white/50 py-20">
          <div className="container-x">
            <Reveal>
              <SectionTitle eyebrow="Seleção" title="Destaques" />
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {(destaques as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="container-x py-20">
        <Reveal>
          <SectionTitle eyebrow="Acabou de chegar" title="Novidades" />
          {(novos as Product[] | null)?.length ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
                {(novos as Product[]).map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
              <div className="mt-10 text-center"><Link href="/produtos" className="btn-outline">Ver todas as peças</Link></div>
            </>
          ) : (
            <p className="text-center text-ink/60">Novas peças chegando em breve ✦</p>
          )}
        </Reveal>
      </section>

      <section className="container-x pb-20 text-center">
        <Reveal>
          <h2 className="mx-auto max-w-3xl text-4xl leading-tight sm:text-6xl">
            Brilhe do seu jeito,<br /><em className="font-normal text-taupe-dark">todos os dias.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-ink/70">
            Colares, brincos, pulseiras e anéis para compor o seu look — do delicado ao statement. Pague com Pix ou cartão e receba em todo o Brasil.
          </p>
        </Reveal>
      </section>

      <section className="container-x pb-4">
        <Reveal>
          <div className="grid gap-6 overflow-hidden rounded-3xl p-8 text-cream sm:p-14 md:grid-cols-2"
            style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(184,138,59,0.25), transparent 60%), linear-gradient(135deg, #3a312b, #1f1a17)' }}>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-champagne">Ateliê</p>
              <h2 className="mt-2 text-4xl sm:text-5xl">Venha conhecer de pertinho</h2>
              <p className="mt-3 text-cream/70">Além da loja online, a Shine Factory tem showroom. Fale com a gente para combinar sua visita.</p>
            </div>
            <div className="space-y-3 text-sm md:pt-10">
              {address && <p className="text-cream/90">📍 {address}</p>}
              {ig && <p className="text-cream/90">Instagram: <a className="underline" target="_blank" rel="noreferrer" href={`https://instagram.com/${ig}`}>@{ig}</a></p>}
              {wa && <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="btn-champagne mt-3">Agendar visita</a>}
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

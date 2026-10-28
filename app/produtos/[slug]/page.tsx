import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Gallery from '@/components/Gallery';
import AddToCart from '@/components/AddToCart';
import ProductCard from '@/components/ProductCard';
import { brl } from '@/lib/format';
import { effectivePrice, onSale, sortedImages, type Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

async function load(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('products')
    .select('*, product_images(url, posicao), categories(nome, slug)')
    .eq('slug', slug).eq('ativo', true).maybeSingle();
  return { supabase, product: data as Product | null };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { product } = await load(slug);
  if (!product) return {};
  const img = sortedImages(product)[0];
  return {
    title: product.nome,
    description: product.descricao?.slice(0, 160) ?? undefined,
    openGraph: img ? { images: [img] } : undefined,
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { supabase, product } = await load(slug);
  if (!product) notFound();

  const imgs = sortedImages(product);
  const price = effectivePrice(product);
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;

  let related: Product[] = [];
  if (product.category_id) {
    const { data } = await supabase
      .from('products')
      .select('*, product_images(url, posicao), categories(nome, slug)')
      .eq('ativo', true).eq('category_id', product.category_id).neq('id', product.id).limit(4);
    related = (data ?? []) as Product[];
  }

  return (
    <div className="container-x py-10">
      <p className="mb-6 text-sm text-ink/50">
        <Link href="/produtos" className="hover:text-taupe">Joias</Link>
        {product.categories && <> / <Link href={`/produtos?categoria=${product.categories.slug}`} className="hover:text-taupe">{product.categories.nome}</Link></>}
      </p>
      <div className="grid gap-10 md:grid-cols-2">
        <Gallery images={imgs} alt={product.nome} />
        <div>
          <h1 className="text-5xl">{product.nome}</h1>
          <p className="mt-4 text-3xl">
            {onSale(product) && <span className="mr-3 text-xl text-ink/40 line-through">{brl(product.preco)}</span>}
            <span className="text-taupe-dark">{brl(price)}</span>
          </p>
          <p className="mt-1 text-sm text-ink/60">em até 6x no cartão · ou à vista no Pix</p>
          <div className="mt-6">
            <AddToCart id={product.id} slug={product.slug} nome={product.nome} preco={price}
              imagem={imgs[0] ?? null} estoque={product.estoque} />
          </div>
          {wa && (
            <a className="btn-outline mt-3 w-full" target="_blank" rel="noreferrer"
              href={`https://wa.me/${wa}?text=${encodeURIComponent(`Oi! Tenho uma dúvida sobre a peça: ${product.nome}`)}`}>
              Tirar dúvida no WhatsApp
            </a>
          )}
          {product.descricao && (
            <div className="mt-8">
              <h2 className="text-xl">Descrição</h2>
              <p className="mt-2 whitespace-pre-line text-ink/80">{product.descricao}</p>
            </div>
          )}
          <dl className="mt-6 space-y-1 text-sm text-ink/70">
            {product.material && <div><dt className="inline font-medium">Material: </dt><dd className="inline">{product.material}</dd></div>}
            {product.sku && <div><dt className="inline font-medium">Código: </dt><dd className="inline">{product.sku}</dd></div>}
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-3xl">Você também pode gostar</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

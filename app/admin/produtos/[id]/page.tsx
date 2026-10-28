import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/ProductForm';
import { deleteProduct } from '../../actions';
import { sortedImages, type Category, type Product } from '@/lib/types';

export default async function Editar({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: p }, { data: cats }] = await Promise.all([
    supabase.from('products').select('*, product_images(url, posicao)').eq('id', id).maybeSingle(),
    supabase.from('categories').select('*').order('nome'),
  ]);
  if (!p) notFound();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl">Editar peça</h1>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={id} />
          <button className="text-sm text-red-600 underline">Excluir peça</button>
        </form>
      </div>
      <ProductForm product={p as Product} images={sortedImages(p as Product)} categories={(cats ?? []) as Category[]} erro={sp.erro} />
    </div>
  );
}

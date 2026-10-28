import { createClient } from '@/lib/supabase/server';
import ProductForm from '@/components/ProductForm';
import type { Category } from '@/lib/types';

export default async function Novo({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('nome');
  return (
    <div>
      <h1 className="mb-6 text-4xl">Nova peça</h1>
      <ProductForm images={[]} categories={(data ?? []) as Category[]} erro={sp.erro} />
    </div>
  );
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { quoteShipping } from '@/lib/shipping';
import { effectivePrice } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { cep, items } = await req.json();
    const supabase = await createClient();
    const ids = (items ?? []).map((i: { id: string }) => i.id);
    const { data: prods } = await supabase.from('products').select('id, preco, preco_promocional').in('id', ids).eq('ativo', true);
    const lines = (items ?? []).flatMap((i: { id: string; qtd: number }) => {
      const p = prods?.find((x) => x.id === i.id);
      return p ? [{ quantidade: Math.max(1, Number(i.qtd) || 1), preco: effectivePrice(p) }] : [];
    });
    if (lines.length === 0) return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 });
    return NextResponse.json({ options: await quoteShipping(cep, lines) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

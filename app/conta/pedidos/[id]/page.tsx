import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { brl, formatDate, STATUS_LABEL } from '@/lib/format';
import ClearCart from '@/components/ClearCart';

export const dynamic = 'force-dynamic';

export default async function Pedido({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ collection_status?: string; status?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: o } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!o) notFound();
  const e = o.endereco;
  const returned = sp.collection_status ?? sp.status;

  return (
    <div className="container-x max-w-3xl py-10">
      {['approved', 'pending', 'in_process'].includes(returned ?? '') && <ClearCart />}
      <Link href="/conta" className="text-sm underline">← Minha conta</Link>
      <h1 className="mt-3 text-4xl">Pedido #{o.id.slice(0, 8).toUpperCase()}</h1>
      <p className="mt-1 text-ink/60">{formatDate(o.created_at)} · <span className="badge bg-sand">{STATUS_LABEL[o.status]}</span></p>

      {o.status === 'aguardando_pagamento' && (
        <p className="card mt-4 text-sm">
          Estamos aguardando a confirmação do pagamento. Se você pagou via Pix, a confirmação costuma chegar em instantes —
          atualize esta página em alguns minutos.
        </p>
      )}
      {o.codigo_rastreio && (
        <p className="card mt-4 text-sm">Código de rastreio: <b>{o.codigo_rastreio}</b> ·{' '}
          <a className="underline" target="_blank" rel="noreferrer"
            href={`https://rastreamento.correios.com.br/app/index.php`}>rastrear nos Correios</a></p>
      )}

      <div className="card mt-6">
        <ul className="divide-y divide-ink/10">
          {o.order_items.map((i: { id: string; nome: string; quantidade: number; preco: number }) => (
            <li key={i.id} className="flex justify-between py-2 text-sm">
              <span>{i.quantidade}× {i.nome}</span><span>{brl(i.preco * i.quantidade)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{brl(o.subtotal)}</span></p>
          <p className="flex justify-between"><span>Frete ({o.frete_servico})</span><span>{brl(o.frete)}</span></p>
          <p className="flex justify-between text-base font-medium"><span>Total</span><span>{brl(o.total)}</span></p>
        </div>
      </div>
      <div className="card mt-4 text-sm">
        <p className="font-medium">Entrega</p>
        <p className="text-ink/70">{e.nome}<br />{e.rua}, {e.numero} {e.complemento}<br />{e.bairro} — {e.cidade}/{e.uf} — CEP {e.cep}</p>
      </div>
    </div>
  );
}

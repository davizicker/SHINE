import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { brl, formatDate, STATUS_LABEL } from '@/lib/format';
import { updateOrder } from '../../actions';

export default async function PedidoAdmin({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<{ salvo?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const supabase = await createClient();
  const { data: o } = await supabase.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!o) notFound();
  const e = o.endereco;
  return (
    <div className="max-w-3xl">
      <Link href="/admin/pedidos" className="text-sm underline">← Pedidos</Link>
      <h1 className="mt-3 text-4xl">Pedido #{o.id.slice(0, 8).toUpperCase()}</h1>
      <p className="text-ink/60">{formatDate(o.created_at)}</p>

      <form action={updateOrder} className="card mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto]">
        <input type="hidden" name="id" value={o.id} />
        <div><label className="label">Status</label>
          <select name="status" defaultValue={o.status} className="input">
            {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div><label className="label">Código de rastreio</label>
          <input name="codigo_rastreio" defaultValue={o.codigo_rastreio ?? ''} className="input" placeholder="AA123456789BR" /></div>
        <div className="flex items-end"><button className="btn-gold w-full">Salvar</button></div>
        {sp.salvo && <p className="text-sm text-green-700 sm:col-span-3">Pedido atualizado ✦</p>}
      </form>

      <div className="card mt-4">
        <ul className="divide-y divide-ink/10">
          {o.order_items.map((i: { id: string; nome: string; quantidade: number; preco: number }) => (
            <li key={i.id} className="flex justify-between py-2 text-sm"><span>{i.quantidade}× {i.nome}</span><span>{brl(i.preco * i.quantidade)}</span></li>
          ))}
        </ul>
        <div className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{brl(o.subtotal)}</span></p>
          <p className="flex justify-between"><span>Frete ({o.frete_servico})</span><span>{brl(o.frete)}</span></p>
          <p className="flex justify-between text-base font-medium"><span>Total</span><span>{brl(o.total)}</span></p>
        </div>
      </div>

      <div className="card mt-4 text-sm">
        <p className="font-medium">Entregar para</p>
        <p className="text-ink/80">{e.nome} · CPF {e.cpf} · {e.telefone}<br />
          {e.rua}, {e.numero} {e.complemento}<br />{e.bairro} — {e.cidade}/{e.uf} — CEP {e.cep}</p>
        {o.mp_payment_id && <p className="mt-2 text-xs text-ink/50">Pagamento Mercado Pago: {o.mp_payment_id}</p>}
      </div>
    </div>
  );
}

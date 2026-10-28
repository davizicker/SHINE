import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { brl, formatDate, STATUS_LABEL } from '@/lib/format';

export default async function Resumo() {
  const supabase = await createClient();
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const [{ data: paid }, { count: clientes }, { count: novos }, { data: baixo }, { data: recentes }, { count: aPagar }] = await Promise.all([
    supabase.from('orders').select('total').in('status', ['pago', 'separando', 'enviado', 'entregue']).gte('created_at', since),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'cliente').gte('created_at', since),
    supabase.from('products').select('id, nome, estoque').eq('ativo', true).lte('estoque', 2).order('estoque').limit(8),
    supabase.from('orders').select('id, status, total, created_at, endereco').order('created_at', { ascending: false }).limit(6),
    supabase.from('orders').select('*', { count: 'exact', head: true }).in('status', ['pago', 'separando']),
  ]);
  const vendas = (paid ?? []).reduce((s, o) => s + Number(o.total), 0);
  const stat = (label: string, value: string) => (
    <div className="card"><p className="text-xs uppercase tracking-wider text-ink/50">{label}</p><p className="mt-1 font-serif text-3xl">{value}</p></div>
  );

  return (
    <div className="space-y-8">
      <h1 className="text-4xl">Resumo</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stat('Vendas (30 dias)', brl(vendas))}
        {stat('Pedidos pagos (30 dias)', String(paid?.length ?? 0))}
        {stat('A enviar', String(aPagar ?? 0))}
        {stat('Clientes', `${clientes ?? 0} (+${novos ?? 0})`)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="mb-3 text-2xl">Últimos pedidos</h2>
          {!recentes?.length ? <p className="text-sm text-ink/50">Nenhum pedido ainda.</p> : (
            <ul className="divide-y divide-ink/10">
              {recentes.map((o) => (
                <li key={o.id}><Link href={`/admin/pedidos/${o.id}`} className="flex justify-between py-2 text-sm hover:text-taupe">
                  <span>#{o.id.slice(0, 8).toUpperCase()} · {o.endereco?.nome} · {formatDate(o.created_at)}</span>
                  <span>{brl(o.total)} · {STATUS_LABEL[o.status]}</span>
                </Link></li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2 className="mb-3 text-2xl">Estoque baixo</h2>
          {!baixo?.length ? <p className="text-sm text-ink/50">Tudo certo por aqui ✦</p> : (
            <ul className="divide-y divide-ink/10">
              {baixo.map((p) => (
                <li key={p.id}><Link href={`/admin/produtos/${p.id}`} className="flex justify-between py-2 text-sm hover:text-taupe">
                  <span>{p.nome}</span><b>{p.estoque === 0 ? 'Esgotado' : `${p.estoque} un.`}</b>
                </Link></li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

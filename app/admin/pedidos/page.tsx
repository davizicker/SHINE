import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { brl, formatDate, STATUS_LABEL } from '@/lib/format';

export default async function Pedidos({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const supabase = await createClient();
  let q = supabase.from('orders').select('id, status, total, created_at, endereco').order('created_at', { ascending: false }).limit(200);
  if (sp.status && STATUS_LABEL[sp.status]) q = q.eq('status', sp.status);
  const { data } = await q;
  return (
    <div>
      <h1 className="mb-4 text-4xl">Pedidos</h1>
      <div className="mb-6 flex flex-wrap gap-2 text-sm">
        <Link href="/admin/pedidos" className="rounded-full border border-ink/20 px-3 py-1">Todos</Link>
        {Object.entries(STATUS_LABEL).map(([k, v]) => (
          <Link key={k} href={`/admin/pedidos?status=${k}`} className={`rounded-full border px-3 py-1 ${sp.status === k ? 'border-ink bg-ink text-cream' : 'border-ink/20'}`}>{v}</Link>
        ))}
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead><tr className="border-b border-ink/10"><th className="th">Pedido</th><th className="th">Cliente</th><th className="th">Data</th><th className="th">Total</th><th className="th">Status</th></tr></thead>
          <tbody>
            {!data?.length && <tr><td colSpan={5} className="td text-ink/50">Nenhum pedido.</td></tr>}
            {data?.map((o) => (
              <tr key={o.id} className="border-b border-ink/5 hover:bg-cream">
                <td className="td"><Link className="underline" href={`/admin/pedidos/${o.id}`}>#{o.id.slice(0, 8).toUpperCase()}</Link></td>
                <td className="td">{o.endereco?.nome}</td><td className="td">{formatDate(o.created_at)}</td>
                <td className="td">{brl(o.total)}</td><td className="td"><span className="badge bg-blush">{STATUS_LABEL[o.status]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

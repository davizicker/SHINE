import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/format';

export default async function Clientes() {
  const supabase = await createClient();
  const [{ data: clientes }, { data: orders }] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'cliente').order('created_at', { ascending: false }),
    supabase.from('orders').select('user_id'),
  ]);
  const count = new Map<string, number>();
  (orders ?? []).forEach((o) => count.set(o.user_id, (count.get(o.user_id) ?? 0) + 1));
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-4xl">Clientes <span className="text-xl text-ink/40">({clientes?.length ?? 0})</span></h1>
        <Link href="/admin/clientes/export" className="btn-outline">Baixar CSV</Link>
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full">
          <thead><tr className="border-b border-ink/10"><th className="th">Nome</th><th className="th">E-mail</th><th className="th">WhatsApp</th><th className="th">Cidade</th><th className="th">Pedidos</th><th className="th">Cadastro</th></tr></thead>
          <tbody>
            {!clientes?.length && <tr><td colSpan={6} className="td text-ink/50">Ninguém se cadastrou ainda.</td></tr>}
            {clientes?.map((c) => (
              <tr key={c.id} className="border-b border-ink/5">
                <td className="td">{c.nome}</td><td className="td">{c.email}</td>
                <td className="td">{c.telefone && <a className="underline" target="_blank" rel="noreferrer" href={`https://wa.me/55${c.telefone.replace(/\D/g, '')}`}>{c.telefone}</a>}</td>
                <td className="td">{c.cidade ? `${c.cidade}/${c.uf}` : '—'}</td>
                <td className="td">{count.get(c.id) ?? 0}</td><td className="td">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { getUserAndProfile } from '@/lib/auth';
import { brl, formatDate, STATUS_LABEL } from '@/lib/format';
import { saveProfile } from './actions';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Minha conta' };

export default async function Conta({ searchParams }: { searchParams: Promise<{ salvo?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await getUserAndProfile();
  if (!user) return null; // middleware redireciona
  const { data: orders } = await supabase
    .from('orders').select('id, status, total, created_at')
    .eq('user_id', user.id).order('created_at', { ascending: false });
  const p = profile ?? {};

  return (
    <div className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_380px]">
      <section>
        <h1 className="text-4xl">Olá, {p.nome?.split(' ')[0] || 'cliente'} ✦</h1>
        <h2 className="mb-3 mt-8 text-2xl">Meus pedidos</h2>
        {!orders?.length ? (
          <p className="text-ink/60">Você ainda não fez pedidos. <Link href="/produtos" className="underline">Ver joias</Link></p>
        ) : (
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/conta/pedidos/${o.id}`} className="card flex items-center justify-between hover:border-gold">
                  <div>
                    <p className="font-medium">Pedido #{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-ink/50">{formatDate(o.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p>{brl(o.total)}</p>
                    <span className="badge bg-blush">{STATUS_LABEL[o.status]}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside>
        <form action={saveProfile} className="card space-y-3">
          <h2 className="text-2xl">Meus dados</h2>
          {sp.salvo && <p className="text-sm text-green-700">Dados salvos ✦</p>}
          {sp.erro && <p className="text-sm text-red-600">Não foi possível salvar.</p>}
          <p className="text-sm text-ink/60">{user.email}</p>
          <div><label className="label">Nome</label><input name="nome" className="input" defaultValue={p.nome ?? ''} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">WhatsApp</label><input name="telefone" className="input" defaultValue={p.telefone ?? ''} /></div>
            <div><label className="label">CPF</label><input name="cpf" className="input" defaultValue={p.cpf ?? ''} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">CEP</label><input name="cep" className="input" defaultValue={p.cep ?? ''} /></div>
            <div className="col-span-2"><label className="label">Rua</label><input name="rua" className="input" defaultValue={p.rua ?? ''} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Número</label><input name="numero" className="input" defaultValue={p.numero ?? ''} /></div>
            <div className="col-span-2"><label className="label">Complemento</label><input name="complemento" className="input" defaultValue={p.complemento ?? ''} /></div>
          </div>
          <div><label className="label">Bairro</label><input name="bairro" className="input" defaultValue={p.bairro ?? ''} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2"><label className="label">Cidade</label><input name="cidade" className="input" defaultValue={p.cidade ?? ''} /></div>
            <div><label className="label">UF</label><input name="uf" maxLength={2} className="input" defaultValue={p.uf ?? ''} /></div>
          </div>
          <button className="btn-gold w-full">Salvar</button>
        </form>
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/conta/senha" className="underline">Alterar senha</Link>
          <form action="/auth/signout" method="post"><button className="underline">Sair</button></form>
        </div>
      </aside>
    </div>
  );
}

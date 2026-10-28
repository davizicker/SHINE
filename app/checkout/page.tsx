'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { createClient } from '@/lib/supabase/client';
import { brl, onlyDigits, validCPF } from '@/lib/format';
import type { ShippingOption } from '@/lib/shipping';

const EMPTY = { nome: '', cpf: '', telefone: '', cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' };

export default function Checkout() {
  const { items, subtotal, ready } = useCart();
  const [f, setF] = useState(EMPTY);
  const [opts, setOpts] = useState<ShippingOption[]>([]);
  const [sel, setSel] = useState<string>('');
  const [erro, setErro] = useState('');
  const [loadingFrete, setLoadingFrete] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    (async () => {
      const sb = createClient();
      const { data: { user } } = await sb.auth.getUser();
      if (!user) return;
      const { data: p } = await sb.from('profiles').select('*').eq('id', user.id).single();
      if (p) setF({ ...EMPTY, ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, p[k] ?? ''])) });
    })();
  }, []);

  const cartPayload = items.map((i) => ({ id: i.id, qtd: i.qtd }));

  async function lookupCep(cep: string) {
    const d = onlyDigits(cep);
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`);
      const j = await r.json();
      if (!j.erro) setF((cur) => ({ ...cur, rua: j.logradouro || cur.rua, bairro: j.bairro || cur.bairro, cidade: j.localidade, uf: j.uf }));
    } catch {}
    setLoadingFrete(true); setOpts([]); setSel(''); setErro('');
    try {
      const r = await fetch('/api/frete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cep: d, items: cartPayload }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro ao calcular frete');
      setOpts(j.options); setSel(j.options[0]?.id ?? '');
    } catch (e) { setErro((e as Error).message); }
    setLoadingFrete(false);
  }

  const chosen = opts.find((o) => o.id === sel);
  const total = subtotal + (chosen?.preco ?? 0);
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!validCPF(f.cpf)) return setErro('CPF inválido.');
    if (!chosen) return setErro('Informe o CEP para calcular o frete.');
    setPaying(true);
    try {
      const r = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartPayload, endereco: f, frete_id: chosen.id }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Não foi possível finalizar.');
      window.location.href = j.url;
    } catch (e) { setErro((e as Error).message); setPaying(false); }
  }

  if (!ready) return <div className="container-x py-16 text-center text-ink/50">Carregando…</div>;
  if (items.length === 0) {
    return <div className="container-x py-20 text-center"><p>Seu carrinho está vazio.</p><Link href="/produtos" className="btn-taupe mt-4">Ver joias</Link></div>;
  }

  return (
    <form onSubmit={pay} className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_340px]">
      <div className="card space-y-4">
        <h1 className="text-3xl">Entrega</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label">Nome completo</label><input className="input" required value={f.nome} onChange={set('nome')} /></div>
          <div><label className="label">CPF</label><input className="input" required value={f.cpf} onChange={set('cpf')} inputMode="numeric" /></div>
          <div><label className="label">WhatsApp</label><input className="input" required value={f.telefone} onChange={set('telefone')} /></div>
          <div><label className="label">CEP</label>
            <input className="input" required value={f.cep} inputMode="numeric" maxLength={9}
              onChange={(e) => { set('cep')(e); lookupCep(e.target.value); }} /></div>
          <div><label className="label">Rua</label><input className="input" required value={f.rua} onChange={set('rua')} /></div>
          <div><label className="label">Número</label><input className="input" required value={f.numero} onChange={set('numero')} /></div>
          <div><label className="label">Complemento</label><input className="input" value={f.complemento} onChange={set('complemento')} /></div>
          <div><label className="label">Bairro</label><input className="input" required value={f.bairro} onChange={set('bairro')} /></div>
          <div><label className="label">Cidade</label><input className="input" required value={f.cidade} onChange={set('cidade')} /></div>
          <div><label className="label">UF</label><input className="input" required maxLength={2} value={f.uf} onChange={set('uf')} /></div>
        </div>

        <h2 className="pt-2 text-2xl">Frete</h2>
        {loadingFrete && <p className="text-sm text-ink/50">Calculando…</p>}
        {!loadingFrete && opts.length === 0 && <p className="text-sm text-ink/50">Digite o CEP para ver as opções.</p>}
        <div className="space-y-2">
          {opts.map((o) => (
            <label key={o.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 ${sel === o.id ? 'border-taupe bg-taupe-light/20' : 'border-ink/15'}`}>
              <span className="flex items-center gap-3">
                <input type="radio" name="frete" checked={sel === o.id} onChange={() => setSel(o.id)} />
                <span>{o.nome}<br /><span className="text-xs text-ink/50">até {o.prazo} dias úteis</span></span>
              </span>
              <b>{o.preco === 0 ? 'Grátis' : brl(o.preco)}</b>
            </label>
          ))}
        </div>
      </div>

      <aside className="card h-fit space-y-2">
        <h2 className="text-2xl">Resumo</h2>
        {items.map((i) => <p key={i.id} className="flex justify-between text-sm"><span>{i.qtd}× {i.nome}</span><span>{brl(i.preco * i.qtd)}</span></p>)}
        <p className="flex justify-between border-t border-ink/10 pt-2 text-sm"><span>Subtotal</span><span>{brl(subtotal)}</span></p>
        <p className="flex justify-between text-sm"><span>Frete</span><span>{chosen ? (chosen.preco === 0 ? 'Grátis' : brl(chosen.preco)) : '—'}</span></p>
        <p className="flex justify-between text-lg font-medium"><span>Total</span><span>{brl(total)}</span></p>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button className="btn-taupe mt-2 w-full" disabled={paying}>{paying ? 'Redirecionando…' : 'Pagar com Pix ou cartão'}</button>
        <p className="text-center text-xs text-ink/50">Pagamento seguro pelo Mercado Pago.<br />Valores finais são conferidos pelo servidor.</p>
      </aside>
    </form>
  );
}

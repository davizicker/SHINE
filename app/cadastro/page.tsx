'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function Cadastro() {
  const [f, setF] = useState({ nome: '', telefone: '', email: '', senha: '', aceite: false });
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.senha.length < 8) return setErro('A senha precisa ter pelo menos 8 caracteres.');
    setLoading(true); setErro('');
    const { data, error } = await createClient().auth.signUp({
      email: f.email,
      password: f.senha,
      options: {
        data: { nome: f.nome, telefone: f.telefone },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/conta`,
      },
    });
    setLoading(false);
    if (error) return setErro(error.message.includes('already') ? 'Este e-mail já está cadastrado.' : error.message);
    if (data.session) { window.location.href = '/conta'; return; }
    setOk(true);
  }

  if (ok) {
    return (
      <div className="container-x"><div className="card mx-auto mt-10 max-w-md text-center">
        <h1 className="text-3xl">Quase pronto ✦</h1>
        <p className="mt-3 text-ink/70">Enviamos um e-mail de confirmação para <b>{f.email}</b>. Clique no link para ativar sua conta.</p>
      </div></div>
    );
  }
  return (
    <div className="container-x">
      <form onSubmit={submit} className="card mx-auto mt-10 max-w-md space-y-4">
        <h1 className="text-3xl">Criar conta</h1>
        <div><label className="label">Nome completo</label><input className="input" required value={f.nome} onChange={set('nome')} autoComplete="name" /></div>
        <div><label className="label">WhatsApp</label><input className="input" required type="tel" placeholder="(11) 99999-9999" value={f.telefone} onChange={set('telefone')} autoComplete="tel" /></div>
        <div><label className="label">E-mail</label><input className="input" required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></div>
        <div><label className="label">Senha (mín. 8 caracteres)</label><input className="input" required type="password" minLength={8} value={f.senha} onChange={set('senha')} autoComplete="new-password" /></div>
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" required checked={f.aceite} onChange={set('aceite')} className="mt-1" />
          <span>Li e aceito a <Link href="/privacidade" className="underline" target="_blank">política de privacidade</Link>.</span>
        </label>
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button className="btn-gold w-full" disabled={loading}>{loading ? 'Criando…' : 'Criar conta'}</button>
        <p className="text-center text-sm">Já tem conta? <Link href="/entrar" className="underline">Entrar</Link></p>
      </form>
    </div>
  );
}

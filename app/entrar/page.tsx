'use client';
import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function Form() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/conta';
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErro('');
    const { error } = await createClient().auth.signInWithPassword({ email, password: senha });
    if (error) {
      setErro(error.message.includes('Email not confirmed')
        ? 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'
        : 'E-mail ou senha incorretos.');
      setLoading(false);
      return;
    }
    router.push(next.startsWith('/') ? next : '/conta');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="card mx-auto mt-10 max-w-md space-y-4">
      <h1 className="text-3xl">Entrar</h1>
      <div><label className="label">E-mail</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
      <div><label className="label">Senha</label>
        <input className="input" type="password" required value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="current-password" /></div>
      {erro && <p className="text-sm text-red-600">{erro}</p>}
      <button className="btn-gold w-full" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
      <p className="text-center text-sm">
        <Link href="/recuperar-senha" className="underline">Esqueci minha senha</Link> ·{' '}
        <Link href="/cadastro" className="underline">Criar conta</Link>
      </p>
    </form>
  );
}

export default function Entrar() {
  return <div className="container-x"><Suspense><Form /></Suspense></div>;
}

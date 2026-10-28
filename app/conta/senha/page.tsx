'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function NovaSenha() {
  const [senha, setSenha] = useState('');
  const [msg, setMsg] = useState('');
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (senha.length < 8) return setMsg('A senha precisa ter pelo menos 8 caracteres.');
    const { error } = await createClient().auth.updateUser({ password: senha });
    setMsg(error ? error.message : 'Senha atualizada com sucesso ✦');
  }
  return (
    <div className="container-x">
      <form onSubmit={submit} className="card mx-auto mt-10 max-w-md space-y-4">
        <h1 className="text-3xl">Nova senha</h1>
        <input className="input" type="password" minLength={8} required value={senha}
          onChange={(e) => setSenha(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
        {msg && <p className="text-sm">{msg}</p>}
        <button className="btn-gold w-full">Salvar</button>
      </form>
    </div>
  );
}

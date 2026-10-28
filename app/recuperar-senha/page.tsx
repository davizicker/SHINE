'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Recuperar() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/conta/senha`,
    });
    setLoading(false); setSent(true);
  }

  return (
    <div className="container-x">
      <form onSubmit={submit} className="card mx-auto mt-10 max-w-md space-y-4">
        <h1 className="text-3xl">Recuperar senha</h1>
        {sent ? (
          <p className="text-ink/70">Se esse e-mail estiver cadastrado, você receberá um link para criar uma nova senha.</p>
        ) : (
          <>
            <div><label className="label">E-mail</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <button className="btn-gold w-full" disabled={loading}>{loading ? 'Enviando…' : 'Enviar link'}</button>
          </>
        )}
      </form>
    </div>
  );
}

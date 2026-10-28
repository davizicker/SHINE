import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import CartLink from './CartLink';
import Logo from './Logo';

export const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Shine Factory';

export default async function Header() {
  let role: string | null = null;
  let logged = false;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        logged = true;
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        role = data?.role ?? null;
      }
    } catch {}
  }

  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cream/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Início"><Logo size="sm" /></Link>
        <nav className="hidden items-center gap-8 text-xs uppercase tracking-[0.2em] md:flex">
          <Link href="/produtos" className="hover:text-taupe">Joias</Link>
          <Link href="/sobre" className="hover:text-taupe">Sobre</Link>
          <Link href="/contato" className="hover:text-taupe">Contato</Link>
        </nav>
        <div className="flex items-center gap-4 text-xs uppercase tracking-[0.15em]">
          {role === 'admin' && <Link href="/admin" className="rounded-full bg-ink px-3 py-1 text-xs text-cream">Painel</Link>}
          {logged
            ? <Link href="/conta" className="hover:text-taupe">Minha conta</Link>
            : <Link href="/entrar" className="hover:text-taupe">Entrar</Link>}
          <CartLink />
        </div>
      </div>
      <nav className="container-x flex gap-5 overflow-x-auto pb-2 text-xs uppercase tracking-[0.15em] md:hidden">
        <Link href="/produtos">Joias</Link>
        <Link href="/sobre">Sobre</Link>
        <Link href="/contato">Contato</Link>
      </nav>
    </header>
  );
}

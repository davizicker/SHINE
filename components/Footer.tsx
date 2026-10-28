import Link from 'next/link';

const name = process.env.NEXT_PUBLIC_SITE_NAME || 'Shine Factory';
const wa = process.env.NEXT_PUBLIC_WHATSAPP;
const ig = process.env.NEXT_PUBLIC_INSTAGRAM;

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-ink/10 bg-ink text-cream">
      <div className="container-x grid gap-8 py-10 sm:grid-cols-3">
        <div>
          <p className="font-serif text-2xl">✦ {name}</p>
          <p className="mt-2 text-sm text-cream/70">Bijuterias que fazem você brilhar.</p>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">Loja</p>
          <ul className="space-y-1 text-cream/70">
            <li><Link href="/produtos">Todas as joias</Link></li>
            <li><Link href="/trocas">Trocas e devoluções</Link></li>
            <li><Link href="/privacidade">Privacidade</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-2 font-medium">Fale com a gente</p>
          <ul className="space-y-1 text-cream/70">
            {wa && <li><a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a></li>}
            {ig && <li><a href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">Instagram @{ig}</a></li>}
            <li><Link href="/contato">Contato</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-cream/10 py-4 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}

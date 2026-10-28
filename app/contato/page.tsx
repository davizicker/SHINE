import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Contato' };

export default function Contato() {
  const wa = process.env.NEXT_PUBLIC_WHATSAPP;
  const ig = process.env.NEXT_PUBLIC_INSTAGRAM;
  const address = process.env.NEXT_PUBLIC_ADDRESS;
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl">Contato</h1>
      <p className="mt-4 text-ink/80">Dúvidas sobre uma peça, pedido ou troca? Fale com a gente.</p>
      {address && <p className="mt-4">📍 {address}</p>}
      <div className="mt-6 flex flex-wrap gap-3">
        {wa && <a className="btn-taupe" href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer">WhatsApp</a>}
        {ig && <a className="btn-outline" href={`https://instagram.com/${ig}`} target="_blank" rel="noreferrer">Instagram @{ig}</a>}
      </div>
    </div>
  );
}

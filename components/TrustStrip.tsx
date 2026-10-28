const items = [
  ['Pix ou cartão', 'em até 6x no cartão'],
  ['Envio Correios', 'para todo o Brasil'],
  ['Troca em 7 dias', 'compra sem risco'],
  ['Compra segura', 'pagamento Mercado Pago'],
];

export default function TrustStrip() {
  return (
    <section className="border-y border-ink/10 bg-white/60">
      <div className="container-x grid grid-cols-2 gap-y-6 py-8 text-center md:grid-cols-4">
        {items.map(([t, s]) => (
          <div key={t}>
            <p className="font-serif text-xl">{t}</p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.15em] text-ink/50">{s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

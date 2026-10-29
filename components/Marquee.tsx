const words = ['Colares', 'Brincos', 'Pulseiras', 'Anéis', 'Pérolas', 'Conjuntos'];

export default function Marquee() {
  const group = Array.from({ length: 3 }).flatMap((_, g) =>
    words.map((w) => (
      <span key={`${g}-${w}`} className="flex items-center gap-10">
        <span>{w}</span><span className="text-champagne">✦</span>
      </span>
    )),
  );
  return (
    <div className="overflow-hidden bg-taupe-dark py-4 text-cream" aria-hidden>
      <div className="marquee flex w-max gap-10 whitespace-nowrap font-serif text-2xl italic">
        <div className="flex gap-10">{group}</div>
        <div className="flex gap-10">{group}</div>
      </div>
    </div>
  );
}

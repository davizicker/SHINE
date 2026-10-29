export default function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-10 text-center">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-4xl sm:text-5xl">{title}</h2>
      <div className="mx-auto mt-4 flex items-center justify-center gap-3 text-champagne" aria-hidden>
        <span className="h-px w-12 bg-champagne/50" /><span className="text-sm">✦</span><span className="h-px w-12 bg-champagne/50" />
      </div>
    </div>
  );
}

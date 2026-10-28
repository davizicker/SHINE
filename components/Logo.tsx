// Logo da Shine Factory recriado em texto: SHINE espaçado, brilho sobre o "I" e "factory" em cursiva.
// Troque por <img src="/logo.svg"> quando tiver o arquivo original.
const SIZES = { sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl', xl: 'text-6xl sm:text-7xl' };

export default function Logo({ size = 'md', light = false }: { size?: keyof typeof SIZES; light?: boolean }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${SIZES[size]} ${light ? 'text-cream' : 'text-ink'}`} aria-label="Shine Factory">
      <span className="relative pl-[0.3em] font-serif font-medium tracking-[0.3em]">
        SHINE
        <span aria-hidden className="absolute -top-[0.55em] left-[43%] text-[0.4em] tracking-normal">✦</span>
      </span>
      <span aria-hidden className="-mt-[0.1em] self-end pr-[0.1em] font-script text-[0.62em] opacity-80">factory</span>
    </span>
  );
}

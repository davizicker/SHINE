'use client';
import { useEffect, useRef, useState } from 'react';

// Logo da Shine Factory recriado em texto: SHINE espaçado, brilho sobre o "I" e "factory" em cursiva.
// Ao passar o mouse (ou o dedo), um brilho dourado acompanha o cursor pelas letras e solta faíscas.
// Troque por <img src="/logo.svg"> quando tiver o arquivo original.
const SIZES = {
  sm: 'text-xl', md: 'text-3xl', lg: 'text-5xl', xl: 'text-6xl sm:text-7xl',
  xxl: 'text-[3.4rem] sm:text-8xl md:text-[9rem]',
};
const WORD = 'relative pl-[0.3em] font-serif font-medium tracking-[0.3em]';

interface Spark { id: number; x: number; y: number; r: number }

export default function Logo({ size = 'md', light = false, gold = false }: { size?: keyof typeof SIZES; light?: boolean; gold?: boolean }) {
  const root = useRef<HTMLSpanElement>(null);
  const glow = useRef<HTMLSpanElement>(null);
  const target = useRef({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });
  const raf = useRef(0);
  const lastSpark = useRef(0);
  const sparkId = useRef(0);
  const reduce = useRef(false);
  const [active, setActive] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);

  useEffect(() => {
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const paint = () => {
    const el = glow.current;
    if (!el) return;
    const k = reduce.current ? 1 : 0.22; // suaviza o movimento do brilho
    cur.current.x += (target.current.x - cur.current.x) * k;
    cur.current.y += (target.current.y - cur.current.y) * k;
    el.style.setProperty('--x', `${cur.current.x}px`);
    el.style.setProperty('--y', `${cur.current.y}px`);
    if (Math.abs(target.current.x - cur.current.x) > 0.4 || Math.abs(target.current.y - cur.current.y) > 0.4) {
      raf.current = requestAnimationFrame(paint);
    }
  };

  const point = (e: React.PointerEvent) => {
    const box = glow.current?.getBoundingClientRect();
    return box ? { x: e.clientX - box.left, y: e.clientY - box.top } : { x: 0, y: 0 };
  };

  const onEnter = (e: React.PointerEvent) => {
    const p = point(e);
    target.current = p; cur.current = p; // começa já debaixo do cursor
    setActive(true);
    paint();
  };

  const onMove = (e: React.PointerEvent) => {
    target.current = point(e);
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(paint);

    const now = performance.now();
    if (reduce.current || now - lastSpark.current < 70) return;
    lastSpark.current = now;
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const id = ++sparkId.current;
    const s = { id, x: e.clientX - box.left + (Math.random() - 0.5) * 16, y: e.clientY - box.top + (Math.random() - 0.5) * 16, r: 0.5 + Math.random() * 0.6 };
    setSparks((cur) => [...cur.slice(-9), s]);
    setTimeout(() => setSparks((cur) => cur.filter((x) => x.id !== id)), 800);
  };

  return (
    <span
      ref={root}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={() => setActive(false)}
      className={`relative inline-flex flex-col items-center leading-none ${SIZES[size]} ${light ? 'text-cream' : 'text-ink'}`}
      aria-label="Shine Factory"
    >
      <span className={WORD}>
        <span className={gold ? 'gold-text' : ''}>SHINE</span>
        <span aria-hidden className={`absolute -top-[0.55em] left-[43%] text-[0.4em] tracking-normal ${gold ? 'gold-text' : ''}`}>✦</span>
        {/* cópia da palavra pintada com o brilho; aparece só com o mouse em cima */}
        <span
          ref={glow}
          aria-hidden
          className={`pointer-events-none absolute inset-0 select-none bg-clip-text pl-[0.3em] text-transparent transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
          style={{
            backgroundImage:
              'radial-gradient(circle 0.95em at var(--x, -999px) var(--y, -999px), #fffdf2 0%, #f7e3a1 28%, #d9b569 52%, transparent 78%)',
            filter: 'drop-shadow(0 0 0.12em rgba(233, 196, 106, 0.75))',
          }}
        >
          SHINE
        </span>
      </span>
      <span aria-hidden className={`-mt-[0.1em] self-end pr-[0.1em] font-script text-[0.62em] ${gold ? 'gold-text' : 'opacity-80'}`}>factory</span>

      {sparks.map((s) => (
        <span key={s.id} aria-hidden className="shine-spark" style={{ left: s.x, top: s.y, fontSize: `${s.r}em` }}>✦</span>
      ))}
    </span>
  );
}

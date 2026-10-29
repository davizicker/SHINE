// Brilhos que piscam devagar no fundo escuro. Posições fixas (sem aleatório) para não dar diferença entre servidor e navegador.
const S = [
  [8, 18, 14, 0, 5], [16, 62, 10, 1.2, 6], [24, 34, 18, 2.4, 7], [31, 80, 9, 0.6, 5.5],
  [42, 12, 12, 3.1, 6.5], [52, 88, 16, 1.8, 7.5], [61, 24, 10, 4.2, 5], [70, 70, 20, 0.9, 8],
  [78, 14, 12, 2.7, 6], [86, 48, 16, 3.6, 7], [92, 82, 10, 1.4, 5.5], [4, 86, 12, 4.8, 6.5],
  [96, 22, 9, 2.1, 5], [47, 52, 8, 5.3, 6], [66, 44, 9, 0.3, 7],
];

export default function AmbientSparkles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {S.map(([x, y, size, delay, dur], i) => (
        <span key={i} className="ambient-spark" style={{ left: `${x}%`, top: `${y}%`, fontSize: size, animationDelay: `${delay}s`, animationDuration: `${dur}s` }}>✦</span>
      ))}
    </div>
  );
}

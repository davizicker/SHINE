'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x py-24 text-center">
      <h1 className="text-4xl">Algo deu errado</h1>
      <p className="mt-3 text-ink/60">Tivemos um problema ao carregar esta página. Tente novamente em instantes.</p>
      <button onClick={reset} className="btn-taupe mt-8">Tentar de novo</button>
    </div>
  );
}

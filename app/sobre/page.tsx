import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Sobre' };
export default function Page() {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl">Sobre</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <p>Somos a Shine Factory: bijuterias escolhidas com carinho para dar brilho ao seu dia a dia.</p>
        <p>Cada peça é separada e embalada com atenção antes de seguir para você.</p>
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Sobre' };
export default function Page() {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl">Sobre</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <p>A Shine Factory nasceu da paixão por acessórios que contam uma história. Mais que bijuterias e semijoias, queremos que cada peça faça parte do seu estilo de vida.</p>
        <p>Trabalhamos com colares, brincos, pulseiras e anéis para compor looks do delicado ao statement. Venha nos visitar no ateliê ou compre pelo site e receba em casa.</p>
      </div>
    </div>
  );
}

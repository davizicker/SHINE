import Link from 'next/link';
import Logo from '@/components/Logo';

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center py-24 text-center">
      <Logo size="lg" />
      <p className="eyebrow mt-10">Erro 404</p>
      <h1 className="mt-2 text-4xl">Essa página não brilhou por aqui</h1>
      <p className="mt-3 text-ink/60">O endereço pode ter mudado ou a peça não está mais disponível.</p>
      <Link href="/produtos" className="btn-taupe mt-8">Ver coleção</Link>
    </div>
  );
}

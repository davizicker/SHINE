import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const links = [
  ['/admin', 'Resumo'], ['/admin/pedidos', 'Pedidos'], ['/admin/produtos', 'Produtos'],
  ['/admin/categorias', 'Categorias'], ['/admin/clientes', 'Clientes'],
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-x py-8">
      <nav className="mb-8 flex gap-2 overflow-x-auto border-b border-ink/10 pb-3">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="whitespace-nowrap rounded-full px-4 py-2 text-sm hover:bg-sand">{label}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}

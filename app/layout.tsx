import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const name = process.env.NEXT_PUBLIC_SITE_NAME || 'Shine Factory';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: `${name} — Bijuterias`, template: `%s | ${name}` },
  description: 'Bijuterias delicadas e cheias de brilho. Brincos, colares, pulseiras e anéis com envio para todo o Brasil.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

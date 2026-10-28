import type { MetadataRoute } from 'next';
import { createPublicClient } from '@/lib/supabase/public';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const pages: MetadataRoute.Sitemap = ['', '/produtos', '/sobre', '/contato', '/trocas', '/privacidade']
    .map((p) => ({ url: `${site}${p}` }));
  const sb = createPublicClient();
  if (!sb) return pages;
  const { data } = await sb.from('products').select('slug, created_at').eq('ativo', true);
  return [...pages, ...(data ?? []).map((p) => ({ url: `${site}/produtos/${p.slug}`, lastModified: p.created_at }))];
}

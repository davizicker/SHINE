export interface ProductImage { url: string; posicao: number }
export interface Category { id: string; nome: string; slug: string }
export interface Product {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  material: string | null;
  sku: string | null;
  category_id: string | null;
  preco: number;
  preco_promocional: number | null;
  estoque: number;
  ativo: boolean;
  destaque: boolean;
  product_images?: ProductImage[];
  categories?: { nome: string; slug: string } | null;
}

export const effectivePrice = (p: Pick<Product, 'preco' | 'preco_promocional'>) =>
  p.preco_promocional != null && p.preco_promocional > 0 && p.preco_promocional < p.preco
    ? Number(p.preco_promocional)
    : Number(p.preco);

export const onSale = (p: Pick<Product, 'preco' | 'preco_promocional'>) =>
  effectivePrice(p) < Number(p.preco);

export const sortedImages = (p: Product) =>
  [...(p.product_images ?? [])].sort((a, b) => a.posicao - b.posicao).map((i) => i.url);

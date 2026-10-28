'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/format';

const num = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : NaN;
};

export async function saveProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const back = id ? `/admin/produtos/${id}` : '/admin/produtos/novo';
  const nome = String(formData.get('nome') ?? '').trim();
  const preco = num(formData.get('preco'));
  const promoRaw = String(formData.get('preco_promocional') ?? '').trim();
  const promo = promoRaw === '' ? null : num(promoRaw);
  const estoque = Math.floor(num(formData.get('estoque')));
  if (!nome || !(preco >= 0) || !(estoque >= 0) || (promo !== null && !(promo >= 0))) {
    redirect(`${back}?erro=${encodeURIComponent('Confira nome, preço e estoque.')}`);
  }
  const slugInput = String(formData.get('slug') ?? '').trim();
  const row = {
    nome,
    slug: slugify(slugInput || nome),
    descricao: String(formData.get('descricao') ?? '').trim() || null,
    material: String(formData.get('material') ?? '').trim() || null,
    sku: String(formData.get('sku') ?? '').trim() || null,
    category_id: String(formData.get('category_id') ?? '') || null,
    preco, preco_promocional: promo, estoque,
    ativo: formData.get('ativo') === 'on',
    destaque: formData.get('destaque') === 'on',
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from('products').update(row).eq('id', id);
    if (error) redirect(`${back}?erro=${encodeURIComponent(error.code === '23505' ? 'Já existe uma peça com esse endereço (slug).' : error.message)}`);
  } else {
    const { data, error } = await supabase.from('products').insert(row).select('id').single();
    if (error || !data) redirect(`${back}?erro=${encodeURIComponent(error?.code === '23505' ? 'Já existe uma peça com esse nome/endereço.' : error?.message ?? 'Erro ao salvar')}`);
    productId = data.id;
  }

  let urls: string[] = [];
  try { urls = JSON.parse(String(formData.get('images') ?? '[]')); } catch {}
  await supabase.from('product_images').delete().eq('product_id', productId);
  if (urls.length) {
    await supabase.from('product_images').insert(urls.map((url, posicao) => ({ product_id: productId, url, posicao })));
  }
  revalidatePath('/', 'layout');
  redirect('/admin/produtos?salvo=1');
}

export async function deleteProduct(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('products').delete().eq('id', String(formData.get('id')));
  revalidatePath('/', 'layout');
  redirect('/admin/produtos');
}

export async function addCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const nome = String(formData.get('nome') ?? '').trim();
  if (nome) await supabase.from('categories').insert({ nome, slug: slugify(nome) });
  revalidatePath('/', 'layout');
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('categories').delete().eq('id', String(formData.get('id')));
  revalidatePath('/', 'layout');
}

const STATUS = ['aguardando_pagamento', 'pago', 'separando', 'enviado', 'entregue', 'cancelado'];
export async function updateOrder(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id'));
  const status = String(formData.get('status'));
  if (!STATUS.includes(status)) return;
  await supabase.from('orders').update({
    status, codigo_rastreio: String(formData.get('codigo_rastreio') ?? '').trim() || null,
  }).eq('id', id);
  revalidatePath(`/admin/pedidos/${id}`);
  redirect(`/admin/pedidos/${id}?salvo=1`);
}

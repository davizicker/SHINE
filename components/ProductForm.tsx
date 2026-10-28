'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { saveProduct } from '@/app/admin/actions';
import type { Category, Product } from '@/lib/types';

// Reduz fotos de celular (vários MB) para WebP de até 1600px antes de enviar.
async function compress(file: File): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('Falha ao processar imagem'))), 'image/webp', 0.85));
}

export default function ProductForm({ product, images: initial, categories, erro }: {
  product?: Product; images: string[]; categories: Category[]; erro?: string;
}) {
  const [images, setImages] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setMsg('');
    const sb = createClient();
    const added: string[] = [];
    for (const f of Array.from(files)) {
      try {
        const blob = await compress(f);
        const path = `${crypto.randomUUID()}.webp`;
        const { error } = await sb.storage.from('products').upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
        if (error) throw error;
        added.push(sb.storage.from('products').getPublicUrl(path).data.publicUrl);
      } catch (e) { setMsg(`Erro ao enviar ${f.name}: ${(e as Error).message}`); }
    }
    setImages((cur) => [...cur, ...added]);
    setBusy(false);
  }
  const move = (i: number, d: number) => setImages((cur) => {
    const a = [...cur]; const j = i + d;
    if (j < 0 || j >= a.length) return a;
    [a[i], a[j]] = [a[j], a[i]]; return a;
  });

  const p = product;
  return (
    <form action={saveProduct} className="grid gap-8 lg:grid-cols-[1fr_380px]">
      {p && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="card space-y-4">
        {erro && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{erro}</p>}
        <div><label className="label">Nome da peça</label><input name="nome" required className="input" defaultValue={p?.nome} /></div>
        <div><label className="label">Descrição</label><textarea name="descricao" rows={5} className="input" defaultValue={p?.descricao ?? ''} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Preço (R$)</label><input name="preco" required type="number" step="0.01" min="0" className="input" defaultValue={p?.preco} /></div>
          <div><label className="label">Preço promocional (opcional)</label><input name="preco_promocional" type="number" step="0.01" min="0" className="input" defaultValue={p?.preco_promocional ?? ''} /></div>
          <div><label className="label">Quantidade em estoque</label><input name="estoque" required type="number" min="0" step="1" className="input" defaultValue={p?.estoque ?? 1} /></div>
          <div><label className="label">Categoria</label>
            <select name="category_id" className="input" defaultValue={p?.category_id ?? ''}>
              <option value="">Sem categoria</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select></div>
          <div><label className="label">Material / banho</label><input name="material" className="input" placeholder="Ex.: Banho de ouro 18k" defaultValue={p?.material ?? ''} /></div>
          <div><label className="label">Código (opcional)</label><input name="sku" className="input" defaultValue={p?.sku ?? ''} /></div>
        </div>
        <div><label className="label">Endereço no site (opcional)</label><input name="slug" className="input" placeholder="gerado a partir do nome" defaultValue={p?.slug} /></div>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" name="ativo" defaultChecked={p?.ativo ?? true} /> Visível na loja</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="destaque" defaultChecked={p?.destaque ?? false} /> Destaque na home</label>
        </div>
        <button className="btn-gold" disabled={busy}>{busy ? 'Enviando fotos…' : 'Salvar peça'}</button>
      </div>

      <div className="card h-fit space-y-3">
        <h2 className="text-2xl">Fotos</h2>
        <p className="text-xs text-ink/50">A primeira foto é a principal. Você pode enviar várias de uma vez.</p>
        <label className="btn-outline w-full cursor-pointer">
          {busy ? 'Enviando…' : 'Adicionar fotos'}
          <input type="file" accept="image/*" multiple className="hidden" disabled={busy} onChange={(e) => { upload(e.target.files); e.target.value = ''; }} />
        </label>
        {msg && <p className="text-sm text-red-600">{msg}</p>}
        <ul className="grid grid-cols-2 gap-3">
          {images.map((src, i) => (
            <li key={src} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-square w-full rounded-xl object-cover" />
              {i === 0 && <span className="badge absolute left-2 top-2 bg-gold text-white">Principal</span>}
              <div className="mt-1 flex justify-between text-xs">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>←</button>
                <button type="button" className="text-red-600" onClick={() => setImages((c) => c.filter((_, k) => k !== i))}>remover</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1}>→</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </form>
  );
}

import { createClient } from '@/lib/supabase/server';
import { addCategory, deleteCategory } from '../actions';

export default async function Categorias() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('nome');
  return (
    <div className="max-w-xl">
      <h1 className="mb-6 text-4xl">Categorias</h1>
      <form action={addCategory} className="mb-6 flex gap-3">
        <input name="nome" required placeholder="Nova categoria (ex.: Tornozeleiras)" className="input" />
        <button className="btn-gold">Adicionar</button>
      </form>
      <ul className="card divide-y divide-ink/10 p-0">
        {(data ?? []).map((c) => (
          <li key={c.id} className="flex items-center justify-between px-5 py-3">
            <span>{c.nome}</span>
            <form action={deleteCategory}><input type="hidden" name="id" value={c.id} />
              <button className="text-sm text-red-600 underline">Excluir</button></form>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink/50">Excluir uma categoria não apaga as peças: elas ficam “sem categoria”.</p>
    </div>
  );
}

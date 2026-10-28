'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { onlyDigits } from '@/lib/format';

export async function saveProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/entrar');
  const g = (k: string) => String(formData.get(k) ?? '').trim();
  const { error } = await supabase.from('profiles').update({
    nome: g('nome'), telefone: g('telefone'), cpf: onlyDigits(g('cpf')),
    cep: onlyDigits(g('cep')), rua: g('rua'), numero: g('numero'),
    complemento: g('complemento'), bairro: g('bairro'), cidade: g('cidade'), uf: g('uf').toUpperCase().slice(0, 2),
  }).eq('id', user.id);
  revalidatePath('/conta');
  redirect(error ? '/conta?erro=1' : '/conta?salvo=1');
}

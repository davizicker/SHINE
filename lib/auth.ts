import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function getUserAndProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, profile: null };
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return { supabase, user, profile };
}

export async function requireAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) redirect('/');
  const ctx = await getUserAndProfile();
  if (!ctx.user) redirect('/entrar?next=/admin');
  if (ctx.profile?.role !== 'admin') redirect('/');
  return ctx;
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse('Não autorizado', { status: 401 });
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (me?.role !== 'admin') return new NextResponse('Proibido', { status: 403 });

  const { data } = await supabase.from('profiles').select('*').eq('role', 'cliente').order('created_at', { ascending: false });
  const head = ['nome', 'email', 'telefone', 'cidade', 'uf', 'cadastro'];
  const rows = (data ?? []).map((c) => [c.nome, c.email, c.telefone, c.cidade, c.uf, c.created_at].map(esc).join(','));
  return new NextResponse('﻿' + [head.join(','), ...rows].join('\n'), {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="clientes-shine.csv"' },
  });
}

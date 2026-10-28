import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { quoteShipping } from '@/lib/shipping';
import { effectivePrice } from '@/lib/types';
import { onlyDigits, validCPF } from '@/lib/format';

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token || !process.env.SUPABASE_SERVICE_ROLE_KEY) return fail('Pagamento ainda não configurado.', 503);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail('Faça login para continuar.', 401);

  const body = await req.json().catch(() => null);
  const e = body?.endereco;
  const reqItems: { id: string; qtd: number }[] = body?.items ?? [];
  if (!e || reqItems.length === 0) return fail('Dados incompletos.');
  if (!validCPF(e.cpf)) return fail('CPF inválido.');
  const cep = onlyDigits(String(e.cep));
  if (cep.length !== 8) return fail('CEP inválido.');

  // Preço e estoque SEMPRE vêm do banco, nunca do navegador.
  const { data: prods } = await supabase.from('products').select('*').in('id', reqItems.map((i) => i.id)).eq('ativo', true);
  const lines = [];
  for (const it of reqItems) {
    const p = prods?.find((x) => x.id === it.id);
    const qtd = Math.floor(Number(it.qtd));
    if (!p || !(qtd > 0)) return fail('Um item do carrinho não está mais disponível.');
    if (p.estoque < qtd) return fail(`Estoque insuficiente para "${p.nome}" (restam ${p.estoque}).`);
    lines.push({ id: p.id as string, nome: p.nome as string, preco: effectivePrice(p), quantidade: qtd });
  }
  const subtotal = lines.reduce((s, l) => s + l.preco * l.quantidade, 0);

  const options = await quoteShipping(cep, lines).catch(() => []);
  const frete = options.find((o) => o.id === body.frete_id);
  if (!frete) return fail('Opção de frete inválida. Recalcule o frete.');
  const total = Math.round((subtotal + frete.preco) * 100) / 100;

  const admin = createAdminClient();
  const endereco = {
    nome: String(e.nome).trim(), cpf: onlyDigits(e.cpf), telefone: String(e.telefone).trim(), cep,
    rua: String(e.rua).trim(), numero: String(e.numero).trim(), complemento: String(e.complemento ?? '').trim(),
    bairro: String(e.bairro).trim(), cidade: String(e.cidade).trim(), uf: String(e.uf).trim().toUpperCase().slice(0, 2),
  };
  const { data: order, error } = await admin.from('orders').insert({
    user_id: user.id, subtotal, frete: frete.preco, total, frete_servico: frete.nome, endereco,
  }).select('id').single();
  if (error || !order) return fail('Não foi possível criar o pedido.', 500);

  await admin.from('order_items').insert(lines.map((l) => ({
    order_id: order.id, product_id: l.id, nome: l.nome, preco: l.preco, quantidade: l.quantidade,
  })));

  const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  const https = site.startsWith('https://');
  const pref = {
    items: [
      ...lines.map((l) => ({ id: l.id, title: l.nome, quantity: l.quantidade, unit_price: l.preco, currency_id: 'BRL' })),
      ...(frete.preco > 0 ? [{ id: 'frete', title: `Frete — ${frete.nome}`, quantity: 1, unit_price: frete.preco, currency_id: 'BRL' }] : []),
    ],
    payer: { name: endereco.nome, email: user.email },
    external_reference: order.id,
    back_urls: ['success', 'pending', 'failure'].reduce((a, k) => ({ ...a, [k]: `${site}/conta/pedidos/${order.id}` }), {}),
    ...(https ? { auto_return: 'approved', notification_url: `${site}/api/webhooks/mercadopago` } : {}),
    payment_methods: { installments: 6 },
    statement_descriptor: 'SHINE',
  };

  const res = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(pref),
  });
  const mp = await res.json();
  if (!res.ok || !mp.init_point) {
    await admin.from('orders').update({ status: 'cancelado' }).eq('id', order.id);
    return fail('Erro ao iniciar o pagamento. Tente novamente.', 502);
  }
  await admin.from('orders').update({ mp_preference_id: mp.id }).eq('id', order.id);
  return NextResponse.json({ url: mp.init_point, order_id: order.id });
}

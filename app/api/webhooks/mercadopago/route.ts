import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// O Mercado Pago só avisa "o pagamento X mudou". Não confiamos no corpo da requisição:
// consultamos o pagamento direto na API deles com o nosso token.
export async function POST(req: NextRequest) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await req.json().catch(() => ({}));
  const type = body.type ?? req.nextUrl.searchParams.get('type') ?? req.nextUrl.searchParams.get('topic');
  const paymentId = body?.data?.id ?? req.nextUrl.searchParams.get('data.id') ?? req.nextUrl.searchParams.get('id');
  if (type !== 'payment' || !paymentId || !/^\d+$/.test(String(paymentId))) return NextResponse.json({ ok: true });

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 502 }); // MP tenta de novo
  const pay = await res.json();
  const orderId = pay.external_reference;
  if (!orderId) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  if (pay.status === 'approved') {
    await admin.rpc('confirm_order_payment', { p_order: orderId, p_payment: String(paymentId) });
  } else if (pay.status === 'cancelled' || pay.status === 'expired') {
    await admin.from('orders').update({ status: 'cancelado', mp_payment_id: String(paymentId) })
      .eq('id', orderId).eq('status', 'aguardando_pagamento');
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}

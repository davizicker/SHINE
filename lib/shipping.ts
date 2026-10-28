import { onlyDigits } from '@/lib/format';

export interface ShippingOption {
  id: string;
  nome: string;
  preco: number;
  prazo: number; // dias úteis
  estimado?: boolean;
}

// Pacote padrão de bijuteria (cm / kg). Ajuste conforme as embalagens reais.
const PKG = { width: 16, height: 4, length: 20, weight: 0.12 };

// Tabela de contingência quando não há token do Melhor Envio (valores estimados).
const REGION_TABLE: Record<string, { preco: number; prazo: number }> = {
  '0': { preco: 18, prazo: 5 }, '1': { preco: 18, prazo: 5 }, // SP
  '2': { preco: 22, prazo: 6 }, '3': { preco: 24, prazo: 7 }, // RJ/ES/MG
  '4': { preco: 28, prazo: 8 }, '5': { preco: 28, prazo: 8 }, // BA/SE/PE...
  '6': { preco: 34, prazo: 10 }, '7': { preco: 30, prazo: 9 }, // Norte/Centro-Oeste
  '8': { preco: 26, prazo: 7 }, '9': { preco: 26, prazo: 7 }, // Sul
};

export async function quoteShipping(
  cepRaw: string,
  items: { quantidade: number; preco: number }[],
): Promise<ShippingOption[]> {
  const cep = onlyDigits(cepRaw);
  if (cep.length !== 8) throw new Error('CEP inválido');
  const subtotal = items.reduce((s, i) => s + i.preco * i.quantidade, 0);
  const qty = items.reduce((s, i) => s + i.quantidade, 0);

  const freeMin = Number(process.env.FREE_SHIPPING_MIN || 0);
  const free = freeMin > 0 && subtotal >= freeMin;

  let options: ShippingOption[] = [];
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (token) {
    try {
      const base = process.env.MELHOR_ENVIO_SANDBOX === 'true'
        ? 'https://sandbox.melhorenvio.com.br' : 'https://melhorenvio.com.br';
      const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'Shine Loja (contato@shine.com.br)',
        },
        body: JSON.stringify({
          from: { postal_code: onlyDigits(process.env.ORIGIN_CEP || '') },
          to: { postal_code: cep },
          products: [{
            id: 'bijuteria', ...PKG, weight: PKG.weight * qty,
            insurance_value: subtotal, quantity: 1,
          }],
          options: { receipt: false, own_hand: false },
          services: '1,2', // 1 = PAC, 2 = SEDEX (Correios)
        }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        options = data
          .filter((o) => !o.error && o.price)
          .map((o) => ({
            id: String(o.id),
            nome: `Correios ${o.name}`,
            preco: Number(o.custom_price ?? o.price),
            prazo: Number(o.custom_delivery_time ?? o.delivery_time),
          }));
      }
    } catch {
      // cai na tabela estimada abaixo
    }
  }

  if (options.length === 0) {
    const r = REGION_TABLE[cep[0]];
    options = [
      { id: 'pac', nome: 'Correios PAC (estimado)', preco: r.preco, prazo: r.prazo + 2, estimado: true },
      { id: 'sedex', nome: 'Correios SEDEX (estimado)', preco: Math.round(r.preco * 1.8), prazo: Math.max(2, r.prazo - 2), estimado: true },
    ];
  }

  if (free) {
    const cheapest = options.reduce((a, b) => (a.preco <= b.preco ? a : b));
    options = options.map((o) => (o.id === cheapest.id ? { ...o, preco: 0, nome: `${o.nome} — frete grátis` } : o));
  }
  return options;
}

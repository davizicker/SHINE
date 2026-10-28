import { brl } from '@/lib/format';

export default function AnnouncementBar() {
  const free = Number(process.env.FREE_SHIPPING_MIN || 0);
  return (
    <div className="bg-taupe-dark px-4 py-2 text-center text-[11px] uppercase tracking-[0.2em] text-cream">
      Pix ou cartão em até 6x · Envio para todo o Brasil
      {free > 0 && <> · Frete grátis acima de {brl(free)}</>}
    </div>
  );
}

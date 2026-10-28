import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Trocas e devoluções' };
export default function Page() {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl">Trocas e devoluções</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <p>Você pode desistir da compra em até 7 dias corridos após o recebimento, sem precisar justificar (art. 49 do Código de Defesa do Consumidor).</p>
        <p>Para trocas por defeito ou envio errado, fale conosco em até 7 dias pelo WhatsApp com fotos da peça.</p>
        <p>As peças devem estar sem uso e na embalagem original. O reembolso é feito pela mesma forma de pagamento.</p>
        <p className="text-sm text-ink/50">Texto-modelo: revise com a responsável pela loja antes de publicar.</p>
      </div>
    </div>
  );
}

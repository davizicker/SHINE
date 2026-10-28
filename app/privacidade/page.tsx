import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Política de privacidade' };
export default function Page() {
  return (
    <div className="container-x max-w-3xl py-12">
      <h1 className="text-4xl">Política de privacidade</h1>
      <div className="mt-6 space-y-4 text-ink/80">
        <p>Coletamos apenas os dados necessários para processar seu pedido: nome, e-mail, telefone, CPF e endereço de entrega.</p>
        <p>Seus dados são usados para entrega, contato sobre o pedido e emissão de pagamento. Os pagamentos são processados pelo Mercado Pago; não armazenamos dados de cartão.</p>
        <p>Você pode corrigir seus dados na área "Minha conta" ou pedir a exclusão deles pelo nosso contato, conforme a LGPD (Lei 13.709/2018).</p>
        <p className="text-sm text-ink/50">Texto-modelo: revise com a responsável pela loja antes de publicar.</p>
      </div>
    </div>
  );
}

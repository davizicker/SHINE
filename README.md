# Shine Factory — loja de bijuterias

Next.js 15 + Supabase (banco, login, fotos) + Mercado Pago (Pix e cartão) + frete dos Correios.

**O que tem:** catálogo com filtros e busca · página da peça com várias fotos · carrinho · checkout com
Pix/cartão · cadastro/login/recuperar senha · área do cliente (dados e pedidos) · painel da administradora
(produtos com várias fotos, preço, estoque, categorias, clientes + CSV, pedidos com status e rastreio).

> **Guia completo, passo a passo, para leigos: [`docs/DEPLOY.md`](docs/DEPLOY.md)**

## Colocar no ar (resumo)

### 1. Supabase (banco, login, fotos) — grátis
1. Crie conta em https://supabase.com → **New project** (região South America / São Paulo).
2. **SQL Editor → New query** → cole todo o conteúdo de `supabase/migrations/0001_init.sql` → **Run**.
3. **Project Settings → API**: copie `Project URL`, `anon public` e `service_role` (esta é secreta!).
4. **Authentication → URL Configuration**: em *Site URL* ponha o endereço final do site
   e em *Redirect URLs* adicione `https://SEU-SITE/auth/callback` (e `http://localhost:3000/auth/callback` para testes).
5. (Opcional) **Authentication → Providers → Email**: se quiser que o cliente entre sem confirmar o e-mail, desligue *Confirm email*.
   Para produção, configure um SMTP próprio (ex.: Resend) em *Authentication → SMTP*, pois o e-mail padrão do Supabase tem limite baixo.

### 2. Mercado Pago
1. Conta em https://www.mercadopago.com.br/developers → **Suas integrações → Criar aplicação** (Checkout Pro).
2. Copie o **Access Token** (use o de *teste* primeiro, depois o de *produção*) → `MP_ACCESS_TOKEN`.
3. O aviso de pagamento (webhook) já é configurado automaticamente a cada pedido, desde que o site seja `https://`.

### 3. Render (hospedagem)
1. Suba este repositório no GitHub (já está).
2. https://render.com → **New → Blueprint** → escolha o repositório (usa o `render.yaml`).
3. Preencha as variáveis (veja `.env.example`). `NEXT_PUBLIC_SITE_URL` = endereço que o Render der (ex.: `https://shine.onrender.com`).
4. Deploy. Depois, ligue o domínio próprio em **Settings → Custom Domains**.

> Plano gratuito do Render "dorme" após ~15 min sem visitas (primeiro acesso demora). Para a loja oficial, use o plano pago.

### 4. Tornar a dona administradora
1. No site, **crie a conta** dela em `/cadastro` (confirme o e-mail).
2. No Supabase **SQL Editor**:
   ```sql
   update public.profiles set role = 'admin' where email = 'email-da-tia@exemplo.com';
   ```
3. Ao entrar, aparece o botão **Painel** no topo do site (`/admin`).

### 5. Frete (Correios)
- `ORIGIN_CEP` = CEP de onde ela despacha.
- Sem token, o site usa uma **tabela estimada** (PAC/SEDEX) — ajuste os valores em `lib/shipping.ts`.
- Com conta no [Melhor Envio](https://melhorenvio.com.br) (gerar token em *Configurações → Tokens*), o frete passa a ser o real dos Correios → `MELHOR_ENVIO_TOKEN`.
- `FREE_SHIPPING_MIN` (ex.: `250`) dá frete grátis acima desse valor.
- Pesos/medidas da embalagem: `PKG` em `lib/shipping.ts`.

## Rodar no computador
```bash
cp .env.example .env.local   # preencha
npm install
npm run dev                  # http://localhost:3000
```

## Identidade visual
Cores provisórias em `tailwind.config.ts` (`gold`, `cream`, `blush`, `ink`). Logo: hoje é o texto "✦ Shine Factory" em `components/Header.tsx`.

## Segurança (resumo)
- Preço, estoque e frete são recalculados **no servidor** no checkout; o navegador não decide valores.
- Pagamento confirmado só via consulta direta à API do Mercado Pago (webhook não é confiado).
- Regras RLS no banco: cliente vê só os próprios pedidos; só `role = 'admin'` escreve em produtos/pedidos/fotos.
- Cliente não consegue se promover a admin (coluna `role` não é editável por ele).
- `SUPABASE_SERVICE_ROLE_KEY` e `MP_ACCESS_TOKEN` nunca vão ao navegador.

## Pendências conhecidas
- Textos de **Trocas** e **Privacidade** são modelos: revisar antes de publicar.
- Cancelar um pedido já pago **não devolve** o estoque automaticamente (ajustar na peça).
- Estoque só é baixado quando o pagamento é aprovado; duas pessoas podem comprar a última unidade ao mesmo tempo (a segunda fica com estoque 0 e a dona resolve manualmente).
- Reembolsos são feitos no painel do Mercado Pago.
- Não há emissão de nota fiscal nem e-mails de status do pedido (próxima fase).

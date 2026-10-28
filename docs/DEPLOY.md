# Guia: colocar a Shine Factory no ar (passo a passo)

Tempo estimado: 1 a 2 horas. Você vai usar 4 serviços, todos com plano gratuito para começar:

| Serviço | Para quê | Custo inicial |
|---|---|---|
| **GitHub** | Guarda o código (já está lá) | grátis |
| **Supabase** | Banco de dados, login dos clientes e fotos das peças | grátis |
| **Mercado Pago** | Receber Pix e cartão | só taxa por venda |
| **Render** | Hospeda o site | grátis (dorme) ou ~US$ 7/mês (sempre ligado) |

Faça **nesta ordem**. Guarde um bloco de notas para copiar as chaves.

---

## PARTE 1 — Supabase (banco de dados)

### 1.1 Criar o projeto
1. Acesse https://supabase.com → **Start your project** → entre com o GitHub.
2. **New project**. Preencha:
   - Name: `shine`
   - Database Password: crie uma senha forte e **guarde** (use o botão "Generate").
   - Region: **South America (São Paulo)**.
3. Clique **Create new project** e espere uns 2 minutos.

### 1.2 Criar as tabelas
1. Menu lateral → **SQL Editor** → **New query**.
2. No GitHub, abra o arquivo `supabase/migrations/0001_init.sql`, clique em **Raw**, copie **tudo**.
3. Cole no editor e clique **Run**. Deve aparecer "Success. No rows returned".
   - Se der erro, copie a mensagem e me mande.
4. Confira em **Table Editor**: devem existir `profiles`, `categories`, `products`, `product_images`, `orders`, `order_items`.
5. Confira em **Storage**: deve existir o bucket `products` (marcado como Public).

### 1.3 Copiar as chaves
Menu **Project Settings (engrenagem) → API** (ou **API Keys**). Copie para o bloco de notas:

| Nome no Supabase | Vai para a variável |
|---|---|
| Project URL (`https://xxxx.supabase.co`) | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (**secreta!**) | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ A `service_role` dá acesso total ao banco. Nunca coloque em print, WhatsApp ou no código. Só no Render.

### 1.4 E-mails de cadastro (importante)
- **Authentication → Providers → Email**: deixe *Confirm email* **ligado** (recomendado).
- O e-mail padrão do Supabase tem limite de poucos e-mails por hora. Para a loja real, configure um SMTP próprio:
  **Authentication → Emails → SMTP Settings** → use o [Resend](https://resend.com) (grátis até 3.000 e-mails/mês) ou Brevo.
- Dica para testes: desligue *Confirm email* só enquanto testa, e ligue de novo depois.

> Voltaremos ao Supabase na Parte 5 para colocar o endereço do site.

---

## PARTE 2 — Mercado Pago (receber Pix e cartão)

1. Tenha uma conta Mercado Pago **verificada** (CPF/CNPJ, selfie) e com **chave Pix cadastrada** (necessária para receber Pix).
2. Acesse https://www.mercadopago.com.br/developers/panel/app → **Criar aplicação**.
   - Nome: `Shine Factory`
   - Produto: **Checkout Pro**
   - Marque que é integração própria / loja online.
3. Entre na aplicação → **Credenciais de teste**: copie o **Access Token** de teste (começa com `TEST-`). Use-o primeiro.
4. Quando tudo estiver funcionando, vá em **Credenciais de produção** (pode pedir para preencher dados do negócio/ativar), copie o **Access Token** de produção (começa com `APP_USR-`) e troque no Render.

Variável: `MP_ACCESS_TOKEN`.

**Como testar sem dinheiro real:** com o token de teste, no checkout use os cartões de teste do Mercado Pago
(https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/your-integrations/test/cards).
Em modo teste, entre no checkout com uma conta de comprador de teste (criada em *Contas de teste*), pois o Mercado Pago não deixa a mesma conta pagar a si mesma.

O aviso de pagamento (webhook) **já é configurado automaticamente** em cada pedido pelo site, desde que `NEXT_PUBLIC_SITE_URL` comece com `https://`.

---

## PARTE 3 — Render (hospedar o site)

### 3.1 Conta e conexão com o GitHub
1. https://render.com → **Get Started** → entre com o GitHub.
2. Quando pedir, autorize o Render a acessar o repositório **SHINE** (pode ser só ele).

### 3.2 Criar o site (jeito fácil — Blueprint)
1. **New + → Blueprint**.
2. Escolha o repositório `SHINE` e a branch (a que contém o código; se estiver na `claude/shine-ecommerce-platform-bxkjzw`, escolha ela ou faça o merge para `main` antes).
3. O Render lê o `render.yaml` e mostra o serviço `shine`. Ele vai pedir os valores das variáveis marcadas como secretas (próximo passo).

### 3.3 Variáveis de ambiente
Preencha cada uma (aba **Environment** do serviço):

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | do Supabase (1.3) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do Supabase (1.3) |
| `SUPABASE_SERVICE_ROLE_KEY` | do Supabase (1.3) |
| `NEXT_PUBLIC_SITE_URL` | endereço do site, **com https, sem barra no final**. No começo: `https://shine.onrender.com` (o Render mostra o endereço real no topo do serviço; se for diferente, use o dele). Depois do domínio próprio: `https://www.seudominio.com.br` |
| `NEXT_PUBLIC_SITE_NAME` | `Shine Factory` |
| `NEXT_PUBLIC_WHATSAPP` | só números com DDI: `5531999999999` |
| `NEXT_PUBLIC_INSTAGRAM` | `atelie.shine` |
| `NEXT_PUBLIC_ADDRESS` | `Rodovia Januário Carneiro, 8780 · sala 913 · Vale do Sereno` |
| `MP_ACCESS_TOKEN` | do Mercado Pago (Parte 2) |
| `ORIGIN_CEP` | CEP de onde ela envia, só números |
| `MELHOR_ENVIO_TOKEN` | (opcional) veja Parte 4 |
| `FREE_SHIPPING_MIN` | (opcional) ex.: `250` para frete grátis acima de R$ 250 |

> ⚠️ Toda variável que começa com `NEXT_PUBLIC_` é "gravada" no site **na hora do build**. Se mudar uma delas depois, faça **Manual Deploy → Deploy latest commit** para valer.

### 3.4 Primeiro deploy
1. Clique **Apply / Create**. O Render roda `npm install --include=dev && npm run build` (3 a 6 min).
2. Acompanhe em **Logs**. Quando aparecer "Your service is live 🎉", abra o endereço `https://….onrender.com`.
3. Deve aparecer a home da Shine. Se aparecer "Quase lá ✦", alguma variável do Supabase está faltando/errada.

### 3.5 Se o build falhar
| Erro no log | Causa / solução |
|---|---|
| `Cannot find module 'tailwindcss'` ou `typescript` | O build precisa das dependências de desenvolvimento. Em **Settings → Build Command** coloque exatamente `npm install --include=dev && npm run build` |
| Tela "Quase lá" depois de subir | Variáveis do Supabase não preenchidas; preencha e faça novo deploy |
| `Invalid supabaseUrl` | `NEXT_PUBLIC_SUPABASE_URL` com erro de digitação (precisa começar com `https://`) |
| Site demora ~1 min para abrir | É o plano grátis "dormindo" (ver 3.6) |

### 3.6 Plano grátis x pago
- **Grátis:** o site "dorme" após ~15 min sem visitas; o primeiro visitante espera 30 a 60 s. Bom para testar e mostrar para ela.
- **Starter (~US$ 7/mês):** sempre ligado. **Recomendado para o lançamento**, porque o cliente que vem do Instagram não espera. Em **Settings → Instance Type** troque para Starter.

---

## PARTE 4 — Frete (Correios)

**Opção simples (já funciona):** sem fazer nada, o site mostra valores *estimados* de PAC e SEDEX por região (tabela em `lib/shipping.ts`). Edite os valores para refletir o que ela costuma pagar.

**Opção com preço real (Melhor Envio):**
1. Crie conta em https://melhorenvio.com.br e preencha os dados/endereço de origem.
2. **Configurações → Gerenciar tokens → Gerar novo token**, marque a permissão `shipping-calculate`. Copie.
3. No Render: `MELHOR_ENVIO_TOKEN` = token, `ORIGIN_CEP` = CEP de origem. Redeploy.
4. Para ver o frete real, o CEP de origem precisa estar certo e o pacote padrão (16×4×20 cm, 120 g por peça) em `lib/shipping.ts` deve combinar com a embalagem dela.

Postagem: depois de uma venda paga, ela compra a etiqueta no Melhor Envio (ou leva aos Correios) e coloca o **código de rastreio** no pedido em `/admin/pedidos`. O cliente vê na área dele.

---

## PARTE 5 — Ligar tudo (depois do site no ar)

### 5.1 Avisar o Supabase qual é o site
Supabase → **Authentication → URL Configuration**:
- **Site URL:** `https://SEU-SITE` (o mesmo de `NEXT_PUBLIC_SITE_URL`)
- **Redirect URLs** → Add URL: `https://SEU-SITE/auth/callback` (e, se for testar no computador, `http://localhost:3000/auth/callback`)
- Salve. Sem isso, o link do e-mail de confirmação e de "esqueci a senha" não funciona.

### 5.2 Criar a conta da administradora
1. No site, clique **Entrar → Criar conta** e cadastre a tia (e-mail dela!). Confirme o e-mail.
2. Supabase → **SQL Editor** → rode (trocando o e-mail):
   ```sql
   update public.profiles set role = 'admin' where email = 'email-da-tia@exemplo.com';
   ```
3. Saia e entre de novo no site: aparece o botão **PAINEL** no topo → `/admin`.

### 5.3 Cadastrar as primeiras peças
`/admin/produtos` → **+ Nova peça**: nome, descrição, preço, estoque, categoria, **fotos** (várias de uma vez; a primeira é a principal). Salvar. Confira a peça em **Joias** no site.

### 5.4 Teste completo (faça antes de divulgar!)
Com o token de **teste** do Mercado Pago:
1. Crie uma conta de cliente (outro e-mail) e coloque uma peça no carrinho.
2. Finalize: CEP → frete → pagar → no Mercado Pago pague com cartão de teste.
3. Volte ao site: o pedido deve aparecer em **Minha conta** como *Pago* e o estoque deve ter diminuído.
4. No painel (`/admin/pedidos`) mude para *Enviado* e ponha um rastreio fictício.
5. Se o pedido ficar "Aguardando pagamento" mesmo após pagar: o webhook não chegou. Veja se `NEXT_PUBLIC_SITE_URL` é `https://` e refaça o deploy; confira **Logs** no Render por chamadas em `/api/webhooks/mercadopago`.

### 5.5 Ir para produção
1. Troque `MP_ACCESS_TOKEN` pelo de **produção** (Render → Environment) e faça deploy.
2. Faça **uma compra real de R$ 1** (peça barata ou cupom manual) e reembolse pelo painel do Mercado Pago.
3. Plano Starter no Render + SMTP configurado no Supabase.

---

## PARTE 6 — Domínio próprio

1. Registre em https://registro.br (ex.: `shinefactory.com.br`, ~R$ 40/ano). **Antes, confirme se `shinefactory.com.br` já é dela**; o Facebook da marca aponta para esse endereço.
2. Render → seu serviço → **Settings → Custom Domains → Add Custom Domain** → digite `www.shinefactory.com.br`.
3. O Render mostra um registro **CNAME** (ex.: `www` → `shine.onrender.com`). No Registro.br: **DNS → Editar zona** e crie esse CNAME. Para o domínio sem `www`, siga a instrução de redirecionamento que o Render mostrar.
4. Aguarde (minutos a algumas horas). O Render emite o HTTPS sozinho.
5. Atualize `NEXT_PUBLIC_SITE_URL` para `https://www.shinefactory.com.br`, redeploy, e atualize a **Site URL** e **Redirect URLs** no Supabase (5.1).
6. No Mercado Pago não precisa mexer: o site já informa os endereços a cada pedido.

---

## PARTE 7 — Dia a dia

- **Nova peça:** `/admin/produtos`.
- **Atualizar estoque/preço:** abra a peça e salve.
- **Pedido novo:** `/admin/pedidos` → status e rastreio.
- **Clientes cadastrados:** `/admin/clientes` (dá para baixar CSV).
- **Mudou o código:** quando subir novidade no GitHub, o Render faz deploy sozinho.
- **Backup:** Supabase → *Database → Backups* (no grátis, exporte de vez em quando via *SQL Editor* ou *Table Editor → Export CSV*).

## Checklist final
- [ ] SQL rodado, bucket `products` existe
- [ ] Variáveis preenchidas no Render, site abre
- [ ] URLs de redirecionamento no Supabase
- [ ] Conta da tia criada e promovida a admin
- [ ] Peças cadastradas com fotos
- [ ] Compra de teste pagou e baixou estoque
- [ ] Token de produção do Mercado Pago
- [ ] Textos de **Trocas** e **Privacidade** revisados
- [ ] Plano Starter no Render e domínio próprio

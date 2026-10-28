# Shine — Mapeamento geral do projeto

Loja online de bijuterias (Instagram: Shine Factory) com painel administrativo para a dona gerenciar produtos, clientes e pedidos.

> **Pendente:** análise do Instagram. O ambiente de desenvolvimento não conseguiu acessar `instagram.com`. Itens marcados com 🔎 devem ser confirmados olhando o perfil (ou me passando prints/descrição): paleta de cores, logo, categorias de peças, faixa de preço, tom de comunicação, se já vende por WhatsApp/Direct.

---

## 1. Objetivo e perfis de usuário

| Perfil | O que faz |
|---|---|
| **Visitante** | Navega no catálogo, vê fotos e preços, busca e filtra. |
| **Cliente** | Tudo do visitante + cadastro, login, favoritos, carrinho, histórico de pedidos, edição dos próprios dados. |
| **Administradora (a tia)** | Login protegido; cadastra/edita/oculta peças; vê clientes cadastrados; gerencia pedidos e estoque; vê relatórios simples. |

## 2. Funcionalidades

### 2.1 Loja (pública)
- Home com destaques, lançamentos e promoções 🔎 (identidade visual vinda do Instagram)
- Catálogo com filtros (categoria, faixa de preço, material/banho, cor) e busca
- Página da peça: galeria com **várias fotos** (zoom, swipe no celular), preço, descrição, material, disponibilidade
- Carrinho e checkout
- Botão "Falar no WhatsApp" em cada peça
- Páginas: Sobre, Contato, Trocas e devoluções, Política de privacidade

### 2.2 Conta do cliente
- Cadastro (nome, e-mail, telefone/WhatsApp, senha; CPF e endereço só no checkout)
- Login, recuperar senha por e-mail, confirmar e-mail
- Meus pedidos, endereços, favoritos, editar/excluir conta (LGPD)

### 2.3 Painel da administradora
- Login próprio com senha forte (e 2FA opcional depois)
- **Produtos:** criar/editar/ocultar/excluir; nome, descrição, categoria, **valor**, valor promocional, estoque, SKU opcional, **upload de múltiplas fotos** com reordenação e escolha da foto principal
- **Categorias** (brincos, colares, pulseiras, anéis, conjuntos… 🔎)
- **Clientes:** lista de cadastrados, data de cadastro, pedidos de cada um, busca/exportação CSV
- **Pedidos:** status (aguardando pagamento → pago → separando → enviado → entregue / cancelado), código de rastreio
- **Dashboard:** vendas do período, mais vendidos, novos clientes, estoque baixo
- Configurações: dados da loja, frete, WhatsApp, banners da home

## 3. Modelo de dados (resumo)

```
users          id, nome, email, telefone, senha_hash, role (cliente|admin), criado_em
addresses      id, user_id, cep, rua, numero, complemento, bairro, cidade, uf
categories     id, nome, slug
products       id, nome, slug, descricao, preco, preco_promocional, estoque,
               category_id, material, ativo, criado_em
product_images id, product_id, url, ordem, principal
favorites      user_id, product_id
carts / cart_items
orders         id, user_id, status, subtotal, frete, total, pagamento_id, rastreio, criado_em
order_items    id, order_id, product_id, nome_snapshot, preco_snapshot, quantidade
```
Observação: o pedido guarda **cópia** do nome e preço no momento da compra, para o histórico não mudar se a peça for editada.

## 4. Tecnologia recomendada

Prioridades: **barato de manter, fácil de a tia usar, rápido no celular** (a maioria virá do Instagram, via celular).

| Camada | Escolha | Motivo |
|---|---|---|
| Front + back | **Next.js (TypeScript) + Tailwind** | Um projeto só, SEO bom, ótimo no mobile, hospedagem simples |
| Banco + login + arquivos | **Supabase** (Postgres + Auth + Storage) | Já traz cadastro/login/recuperar senha, upload de várias fotos e plano gratuito para começar |
| Hospedagem | **Vercel** | Deploy automático a cada push, plano gratuito inicial |
| Pagamento | **Mercado Pago** (Pix + cartão) ou Pagar.me | Padrão no Brasil, Pix é o preferido do público |
| Frete | **Melhor Envio** (API) ou tabela fixa por região | Cálculo por CEP, etiquetas dos Correios/transportadoras |
| E-mail | Resend | Confirmação de cadastro e avisos de pedido |
| Imagens | Compressão/redimensionamento automático no upload (WebP) | Fotos de celular são pesadas; loja precisa carregar rápido |

Alternativa mais simples (se quiser lançar em dias): **Nuvemshop/Shopify** prontos. Descartei porque você quer um sistema próprio, mas vale a tia saber que existe.

## 5. Fases de entrega

**Fase 0 — Descoberta (agora):** olhar o Instagram 🔎, definir categorias, identidade visual, como ela vende hoje, como envia, como recebe.

**Fase 1 — MVP (catálogo + admin + checkout):**
1. Setup do projeto, banco e deploy
2. Cadastro/login de cliente e login de admin
3. Admin: CRUD de produtos com múltiplas fotos e preço
4. Loja pública: home, catálogo, página da peça
5. Pedido via **WhatsApp** (carrinho gera mensagem pronta) — vende sem depender de gateway de pagamento
6. Admin: lista de clientes cadastrados

**Fase 2 — Venda completa:** checkout com Pix/cartão, frete por CEP, pedidos e status, e-mails automáticos, controle de estoque.

**Fase 3 — Crescimento:** dashboard e relatórios, cupons, favoritos, avaliações, integração com Instagram (feed na home), SEO, Google/Meta Pixel, recuperação de carrinho.

## 6. Segurança e legal

- Senhas com hash (bcrypt/argon2 — Supabase Auth cuida disso); nunca guardar senha em texto
- Rota `/admin` protegida por papel (role) no servidor, não só no front
- Upload: validar tipo e tamanho da imagem
- **LGPD:** política de privacidade, consentimento no cadastro, permitir excluir a conta
- Cartão nunca passa pelo nosso servidor (checkout do gateway)
- Backups automáticos do banco
- CDC: página de trocas/devoluções (direito de arrependimento de 7 dias em compra online)

## 7. Custos estimados (início)

Domínio `.com.br` (~R$ 40/ano) + hospedagem/banco no plano gratuito. Custos variáveis: taxas do gateway (~1% Pix a ~5% cartão) e eventual upgrade do Supabase/Vercel quando o volume crescer.

## 8. Decisões já tomadas e pendências

**Definido:**
- Estoque por **quantidade** (cada peça tem N unidades; baixa automática a cada venda paga)
- Envio pelos **Correios** (frete por CEP via Melhor Envio ou API dos Correios; rastreio no pedido)
- Pagamento por **Pix e cartão** desde o início (Mercado Pago), então o checkout completo entra na Fase 1
- Identidade visual (cores e logo) **já definida** pela Shine — falta receber os arquivos (logo em PNG/SVG e códigos das cores)
- **Sem domínio ainda** — registrar `.com.br` (ex.: shine...com.br) antes do lançamento; no desenvolvimento usamos o endereço gratuito da Vercel

**Pendente (a alinhar com ela):**
1. Nome do domínio desejado
2. Arquivos do logo e paleta de cores
3. Atacado/revenda? Frete grátis acima de X? Compra como convidado ou só com cadastro?
4. Categorias iniciais e quantidade de peças no catálogo de lançamento; quem fotografa
5. CNPJ/MEI para abrir conta no Mercado Pago e emitir etiquetas
6. Política de trocas e devoluções

## 9. Estrutura sugerida do repositório

```
shine/
├─ docs/                 # este mapeamento, decisões
├─ src/
│  ├─ app/               # rotas Next.js: (loja), /conta, /admin
│  ├─ components/
│  ├─ lib/               # supabase, pagamentos, frete
│  └─ styles/
├─ supabase/migrations/  # SQL versionado
└─ README.md
```

## 10. Pesquisa da marca (Instagram + web)

**Confirmado nos prints do Instagram (@atelie.shine):**
- Nome: Shine Factory · ~2,8 mil seguidores · bio: "Perfil Reserva, Sigam"
- Endereço: Rodovia Januário Carneiro, 8780, sala 913 (Vale do Sereno)
- Link da bio: `msha.ke/shinefactory` (catálogo atual, fora do site próprio) · destaques: Black Friday, Catálogo, Info
- Logo: círculo cinza-bege (`#7f756b` medido no print) com "SHINE" em serifa espaçada, brilho sobre o "I" e "factory" em cursiva
- Estilo visual: tons neutros (creme, bege, marrom-café), peças douradas e pérolas, fotos de look no corpo (colares em camadas, maxi correntes, brincos estrela, pulseiras, chokers), showroom bege com a frase **"More than accessories, it's a lifestyle"**

**Encontrado na web (a confirmar com a dona):**
- Perfil @_shinefactory no Instagram com o mesmo endereço, categoria "bijus e semijoias"
- Página no Facebook "Shine Factory — Acessórios femininos" apontando para `shinefactory.com.br` (o domínio pode já ser dela)
- Existem várias outras empresas "Shine Factory" (estética automotiva, etc.) que **não** são a loja

**Dúvidas:** @atelie.shine e @_shinefactory são da mesma loja? Vale do Sereno fica em Nova Lima (região de BH): confirmar como ela quer apresentar a cidade. O domínio shinefactory.com.br é dela?

**Aplicado no site:** paleta (taupe/creme/areia/champagne), logo em texto, fontes (Cormorant Garamond + Jost + Allura), frase-assinatura, bloco "Ateliê" com endereço e categorias iniciais (colares, brincos, pulseiras, anéis, pérolas, conjuntos).

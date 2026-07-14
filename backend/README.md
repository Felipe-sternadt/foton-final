# Foton Leads API

Backend em Node.js para receber formularios do site, validar e salvar leads no MySQL, notificar a unidade correta pelo Resend e, opcionalmente, enviar ao CRM.

## Fluxo

```text
Frontend hospedado
  -> POST /api/leads
Backend Node.js
  -> valida unidade, consentimento e chave idempotente
  -> salva uma unica vez no MySQL
  -> envia um unico e-mail idempotente pelo Resend
  -> envia ao CRM quando CRM_ENABLED=true
```

## Configuracao local

Execute os comandos a partir da raiz do projeto.

1. Instale as dependencias:

```bash
npm install
```

2. Crie o banco usando o arquivo `sql/schema.sql`.

Se o banco ja existia antes da integracao com o Resend, execute uma vez `sql/migrations/001_resend_email.sql` em vez de recriar a tabela.

Se voce tiver o comando `mysql` instalado:

```bash
mysql -u root -p < sql/schema.sql
```

Se estiver usando um painel como phpMyAdmin, abra o banco MySQL, va em SQL, cole o conteudo de `sql/schema.sql` e execute.

3. Copie o arquivo de ambiente da raiz:

```bash
cp .env.example .env
```

4. Ajuste as variaveis do `.env`, principalmente:

```text
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
CORS_ORIGINS
RESEND_ENABLED
RESEND_API_KEY
RESEND_FROM
```

5. Rode o site e a API no mesmo processo:

```bash
npm start
```

6. Teste:

```bash
curl http://localhost:3000/health
```

## Comandos uteis para teste

Checar conexao, tabela e colunas:

```bash
npm run db:check
```

Aplicar de forma segura todas as migracoes pendentes, sem apagar leads:

```bash
npm run db:migrate
```

Enviar um lead de teste para a API:

```bash
ALLOW_TEST_LEAD=true npm run test:lead
```

No PowerShell, use `$env:ALLOW_TEST_LEAD='true'; npm.cmd run test:lead`. Esse bloqueio evita disparos acidentais para destinatarios reais.

Listar os ultimos 20 leads salvos:

```bash
npm run db:leads
```

Para o `test:lead`, a aplicacao precisa estar rodando em outro terminal com `npm start`.

## Endpoint de leads

`POST /api/leads`

O header `Idempotency-Key` e obrigatorio e deve conter um UUID v4. O frontend gera um UUID por envio e o reutiliza em qualquer retry. A restricao unica do MySQL impede leads repetidos e o mesmo identificador gera a chave idempotente enviada ao Resend.

Exemplo:

```json
{
  "formType": "quote",
  "name": "Cliente Teste",
  "email": "cliente@email.com",
  "phone": "48999999999",
  "dealershipUnit": "Palhoca",
  "state": "SC",
  "city": "Florianopolis",
  "model": "Aumark S 315 MT",
  "department": "Vendas",
  "message": "Tenho interesse em uma cotacao.",
  "pageUrl": "https://seudominio.com.br/",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "foton-caminhoes",
  "lgpdConsent": true
}
```

Tipos aceitos em `formType`:

- `quote`
- `test_drive`
- `service`
- `parts`
- `contact`

Unidades e destinatarios autorizados:

- `Palhoca SC` ou `Palhoça SC` -> `gerencia.vendas1@somevalfoton.com.br`
- `Joinville SC` -> `gerencia.vendas2@somevalfoton.com.br`
- `Blumenau SC` -> `gerencia.vendas3@somevalfoton.com.br`

Qualquer outra unidade e rejeitada. O endpoint nunca aceita um endereco de destinatario vindo do navegador.

## Configuracao do Resend

1. No painel do Resend, adicione e verifique o dominio `somevalfoton.com.br` com os registros DNS solicitados.
2. Crie uma API key exclusiva de producao, com permissao apenas de envio e restrita ao dominio quando essa opcao estiver disponivel.
3. Guarde a chave no gerenciador de segredos da hospedagem. Para desenvolvimento local, use somente o arquivo `.env` na raiz, que esta ignorado pelo Git.
4. Configure:

```text
RESEND_ENABLED=true
RESEND_API_KEY=re_sua_chave_real
RESEND_FROM=Leads Someval Foton <leads@somevalfoton.com.br>
RESEND_RECIPIENT_PALHOCA=gerencia.vendas1@somevalfoton.com.br
RESEND_RECIPIENT_JOINVILLE=gerencia.vendas2@somevalfoton.com.br
RESEND_RECIPIENT_BLUMENAU=gerencia.vendas3@somevalfoton.com.br
```

Nunca coloque `RESEND_API_KEY` em HTML, JavaScript do navegador, commit, print ou mensagem. Se uma chave for exposta, revogue-a imediatamente e gere outra.

O envio usa a API HTTPS do Resend diretamente pelo backend. O header `Idempotency-Key` usa `lead-notification/<public_id>`, impedindo um segundo e-mail para o mesmo lead durante retries e requisicoes simultaneas.

## Protecoes contra duplicidade e abuso

- Bloqueio de multiplos submits simultaneos no formulario.
- UUID v4 persistido durante retries do navegador.
- Indice unico `request_id` no MySQL.
- Chave idempotente no Resend.
- Limite especifico de 8 envios por IP a cada 15 minutos. Paginas, imagens, scripts e demais arquivos publicos nao entram nessa contagem.
- Corpo JSON limitado a 80 KB, CORS por allowlist, Helmet e validacao Zod.
- Consentimento explicito obrigatorio antes do envio.
- Valores do lead escapados antes de entrar no HTML do e-mail.
- Nenhuma copia completa redundante dos dados pessoais em `raw_payload`.
- IP e `User-Agent` nao sao persistidos no cadastro do lead.

## Auditoria automatizada

Execute a regressao critica completa a partir da raiz:

```bash
npm run audit:critical
```

Ela valida testes unitarios, banco, arquivos e rotas publicas, caminhos protegidos, headers, CORS, payloads invalidos, os quatro formularios, idempotencia, rate limit e todas as paginas em Chrome desktop/mobile. Os leads sinteticos sao removidos automaticamente e Resend/CRM ficam desativados durante a auditoria de fluxo.

## Producao

No deploy, use:

```bash
npm start
```

Configure `CORS_ORIGINS` com o dominio real do site, por exemplo:

```text
CORS_ORIGINS=https://www.seudominio.com.br,https://seudominio.com.br
```

Nunca coloque dados do CRM, senha do banco ou tokens no frontend. Essas informacoes ficam somente no `.env` do backend.

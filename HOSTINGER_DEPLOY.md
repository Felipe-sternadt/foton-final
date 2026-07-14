# Deploy seguro na Hostinger

## Metodo recomendado

Use **Sites > Adicionar site > Aplicacao Web Node.js > Importar repositorio GitHub**. Mantenha o repositorio privado e conecte a branch de producao somente depois dos testes.

Configuracao da aplicacao:

```text
Framework: Express.js
Node.js: 22.x ou 24.x
Entry file: backend/src/server.js
Start command: npm start
Output directory: vazio
Build command: vazio/nenhum
```

O `package.json` e o `package-lock.json` ficam na raiz para a Hostinger detectar e instalar as dependencias automaticamente.

## Variaveis de ambiente

No assistente de deploy, abra **Environment variables** e adicione manualmente as variaveis de `.env.example`. Em producao use:

```text
NODE_ENV=production
PORT=(nao definir se a Hostinger fornecer automaticamente)
CORS_ORIGINS=https://seudominio.com.br,https://www.seudominio.com.br
DB_HOST=(fornecido pelo MySQL da Hostinger)
DB_PORT=3306
DB_USER=(fornecido pela Hostinger)
DB_PASSWORD=(segredo)
DB_NAME=(fornecido pela Hostinger)
RESEND_ENABLED=true
RESEND_API_KEY=(segredo re_...)
RESEND_FROM=Leads Someval Foton <leads@somevalfoton.com.br>
RESEND_RECIPIENT_PALHOCA=gerencia.vendas1@somevalfoton.com.br
RESEND_RECIPIENT_JOINVILLE=gerencia.vendas2@somevalfoton.com.br
RESEND_RECIPIENT_BLUMENAU=gerencia.vendas3@somevalfoton.com.br
CRM_ENABLED=false
```

Nao envie o arquivo `.env` no ZIP e nao o adicione ao GitHub. As variaveis cadastradas no hPanel ficam fora do repositorio. Depois de editar uma variavel, use **Settings & Redeploy**.

## Banco de dados

- Banco novo: execute `backend/sql/schema.sql` no phpMyAdmin.
- Banco ja criado pela versao anterior: execute uma vez `backend/sql/migrations/001_resend_email.sql`.
- Alternativamente, com acesso ao runtime da aplicacao, execute `npm run db:migrate`; o script adiciona somente estruturas ausentes e pode ser executado novamente com seguranca.
- Crie um usuario exclusivo para esta aplicacao, com acesso somente ao banco de leads.
- Nao use o usuario root do MySQL.

## Antes de apontar o dominio

1. Teste `/health` e confirme `database: connected`.
2. Envie um formulario de teste para cada unidade.
3. Confirme um unico e-mail por lead no painel do Resend.
4. Confira se Palhoca, Joinville e Blumenau receberam apenas seus proprios leads.
5. Confirme que `/.env`, `/backend`, `/package.json` e `/backend/sql/schema.sql` retornam 404.
6. Revogue qualquer chave que tenha sido compartilhada em mensagem, print ou commit.
7. Somente depois conecte o dominio de producao.

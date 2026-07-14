# Someval Foton

Aplicacao web da Someval Foton com frontend em HTML, CSS e JavaScript e backend Node.js/Express. O mesmo processo serve o site, recebe os formularios, persiste leads no MySQL e envia notificacoes pela API do Resend.

## Estrutura

```text
.
+-- package.json
+-- package-lock.json
+-- .env.example
+-- index.html
+-- pages/
|   +-- novos.html
|   +-- servicos.html
|   +-- concessionarias.html
|   +-- test-drive.html
+-- models/
|   +-- aumark-s-315.html
|   +-- aumark-s-715.html
|   +-- aumark-s-916.html
|   +-- aumark-s-1217.html
|   +-- auman-d-1722.html
|   +-- tunland.html
|   +-- tunland-v7.html
|   +-- tunland-v9.html
|   +-- ewonder.html
|   +-- etoano-pro.html
|   +-- eview-grand.html
|   +-- eview-connect.html
|   +-- eaumark.html
+-- backend/
|   +-- src/
|   |   +-- server.js
|   |   +-- routes/
|   |   +-- services/
|   |   +-- repositories/
|   |   +-- validators/
|   +-- sql/
|   +-- test/
+-- assets/
    +-- css/
    |   +-- style.css
    +-- js/
    |   +-- script.js
    +-- images/
    |   +-- imagens dos modelos, logos e secoes
    +-- fichas/
    |   +-- fichas tecnicas em PDF
    +-- videos/
        +-- background.mp4
```

## Paginas Principais

- `index.html`: home com hero, modelos 0 km, motores Cummins, concessionarias e contato.
- `pages/novos.html`: catalogo filtravel dos modelos.
- `pages/servicos.html`: pagina de agendamento de servicos, revisao e pos-venda.
- `pages/concessionarias.html`: unidades de Palhoca, Joinville e Blumenau.
- `pages/test-drive.html`: formulario de agendamento de test drive.
- `models/*.html`: paginas de modelo com galerias, dados tecnicos, fichas tecnicas e chamadas para cotacao/test drive.

## Linha Atual de Modelos

### Combustao

- Aumark S 315
- Aumark S 715
- Aumark S 916
- Aumark S 1217
- Auman D 1722

### Eletricos

- eWonder
- eView Connect
- eView Grand: Teto Baixo 6,8 m3 e Teto Medio 7,9 m3
- eToano Pro: PRO M 10,4 m3 e PRO H 12,2 m3
- eAumark: 6T, 9T, 9T L, 12T e 12T L

### Hibridos

- Tunland V7 HEV
- Tunland V9 HEV

## Organizacao de Assets

- `assets/css/style.css`: estilos globais do site.
- `assets/js/script.js`: interacoes globais, sliders, filtros, mapas e formularios.
- `assets/images`: imagens em `.webp`, `.png`, `.jpg` e `.jpeg`.
- `assets/fichas`: arquivos PDF das fichas tecnicas.
- `assets/videos`: video de fundo da home.

## Performance

- Os scripts locais usam `defer` para nao bloquear a renderizacao inicial.
- Dependencias externas sem uso foram removidas.
- Os mapas da pagina de concessionarias carregam automaticamente de forma escalonada, evitando que todos os iframes do Google Maps sejam criados ao mesmo tempo no celular.

## Como Rodar Localmente

1. Instale as dependencias na raiz:

```bash
npm install
```

2. Copie `.env.example` para `.env` e informe somente credenciais locais.

3. Inicie a aplicacao completa:

```bash
npm start
```

4. Acesse `http://localhost:3000`.

O arquivo `.env` real e ignorado pelo Git. Nunca use `git add -f .env` e nunca coloque chaves em HTML ou JavaScript do navegador.

## Testes

```bash
npm test
```

## Publicacao na Hostinger

O projeto esta preparado para uma **Aplicacao Web Node.js** nos planos Business ou Cloud da Hostinger:

- Framework: Express.js
- Versao do Node.js: 22.x ou 24.x
- Arquivo de entrada: `backend/src/server.js`
- Comando de inicio: `npm start`
- Build: nao necessario
- Variaveis secretas: adicionar no hPanel, nunca no GitHub

Consulte `HOSTINGER_DEPLOY.md` para o checklist completo.

Repositorio:

```text
https://github.com/Felipe-sternadt/foton
```

## Padrao Para Novas Paginas

Ao criar uma nova pagina, use os arquivos globais assim:

```html
<link rel="stylesheet" href="assets/css/style.css">
<script src="assets/js/analytics.js" defer></script>
<script src="assets/js/script.js" defer></script>
```

Em paginas dentro de `pages/` ou `models/`, use:

```html
<link rel="stylesheet" href="../assets/css/style.css">
<script src="../assets/js/analytics.js" defer></script>
<script src="../assets/js/script.js" defer></script>
```

Para novas imagens e fichas:

- Imagens: `assets/images`
- PDFs: `assets/fichas`
- Videos: `assets/videos`

## Fichas Tecnicas Pendentes

Estas paginas ja possuem botao de ficha tecnica preparado, mas os PDFs ainda precisam ser adicionados em `assets/fichas`:

- `models/eaumark.html`: `assets/fichas/eaumark.pdf`
- `models/etoano-pro.html`: `assets/fichas/etoano-pro.pdf`
- `models/eview-grand.html`: `assets/fichas/eview-grand.pdf`
- `models/eview-connect.html`: `assets/fichas/eview-connect.pdf`

## Autor

Felipe Sternadt










































































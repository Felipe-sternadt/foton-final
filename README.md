# Someval Foton

Site institucional estatico da Someval Foton, desenvolvido em HTML, CSS e JavaScript vanilla. O projeto esta preparado para publicacao direta no GitHub Pages, com as paginas HTML na raiz e os arquivos de suporte organizados dentro de `assets`.

## Estrutura

```text
.
+-- index.html
+-- pages/
|   +-- novos.html
|   +-- concessionarias.html
|   +-- test-drive.html
+-- models/
|   +-- aumark-s-315.html
|   +-- aumark-s-715.html
|   +-- aumark-s-916.html
|   +-- aumark-s-1217.html
|   +-- auman-d-1722.html
|   +-- iblue.html
|   +-- tunland.html
|   +-- ewonder.html
|   +-- etoano-pro.html
|   +-- eview-grand.html
|   +-- eview-connect.html
|   +-- eaumark.html
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
- `pages/concessionarias.html`: unidades de Palhoca, Joinville e Blumenau.
- `pages/test-drive.html`: formulario de agendamento de test drive.
- `models/*.html`: paginas de modelo com galerias, dados tecnicos, fichas tecnicas e chamadas para cotacao/test drive.

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

Por ser um site estatico, basta abrir `index.html` no navegador. Para simular melhor o GitHub Pages, use um servidor local:

```bash
npx serve .
```

## Publicacao

O projeto esta preparado para GitHub Pages usando a branch `main`, com `index.html` na raiz.

Repositorio:

```text
https://github.com/Felipe-sternadt/foton
```

## Padrao Para Novas Paginas

Ao criar uma nova pagina, use os arquivos globais assim:

```html
<link rel="stylesheet" href="assets/css/style.css">
<script src="assets/js/script.js" defer></script>
```

Em paginas dentro de `pages/` ou `models/`, use:

```html
<link rel="stylesheet" href="../assets/css/style.css">
<script src="../assets/js/script.js" defer></script>
```

Para novas imagens e fichas:

- Imagens: `assets/images`
- PDFs: `assets/fichas`
- Videos: `assets/videos`

## Fichas Tecnicas Pendentes

Estas paginas ja possuem botao de ficha tecnica preparado, mas os PDFs ainda precisam ser adicionados em `assets/fichas`:

- `models/iblue.html`: `assets/fichas/iblue.pdf`
- `models/eaumark.html`: `assets/fichas/eaumark.pdf`
- `models/etoano-pro.html`: `assets/fichas/etoano-pro.pdf`
- `models/eview-grand.html`: `assets/fichas/eview-grand.pdf`
- `models/eview-connect.html`: `assets/fichas/eview-connect.pdf`

## Autor

Felipe Sternadt










































































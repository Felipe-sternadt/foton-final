# Auditoria critica do site — 14/07/2026

## Resultado

O fluxo local foi aprovado apos as correcoes descritas abaixo. A auditoria automatizada nao envia e-mails reais e remove os registros sinteticos ao terminar.

## Escopo validado

- 21 paginas em Chrome, desktop e mobile, mais o modal de consentimento mobile.
- 152 arquivos publicos e 718 referencias locais.
- Cotacao, servicos, pecas e test drive, incluindo gravacao no MySQL.
- Idempotencia no navegador, banco, Resend e CRM.
- Rate limit apenas em `POST /api/leads`.
- CORS em desenvolvimento e producao.
- CSP, Helmet, protecao contra frames, MIME sniffing e vazamento de tecnologia.
- Bloqueio publico de `.env`, Git, backend, SQL, `package.json` e lockfile.
- JSON malformado, corpo acima de 80 KB, unidade invalida e campos ausentes.
- Consentimento de analytics, ausencia de PII nos eventos e sanitizacao de URLs.
- Dependencias de producao consultadas no registro do npm: 0 vulnerabilidades conhecidas.

## Correcoes realizadas

- Removido o rate limit global que bloqueava paginas e assets.
- Campos dos formularios receberam nomes estaveis, rotulos associados e autocomplete.
- Payload do frontend passou a priorizar `name`, mantendo fallback por rotulo.
- Criado fallback de estados e entrada manual de cidade quando o IBGE estiver indisponivel.
- Corrigida a data minima do test drive para respeitar o fuso local.
- Adicionadas validacoes de backend especificas para cada formulario.
- Rejeitados telefone, documento, data e horario invalidos.
- Corrigidos overflow mobile, menu lateral fora da tela e consentimento em telas estreitas.
- Menu lateral recebeu `inert`, `aria-hidden`, foco e fechamento por Escape.
- Miniaturas de galeria receberam nome acessivel e operacao por teclado.
- CRM recebeu timeout, captura de indisponibilidade e limite de resposta armazenada.
- Erros de JSON e tamanho agora retornam 400/413 sem revelar detalhes internos.
- Listagem administrativa passou a mascarar nome, e-mail e telefone.
- Envio manual de lead de teste passou a exigir autorizacao explicita.
- MySQL ganhou opcao de TLS para bancos remotos.

## Validacoes aprovadas

```text
npm run check          -> 10 testes aprovados
npm run audit:http     -> 152 arquivos, 75 recargas e protecoes aprovadas
npm run audit:flow     -> 9 cenarios de API aprovados
npm run audit:browser  -> 43 cenarios renderizados, 0 falhas
npm audit --omit=dev   -> 0 vulnerabilidades
```

## Pendencias externas antes da publicacao

1. Configurar e verificar o dominio no Resend; depois cadastrar `RESEND_API_KEY`, `RESEND_FROM` e ativar `RESEND_ENABLED=true` somente na hospedagem.
2. Informar o ID `G-...` da nova propriedade GA4. Sem ele, a camada de analytics existe, mas a tag Google nao e carregada.
3. Definir com o responsavel pela LGPD o prazo de retencao dos leads e o procedimento de exclusao. Nenhuma exclusao automatica foi criada sem essa decisao de negocio.
4. Se o MySQL estiver em outro servidor, ativar `DB_SSL=true` e manter `DB_SSL_REJECT_UNAUTHORIZED=true`.
5. A politica CSP ainda permite scripts e estilos inline por compatibilidade com handlers legados do HTML. Nao foi encontrada entrada de usuario renderizada nessas paginas, mas remover os handlers inline continua sendo uma melhoria de defesa em profundidade.

## Comando de regressao

```bash
npm run audit:critical
```

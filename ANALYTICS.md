# Google Analytics 4

O rastreamento do site fica centralizado em `assets/js/analytics.js` e somente inicia depois do consentimento para cookies de medicao.

## Ativacao

Informe o ID do fluxo Web (`G-...`) por uma destas formas:

1. Defina `PROJECT_MEASUREMENT_ID` no inicio de `assets/js/analytics.js`; ou
2. Injete antes do arquivo de analytics:

```html
<script>
window.FOTON_ANALYTICS_CONFIG = {
    measurementId: 'G-SEU_ID_AQUI',
    debug: false
};
</script>
```

Sem um ID valido, nenhum script do Google e baixado. Os eventos ficam disponiveis no `dataLayer` para uma instalacao externa do Google Tag Manager.

## Eventos implementados

| Evento | Quando ocorre |
| --- | --- |
| `page_view` | Visualizacao consentida, com URL sanitizada |
| `page_engaged` | 10 segundos visiveis ou interacao com 25% de rolagem |
| `page_not_engaged` | Saida sem atingir os criterios de engajamento |
| `scroll_depth` | Marcos de 25%, 50%, 75% e 90% |
| `section_view` | Secao com pelo menos 35% visivel |
| `section_engagement` | Saida com tempo visivel e classificacao `engaged`/`not_engaged` |
| `cta_click` | Links internos, ancoras e botoes |
| `contact_click` | Telefone, e-mail e WhatsApp |
| `social_click` | Redes sociais |
| `outbound_click` | Link para outro dominio |
| `file_download` | Download de arquivo reconhecido |
| `content_interaction` | Acordeoes, abas e filtros |
| `filter_change` | Alteracao dos filtros de modelos e combustivel |
| `lead_form_start` | Primeira interacao com cada formulario |
| `lead_form_submit_attempt` | Tentativa de envio |
| `lead_form_validation_error` | Campo invalido, sem enviar seu valor |
| `lead_form_submit_error` | Falha de rede, HTTP ou rejeicao da API |
| `lead_form_abandon` | Saida apos iniciar e antes do sucesso |
| `generate_lead` | Somente apos a API confirmar o cadastro |

## Dimensoes personalizadas sugeridas no GA4

Cadastre, conforme os relatorios desejados: `form_name`, `section_name`, `engagement_status`, `element_label`, `destination_type`, `page_category`, `error_type`, `field_name` e `content_id`. Cadastre `engagement_time_msec`, `completed_field_count`, `form_elapsed_msec`, `max_scroll_percent` e `percent_scrolled` como metricas personalizadas quando necessario.

Marque `generate_lead` como evento principal (key event). Nao crie outro rastreamento manual para os mesmos eventos sem revisar duplicidade.

## Privacidade

- Nome, e-mail, telefone, CPF/CNPJ, mensagem e valores dos campos nunca sao enviados.
- URLs de pagina e referencia removem parametros desconhecidos; apenas parametros de campanha com formato seguro podem permanecer.
- Google Signals e personalizacao de anuncios ficam desabilitados.
- Os quatro estados do Consent Mode v2 iniciam negados. Apenas `analytics_storage` e concedido ao aceitar.
- Ao recusar, o site continua acessivel e a tag do Google nao e carregada.

Valide a publicacao no Realtime e no DebugView do GA4 e use o Tag Assistant para verificar consentimento, duplicidade e parametros.

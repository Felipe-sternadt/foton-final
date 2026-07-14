/* Foton GA4 - rastreamento centralizado, condicionado ao consentimento e sem PII. */
(() => {
    'use strict';

    if (window.__fotonAnalyticsLoaded) return;
    window.__fotonAnalyticsLoaded = true;

    const dataLayer = window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
        dataLayer.push(arguments);
    };

    // O estado padrao precisa existir antes de qualquer config/evento do Google.
    window.gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500
    });
    window.gtag('set', 'ads_data_redaction', true);
    window.gtag('set', 'url_passthrough', false);

    // Opcional: defina aqui o ID G-... quando ele nao for injetado pelo ambiente.
    const PROJECT_MEASUREMENT_ID = '';
    const config = window.FOTON_ANALYTICS_CONFIG || {};
    const measurementId = String(
        config.measurementId
        || window.FOTON_GA_MEASUREMENT_ID
        || document.querySelector('meta[name="google-analytics-id"]')?.content
        || PROJECT_MEASUREMENT_ID
        || ''
    ).trim();
    const validMeasurementId = /^G-[A-Z0-9]+$/i.test(measurementId) ? measurementId : '';
    const debugMode = Boolean(config.debug || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
    const ENGAGED_MS = 10000;
    const SECTION_ENGAGED_MS = 5000;
    const SAFE_CAMPAIGN_KEYS = new Set([
        'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'
    ]);

    let consentGranted = false;
    let tagConfigured = false;
    let trackersStarted = false;
    let pageVisibleSince = document.visibilityState === 'visible' ? performance.now() : null;
    let pageVisibleMs = 0;
    let pageInteracted = false;
    let pageEngagedSent = false;
    let maxScrollPercent = 0;
    let finalized = false;
    let sectionObserver = null;

    const sectionStates = new Map();
    const formStates = new Map();
    const scrollMilestones = new Set();

    const normalize = (value, fallback = 'unknown', maxLength = 80) => {
        const cleaned = String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9_-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, maxLength);
        return cleaned || fallback;
    };

    const safeText = (value, fallback = 'unknown', maxLength = 80) => {
        const text = String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
        if (!text || /@/.test(text) || /\d{7,}/.test(text.replace(/\D/g, ''))) return fallback;
        return text;
    };

    const safeLocation = (value = location.href, keepCampaign = true) => {
        try {
            const source = new URL(value, location.origin);
            const clean = new URL(source.origin + source.pathname);
            if (keepCampaign && source.origin === location.origin) {
                source.searchParams.forEach((rawValue, key) => {
                    if (!SAFE_CAMPAIGN_KEYS.has(key)) return;
                    const safeValue = rawValue.trim().slice(0, 120);
                    if (/^[a-zA-Z0-9._~-]+$/.test(safeValue)) clean.searchParams.set(key, safeValue);
                });
            }
            return clean.href;
        } catch (error) {
            return location.origin + location.pathname;
        }
    };

    const pageContext = () => {
        const parts = location.pathname.split('/').filter(Boolean);
        const file = (parts.at(-1) || 'index').replace(/\.html$/i, '');
        const category = parts.includes('models') ? 'vehicle' : parts.includes('pages') ? 'institutional' : 'home';
        return {
            page_name: normalize(file, 'home'),
            page_category: category
        };
    };

    const cleanParams = (params = {}) => Object.fromEntries(
        Object.entries({ ...pageContext(), ...params }).filter(([, value]) => (
            value !== undefined && value !== null && value !== ''
        ))
    );

    const track = (eventName, params = {}) => {
        if (!consentGranted || finalized) return false;
        const safeEvent = normalize(eventName, 'site_interaction', 40);
        const payload = cleanParams(params);

        if (validMeasurementId) {
            window.gtag('event', safeEvent, payload);
        } else {
            // Mantem compatibilidade com um GTM injetado externamente.
            dataLayer.push({ event: safeEvent, ...payload });
        }

        if (debugMode) console.debug('[Foton Analytics]', safeEvent, payload);
        return true;
    };

    const sectionName = (section, index = 0) => normalize(
        section.dataset.analyticsSection
        || section.id
        || section.getAttribute('aria-label')
        || section.querySelector('h1, h2, h3')?.textContent
        || section.classList[0]
        || `section_${index + 1}`,
        `section_${index + 1}`
    );

    const closestSectionState = (element) => {
        const section = element?.closest?.('section, main, header, footer, [data-analytics-section]');
        return section ? sectionStates.get(section) : null;
    };

    const addVisibleSectionTime = (state, now = performance.now()) => {
        if (!state?.visibleSince || document.visibilityState !== 'visible') return;
        state.visibleMs += Math.max(0, now - state.visibleSince);
        state.visibleSince = now;
    };

    const markPageInteraction = (target) => {
        pageInteracted = true;
        const state = closestSectionState(target);
        if (state) state.interacted = true;
        maybeSendPageEngaged();
    };

    const currentPageVisibleMs = () => pageVisibleMs + (
        pageVisibleSince === null ? 0 : Math.max(0, performance.now() - pageVisibleSince)
    );

    const maybeSendPageEngaged = () => {
        const activeMs = currentPageVisibleMs();
        if (pageEngagedSent || (activeMs < ENGAGED_MS && !(pageInteracted && maxScrollPercent >= 25))) return;
        pageEngagedSent = true;
        track('page_engaged', {
            engagement_time_msec: Math.round(activeMs),
            max_scroll_percent: maxScrollPercent,
            interaction_detected: pageInteracted
        });
    };

    const classifyLink = (link) => {
        const href = link.getAttribute('href') || '';
        if (/^tel:/i.test(href)) return 'phone';
        if (/^mailto:/i.test(href)) return 'email';
        if (/wa\.me|whatsapp/i.test(href)) return 'whatsapp';
        if (/facebook|instagram|linkedin|youtube|tiktok/i.test(href)) return 'social';
        if (/\.(pdf|xlsx?|docx?|csv|zip|mp4)(?:$|[?#])/i.test(href)) return 'download';
        if (/^#/.test(href)) return 'anchor';
        try {
            return new URL(href, location.href).origin === location.origin ? 'internal' : 'external';
        } catch (error) {
            return 'other';
        }
    };

    const elementLabel = (element, type) => {
        if (['phone', 'email', 'whatsapp'].includes(type)) return `${type}_contact`;
        return normalize(
            element.dataset.analyticsLabel
            || element.dataset.modelo
            || element.getAttribute('aria-label')
            || element.getAttribute('alt')
            || element.title
            || element.textContent,
            element.id ? normalize(element.id) : 'unlabeled'
        );
    };

    const onClick = (event) => {
        const target = event.target.closest('a, button, [role="button"], [data-analytics-action], [onclick]');
        if (!target) return;
        markPageInteraction(target);

        const link = target.closest('a[href]');
        const destinationType = link ? classifyLink(link) : 'button';
        const section = closestSectionState(target)?.name || 'unsectioned';
        const common = {
            element_type: link ? 'link' : normalize(target.tagName, 'interactive_element'),
            element_label: elementLabel(target, destinationType),
            destination_type: destinationType,
            section_name: section
        };

        if (link) {
            const href = link.getAttribute('href') || '';
            let destination = destinationType;
            if (['internal', 'external', 'anchor', 'download'].includes(destinationType)) {
                try {
                    const url = new URL(href, location.href);
                    destination = destinationType === 'external' ? url.hostname : url.pathname + (url.hash || '');
                } catch (error) {
                    destination = destinationType;
                }
            }
            common.link_destination = String(destination).slice(0, 120);
        }

        const eventByType = {
            phone: 'contact_click', email: 'contact_click', whatsapp: 'contact_click',
            social: 'social_click', external: 'outbound_click', download: 'file_download'
        };
        track(eventByType[destinationType] || 'cta_click', common);

        if (target.matches('.accordion-header, .sidebar-btn, .version-tab, [data-filter], .btn-reset-filter')) {
            track('content_interaction', {
                interaction_type: target.matches('.accordion-header') ? 'accordion' : 'filter_or_tab',
                content_id: elementLabel(target, 'button'),
                section_name: section
            });
        }
    };

    const onFilterChange = (event) => {
        const control = event.target;
        if (!control.matches?.('.filters-sidebar input, .filters-sidebar select, [data-analytics-filter]')) return;
        markPageInteraction(control);
        track('filter_change', {
            filter_name: normalize(control.name || control.dataset.analyticsFilter, 'filter'),
            filter_value: normalize(control.value, 'unknown_option'),
            section_name: closestSectionState(control)?.name || 'unsectioned'
        });
    };

    const getFormName = (form) => normalize(
        form.dataset.leadForm || form.getAttribute('name') || form.id || 'contact_form',
        'contact_form'
    );

    const getFieldName = (field) => normalize(
        field.name || field.id || field.closest('.input-group')?.querySelector('label')?.textContent || field.type,
        'unnamed_field'
    );

    const completedFields = (form) => Array.from(form.elements).filter((field) => {
        if (!field.name && !field.id) return false;
        if (['submit', 'button', 'reset', 'hidden'].includes(field.type)) return false;
        if (['checkbox', 'radio'].includes(field.type)) return field.checked;
        return Boolean(String(field.value || '').trim());
    }).length;

    const formState = (form) => {
        if (!formStates.has(form)) {
            formStates.set(form, {
                name: getFormName(form), started: false, attempted: false, completed: false,
                firstInteractionAt: 0, lastField: 'none', validationFields: new Set()
            });
        }
        return formStates.get(form);
    };

    const onFormInteraction = (event) => {
        const form = event.target.closest?.('form');
        if (!form) return;
        const state = formState(form);
        state.lastField = getFieldName(event.target);
        markPageInteraction(event.target);
        if (state.started) return;
        state.started = true;
        state.firstInteractionAt = Date.now();
        track('lead_form_start', {
            form_name: state.name,
            form_id: normalize(form.id || state.name),
            section_name: closestSectionState(form)?.name || 'unsectioned'
        });
    };

    const onInvalid = (event) => {
        const form = event.target.closest?.('form');
        if (!form) return;
        const state = formState(form);
        const fieldName = getFieldName(event.target);
        if (state.validationFields.has(fieldName)) return;
        state.validationFields.add(fieldName);
        track('lead_form_validation_error', {
            form_name: state.name,
            field_name: fieldName,
            validation_type: event.target.validity?.valueMissing ? 'required' : 'invalid_format'
        });
    };

    const onSubmit = (event) => {
        const form = event.target;
        if (!(form instanceof HTMLFormElement)) return;
        const state = formState(form);
        state.attempted = true;
        track('lead_form_submit_attempt', {
            form_name: state.name,
            completed_field_count: completedFields(form),
            form_elapsed_msec: state.firstInteractionAt ? Date.now() - state.firstInteractionAt : 0
        });
    };

    const onLeadResult = (event) => {
        const form = event.target instanceof HTMLFormElement ? event.target : null;
        if (!form) return;
        const state = formState(form);
        const status = event.detail?.status;
        if (status === 'success') {
            state.completed = true;
            track('generate_lead', {
                form_name: state.name,
                lead_source: 'website_form',
                form_elapsed_msec: state.firstInteractionAt ? Date.now() - state.firstInteractionAt : 0
            });
        } else {
            track('lead_form_submit_error', {
                form_name: state.name,
                error_type: normalize(event.detail?.errorType, 'submission_error'),
                http_status_group: normalize(event.detail?.httpStatusGroup, 'unknown')
            });
        }
    };

    const initSections = () => {
        const sections = Array.from(document.querySelectorAll('header, main, section, footer, [data-analytics-section]'))
            .filter((section, index, all) => all.indexOf(section) === index);
        sections.forEach((section, index) => sectionStates.set(section, {
            element: section,
            name: sectionName(section, index),
            visibleMs: 0,
            visibleSince: null,
            viewed: false,
            interacted: false
        }));

        if (!('IntersectionObserver' in window)) return;
        sectionObserver = new IntersectionObserver((entries) => {
            const now = performance.now();
            entries.forEach((entry) => {
                const state = sectionStates.get(entry.target);
                if (!state) return;
                if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
                    if (state.visibleSince === null && document.visibilityState === 'visible') state.visibleSince = now;
                    if (!state.viewed) {
                        state.viewed = true;
                        track('section_view', { section_name: state.name });
                    }
                } else {
                    addVisibleSectionTime(state, now);
                    state.visibleSince = null;
                }
            });
        }, { threshold: [0, 0.35, 0.65] });
        sections.forEach((section) => sectionObserver.observe(section));
    };

    const onVisibilityChange = () => {
        const now = performance.now();
        if (document.visibilityState === 'hidden') {
            if (pageVisibleSince !== null) pageVisibleMs += Math.max(0, now - pageVisibleSince);
            pageVisibleSince = null;
            sectionStates.forEach((state) => {
                addVisibleSectionTime(state, now);
                state.visibleSince = null;
            });
        } else {
            pageVisibleSince = now;
        }
    };

    const onScroll = () => {
        const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
        maxScrollPercent = Math.min(100, Math.round((scrollY / scrollable) * 100));
        [25, 50, 75, 90].forEach((milestone) => {
            if (maxScrollPercent < milestone || scrollMilestones.has(milestone)) return;
            scrollMilestones.add(milestone);
            track('scroll_depth', { percent_scrolled: milestone });
        });
        maybeSendPageEngaged();
    };

    const finalize = () => {
        if (!consentGranted || finalized) return;
        const now = performance.now();
        if (pageVisibleSince !== null) pageVisibleMs += Math.max(0, now - pageVisibleSince);
        pageVisibleSince = null;

        sectionStates.forEach((state) => {
            addVisibleSectionTime(state, now);
            if (!state.viewed) return;
            track('section_engagement', {
                section_name: state.name,
                engagement_status: state.visibleMs >= SECTION_ENGAGED_MS || state.interacted ? 'engaged' : 'not_engaged',
                engagement_time_msec: Math.round(state.visibleMs),
                interaction_detected: state.interacted
            });
        });

        formStates.forEach((state, form) => {
            if (!state.started || state.completed) return;
            track('lead_form_abandon', {
                form_name: state.name,
                submit_attempted: state.attempted,
                completed_field_count: completedFields(form),
                last_field_name: state.lastField,
                form_elapsed_msec: Date.now() - state.firstInteractionAt
            });
        });

        maybeSendPageEngaged();
        if (!pageEngagedSent) {
            track('page_not_engaged', {
                engagement_time_msec: Math.round(pageVisibleMs),
                max_scroll_percent: maxScrollPercent,
                interaction_detected: pageInteracted
            });
        }
        finalized = true;
    };

    const startTrackers = () => {
        if (trackersStarted) return;
        trackersStarted = true;
        pageVisibleSince = document.visibilityState === 'visible' ? performance.now() : null;
        initSections();
        document.addEventListener('click', onClick, true);
        document.addEventListener('focusin', onFormInteraction, true);
        document.addEventListener('input', onFormInteraction, true);
        document.addEventListener('change', onFormInteraction, true);
        document.addEventListener('change', onFilterChange, true);
        document.addEventListener('invalid', onInvalid, true);
        document.addEventListener('submit', onSubmit, true);
        document.addEventListener('foton:lead-form-result', onLeadResult, true);
        document.addEventListener('visibilitychange', onVisibilityChange);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('pagehide', finalize);
        setInterval(maybeSendPageEngaged, 1000);
        onScroll();
    };

    const configureTag = () => {
        if (tagConfigured || !validMeasurementId) return;
        tagConfigured = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(validMeasurementId)}`;
        script.referrerPolicy = 'strict-origin-when-cross-origin';
        document.head.appendChild(script);

        window.gtag('js', new Date());
        window.gtag('config', validMeasurementId, {
            send_page_view: false,
            allow_google_signals: false,
            allow_ad_personalization_signals: false,
            page_location: safeLocation(),
            page_referrer: document.referrer ? safeLocation(document.referrer, false) : undefined,
            debug_mode: debugMode
        });
    };

    const grantConsent = () => {
        if (consentGranted) return;
        consentGranted = true;
        finalized = false;
        window.gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
        configureTag();
        startTrackers();
        track('page_view', {
            page_title: safeText(document.title, pageContext().page_name, 100),
            page_location: safeLocation(),
            page_referrer: document.referrer ? safeLocation(document.referrer, false) : undefined
        });
        track('analytics_consent_update', { consent_state: 'granted' });
    };

    const denyConsent = () => {
        consentGranted = false;
        window.gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });
    };

    window.addEventListener('foton:tracking-consent-granted', grantConsent);
    window.addEventListener('foton:tracking-consent-changed', (event) => {
        if (event.detail?.status === 'granted') grantConsent();
        else denyConsent();
    });

    window.fotonAnalytics = Object.freeze({
        track,
        hasConsent: () => consentGranted,
        isConfigured: () => Boolean(validMeasurementId),
        measurementId: validMeasurementId || null
    });

    if (window.fotonConsent?.hasTrackingConsent?.()) grantConsent();
})();

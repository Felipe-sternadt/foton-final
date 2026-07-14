/* =======================================================
   FUNÇÕES GLOBAIS DA GALERIA DO AUMARK S 315
   ======================================================= */
function changeGalleryImage(thumbnail) {
    const mainImg = document.getElementById('mainGalleryImg');
    mainImg.style.opacity = 0; 
    setTimeout(() => {
        mainImg.src = thumbnail.src;
        mainImg.style.opacity = 1;
    }, 150);

    const allThumbs = document.querySelectorAll('#galleryThumbnails .thumb');
    allThumbs.forEach(t => t.classList.remove('active'));
    thumbnail.classList.add('active');
}

function filterGallery(type, btn) {
    const allBtns = document.querySelectorAll('.sidebar-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const allThumbs = document.querySelectorAll('#galleryThumbnails .thumb');
    let firstVisibleThumb = null;

    allThumbs.forEach(thumb => {
        if (thumb.getAttribute('data-type') === type) {
            thumb.style.display = 'block';
            if (!firstVisibleThumb) firstVisibleThumb = thumb; 
        } else {
            thumb.style.display = 'none';
        }
    });

    if (firstVisibleThumb) {
        changeGalleryImage(firstVisibleThumb);
    }
}

/* =======================================================
   FUNÇÃO DA SEÇÃO DE VERSÕES E ACORDEÃO (AUMARK S 315)
   ======================================================= */
function selectVersion(versionId, selectedTab) {
    const allSpecs = document.querySelectorAll('.specs-accordion');
    let openIndex = -1;

    allSpecs.forEach(spec => {
        if (getComputedStyle(spec).display !== 'none') {
            const items = spec.querySelectorAll('.accordion-item');
            items.forEach((item, index) => {
                if (item.classList.contains('active')) {
                    openIndex = index;
                }
            });
        }
    });

    const tabs = document.querySelectorAll('.version-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    selectedTab.classList.add('active');
    
    allSpecs.forEach(spec => {
        spec.style.display = 'none';
    });

    const activeSpec = document.getElementById('specs-' + versionId);
    if (activeSpec) {
        activeSpec.style.display = 'flex';

        if (openIndex !== -1) {
            const newItems = activeSpec.querySelectorAll('.accordion-item');
            if (newItems[openIndex]) {
                const targetItem = newItems[openIndex];
                const targetContent = targetItem.querySelector('.accordion-content');
                
                newItems.forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.accordion-content').style.maxHeight = null;
                });

                targetItem.classList.add('active');
                setTimeout(() => {
                    targetContent.style.maxHeight = targetContent.scrollHeight + 50 + "px";
                }, 50);
            }
        }
    }
}

/* =======================================================
   INÍCIO DO DOM - EXECUTADO APÓS A PÁGINA CARREGAR
   ======================================================= */
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('img.thumb').forEach((thumbnail, index) => {
        const category = thumbnail.dataset.type === 'interior' ? 'interior' : 'exterior';
        const vehicle = document.querySelector('h1')?.textContent?.trim() || document.title.split('|')[0].trim();
        if (!thumbnail.hasAttribute('alt')) {
            thumbnail.alt = `${vehicle}: vista ${category} ${index + 1}`;
        }
        thumbnail.setAttribute('role', 'button');
        thumbnail.setAttribute('tabindex', '0');
        thumbnail.setAttribute('aria-label', `Exibir ${thumbnail.alt}`);
        thumbnail.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            thumbnail.click();
        });
    });

    /* --- 1. FIX DE NAVEGAÇÃO (IMPEDE O OBSERVER DE ROUBAR A TELA) --- */
    let isNavigating = false;
    let navTimeout = null;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function() {
            isNavigating = true; 
            clearTimeout(navTimeout);
            navTimeout = setTimeout(() => { 
                isNavigating = false; 
            }, 1500);
        });
    });

    /* --- BOTÕES FIXOS DE REDES SOCIAIS --- */
    if (!document.querySelector('.floating-socials')) {
        const socials = document.createElement('div');
        socials.className = 'floating-socials';
        socials.setAttribute('aria-label', 'Redes sociais');
        socials.innerHTML = `
            <a class="floating-social-btn facebook" href="https://www.facebook.com/p/Someval-Foton-Caminh%C3%B5es-61557612016827/" target="_blank" rel="noopener" aria-label="Facebook Someval Foton">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06z"/></svg>
            </a>
            <a class="floating-social-btn instagram" href="https://www.instagram.com/foton.someval/" target="_blank" rel="noopener" aria-label="Instagram Someval Foton">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/></svg>
            </a>
            <a class="floating-social-btn whatsapp" href="https://wa.me/554836210150" target="_blank" rel="noopener" aria-label="WhatsApp Foton">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.86 11.86 0 0 0 12.05 0C5.48 0 .14 5.34.14 11.91c0 2.1.55 4.15 1.6 5.96L0 24l6.28-1.65a11.9 11.9 0 0 0 5.77 1.47h.01c6.57 0 11.91-5.34 11.91-11.91a11.84 11.84 0 0 0-3.45-8.43zM12.06 21.8h-.01a9.88 9.88 0 0 1-5.04-1.38l-.36-.21-3.73.98 1-3.63-.24-.37a9.86 9.86 0 0 1-1.51-5.27c0-5.45 4.44-9.89 9.9-9.89a9.83 9.83 0 0 1 6.99 2.9 9.82 9.82 0 0 1 2.9 7c0 5.45-4.44 9.88-9.9 9.88zm5.42-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.02-1.05 2.5s1.08 2.9 1.23 3.1c.15.2 2.12 3.24 5.14 4.54.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.09 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
            </a>
        `;
        document.body.appendChild(socials);
    }

    /* --- 2. CONTROLE DE ANIMAÇÕES (F5 / VOLTAR PÁGINA) --- */
    const navEntry = performance.getEntriesByType("navigation")[0];
    const navType = navEntry ? navEntry.type : '';
    const veioDeDentroDoSite = document.referrer.includes(window.location.hostname) && document.referrer !== '';
    let pularAnimacoes = false;

    if (navType === 'reload') {
        pularAnimacoes = false;
    } else if (navType === 'back_forward' || veioDeDentroDoSite) {
        pularAnimacoes = true;
    }

    if (pularAnimacoes) {
        document.body.classList.add('disable-animations');
        document.querySelectorAll('.models-section, .cummins-section').forEach(sec => {
            sec.classList.add('is-visible');
        });
    }
   
    if (window.location.hash) {
        isNavigating = true;
        setTimeout(() => {
            isNavigating = false;
        }, 2000); 
    }
 
    /* --- 3. HERO + SMART NAVBAR --- */
    const heroSection = document.querySelector('.hero');
    const navbarContainer = document.querySelector('.navbar-container');
    const viewportHeight = window.innerHeight;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY || document.documentElement.scrollTop;

        // HERO EFFECT (Apenas onde a hero existe)
        if (heroSection) {
            if (currentScroll <= viewportHeight) {
                const progress = currentScroll / viewportHeight;
                const scale = 1 + (progress * 0.20);
                const blur = progress * 12;
                const opacity = 1 - (progress * 0.4);
                heroSection.style.transform = `scale(${scale})`;
                heroSection.style.filter = `blur(${blur}px) brightness(${opacity})`;
            }
        }

        // NAVBAR SMART
        if (currentScroll <= 50) {
            navbarContainer.classList.remove('navbar-hidden');
        } else if (currentScroll > lastScroll) {
            navbarContainer.classList.add('navbar-hidden');
        } else {
            navbarContainer.classList.remove('navbar-hidden');
        }
        lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    });

    /* --- 4. SCROLL LOCK + OBSERVER (SEÇÕES) --- */
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.3 }); 

    document.querySelectorAll('.models-section, .cummins-section, .dealers-section').forEach(section => {
        sectionObserver.observe(section);
    });

    /* --- 4.1. SHOWCASE TECNICO CUMMINS --- */
    const techShowcase = document.querySelector('[data-tech-showcase]');

    if (techShowcase) {
        const slides = [
            {
                id: 'confianca', eyebrow: 'Confiança global', title: 'Engenharia para operar sem pausa',
                description: 'Os motores Cummins são reconhecidos em operações exigentes no mundo todo, unindo tradição, robustez e uma arquitetura preparada para alto ciclo de trabalho.',
                highlight: 'Um dos nomes mais confiáveis em motores comerciais.', image: 'assets/images/motor_cummins.webp',
                alt: 'Motor Cummins com engenharia de confiabilidade global', theme: 'global',
                hotspots: [{ x: 59, y: 30, title: 'Arquitetura robusta', description: 'Projeto preparado para alto ciclo de trabalho.' }]
            },
            {
                id: 'performance', eyebrow: 'Performance eficiente', title: 'Força, torque e economia na medida certa',
                description: 'Resposta consistente, entrega de torque em baixa rotação e eficiência para reduzir custo operacional sem abrir mão da performance em carga.',
                highlight: 'Desempenho preciso para cidade, estrada e operação intensa.', image: 'assets/images/motor_cummins.webp',
                alt: 'Motor Cummins com foco em torque e eficiência', theme: 'performance',
                hotspots: [{ x: 71, y: 42, title: 'Turbo', description: 'Resposta rápida e entrega eficiente de potência.' }, { x: 49, y: 59, title: 'Injeção', description: 'Precisão para otimizar consumo e desempenho.' }]
            },
            {
                id: 'seguranca', eyebrow: 'Segurança operacional', title: 'Tecnologia para proteger sua frota',
                description: 'Projeto durável, calibração inteligente e estabilidade de entrega criam uma condução mais segura, previsível e preparada para operações críticas.',
                highlight: 'Durabilidade e previsibilidade para decisões de frota.', image: 'assets/images/motor_cummins.webp',
                alt: 'Motor Cummins com tecnologia e durabilidade', theme: 'safety',
                hotspots: [{ x: 46, y: 36, title: 'Calibração inteligente', description: 'Entrega estável em diferentes regimes de operação.' }]
            },
            {
                id: 'eficiencia', eyebrow: 'Baixo custo operacional', title: 'Eficiência que aparece na operação',
                description: 'Calibração precisa, entrega progressiva de força e construção robusta ajudam a reduzir paradas, otimizar consumo e manter a produtividade da frota.',
                highlight: 'Mais disponibilidade, menos custo parado.', image: 'assets/images/motor_cummins.webp',
                alt: 'Motor Cummins com foco em eficiência operacional', theme: 'efficiency',
                hotspots: [{ x: 65, y: 67, title: 'Entrega progressiva', description: 'Força previsível com menor esforço do conjunto.' }]
            },
            {
                id: 'durabilidade', eyebrow: 'Durabilidade extrema', title: 'Construído para ciclos severos',
                description: 'Componentes dimensionados para uso profissional entregam resistência em rotas urbanas, carga constante e longas jornadas, mantendo resposta consistente ao longo do tempo.',
                highlight: 'Robustez para quem não pode depender da sorte.', image: 'assets/images/motor_cummins.webp',
                alt: 'Motor Cummins com construção robusta', theme: 'durability',
                hotspots: [{ x: 40, y: 49, title: 'Bloco reforçado', description: 'Resistência para jornadas intensas e carga constante.' }, { x: 66, y: 30, title: 'Gestão térmica', description: 'Controle de temperatura mesmo em ciclos severos.' }]
            },
            {
                id: 'tradicao', eyebrow: 'Tradição mundial', title: 'Confiança reconhecida globalmente',
                description: 'Com presença consolidada em mercados exigentes, a Cummins combina tecnologia, assistência e reputação para entregar segurança em decisões de frota.',
                highlight: 'Uma referência mundial em motores diesel comerciais.', image: 'assets/images/motor_cummins.webp',
                alt: 'Motor Cummins com tradição global', theme: 'legacy',
                hotspots: [{ x: 57, y: 53, title: 'Engenharia global', description: 'Tecnologia validada em operações ao redor do mundo.' }]
            }
        ];
        const pad = (value) => String(value).padStart(2, '0');
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        let current = 0;
        let locked = false;
        let inViewport = false;
        let pointerDown = null;
        let frame = 0;
        let unlockTimer = 0;
        let progressTimer = 0;
        let progressStart = 0;
        let elapsed = 0;
        const autoplayDuration = 8000;

        techShowcase.innerHTML = `
            <div class="tech-showcase__panel">
                <div class="tech-showcase__copy" data-tech-copy></div>
                <div class="tech-showcase__visual" data-tech-visual>
                    <div class="tech-showcase__grid" aria-hidden="true"></div>
                    <div class="tech-showcase__glow" data-tech-glow aria-hidden="true"></div>
                    <div class="tech-showcase__product" data-tech-product></div>
                    <div class="tech-showcase__controls">
                        <button type="button" class="tech-showcase__arrow" data-tech-prev aria-label="Slide anterior"><span aria-hidden="true">←</span></button>
                        <button type="button" class="tech-showcase__arrow" data-tech-next aria-label="Próximo slide"><span aria-hidden="true">→</span></button>
                    </div>
                </div>
                <div class="tech-showcase__footer">
                    <div class="tech-showcase__count"><span data-tech-current>01</span><span aria-hidden="true">/</span><span>${pad(slides.length)}</span></div>
                    <div class="tech-showcase__progress" aria-hidden="true"><span data-tech-progress></span></div>
                </div>
            </div>
            <p class="sr-only" data-tech-live aria-live="polite" aria-atomic="true"></p>`;

        const copy = techShowcase.querySelector('[data-tech-copy]');
        const visual = techShowcase.querySelector('[data-tech-visual]');
        const product = techShowcase.querySelector('[data-tech-product]');
        const glow = techShowcase.querySelector('[data-tech-glow]');
        const currentLabel = techShowcase.querySelector('[data-tech-current]');
        const progress = techShowcase.querySelector('[data-tech-progress]');
        const live = techShowcase.querySelector('[data-tech-live]');

        const hotspotMarkup = (hotspots) => hotspots.slice(0, 3).map((spot, index) => `
            <button type="button" class="tech-hotspot" style="--x:${spot.x}%;--y:${spot.y}%" aria-label="${spot.title}: ${spot.description}" aria-expanded="false" data-hotspot="${index}">
                <span class="tech-hotspot__dot" aria-hidden="true"></span>
                <span class="tech-hotspot__tooltip"><strong>${spot.title}</strong><small>${spot.description}</small></span>
            </button>`).join('');

        const render = (next, direction = 1, announce = true) => {
            if (locked || next === current && copy.children.length) return;
            locked = true;
            current = (next + slides.length) % slides.length;
            const slide = slides[current];
            techShowcase.dataset.theme = slide.theme;
            techShowcase.dataset.direction = direction > 0 ? 'next' : 'prev';
            techShowcase.classList.remove('is-entering');
            product.style.transform = '';
            glow.style.transform = '';
            copy.innerHTML = `
                <span class="tech-showcase__watermark" aria-hidden="true">${pad(current + 1)}</span>
                <div class="tech-showcase__meta"><span>${pad(current + 1)} / ${pad(slides.length)}</span><span>${slide.eyebrow}</span></div>
                <span class="tech-showcase__eyebrow">${slide.eyebrow}</span>
                <h3>${slide.title}</h3>
                <p>${slide.description}</p>
                <strong class="tech-showcase__highlight"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>${slide.highlight}</strong>`;
            product.innerHTML = `<img src="${slide.image}" alt="${slide.alt}" width="720" height="720" ${current ? 'loading="lazy"' : 'fetchpriority="high"'}>${hotspotMarkup(slide.hotspots)}`;
            currentLabel.textContent = pad(current + 1);
            if (announce) live.textContent = `Slide ${current + 1} de ${slides.length}: ${slide.title}`;
            requestAnimationFrame(() => techShowcase.classList.add('is-entering'));
            window.clearTimeout(unlockTimer);
            unlockTimer = window.setTimeout(() => { locked = false; }, reducedMotion.matches ? 80 : 720);
            const preload = new Image();
            preload.src = slides[(current + 1) % slides.length].image;
            restartProgress();
        };

        const pauseProgress = () => {
            if (!progressStart) return;
            elapsed += performance.now() - progressStart;
            progressStart = 0;
            cancelAnimationFrame(progressTimer);
        };

        const tickProgress = (time) => {
            if (!progressStart) progressStart = time;
            const value = Math.min((elapsed + time - progressStart) / autoplayDuration, 1);
            progress.style.transform = `scaleX(${value})`;
            if (value >= 1) {
                elapsed = 0;
                progressStart = 0;
                render(current + 1, 1, false);
                return;
            }
            progressTimer = requestAnimationFrame(tickProgress);
        };

        function restartProgress() {
            cancelAnimationFrame(progressTimer);
            elapsed = 0;
            progressStart = 0;
            progress.style.transform = 'scaleX(0)';
            if (inViewport && !techShowcase.matches(':hover, :focus-within') && !document.hidden) {
                progressTimer = requestAnimationFrame(tickProgress);
            }
        }

        const resumeProgress = () => {
            if (inViewport && !progressStart && !document.hidden) progressTimer = requestAnimationFrame(tickProgress);
        };
        const navigate = (step) => { if (!locked) render(current + step, step); };
        techShowcase.querySelector('[data-tech-prev]').addEventListener('click', () => navigate(-1));
        techShowcase.querySelector('[data-tech-next]').addEventListener('click', () => navigate(1));
        techShowcase.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                navigate(event.key === 'ArrowLeft' ? -1 : 1);
            }
        });
        techShowcase.addEventListener('focusin', pauseProgress);
        techShowcase.addEventListener('focusout', () => requestAnimationFrame(resumeProgress));
        techShowcase.addEventListener('mouseenter', pauseProgress);
        techShowcase.addEventListener('mouseleave', resumeProgress);
        techShowcase.addEventListener('click', (event) => {
            const hotspot = event.target.closest('[data-hotspot]');
            if (!hotspot) return;
            const wasOpen = hotspot.getAttribute('aria-expanded') === 'true';
            techShowcase.querySelectorAll('[data-hotspot]').forEach(item => item.setAttribute('aria-expanded', 'false'));
            hotspot.setAttribute('aria-expanded', String(!wasOpen));
        });

        visual.addEventListener('pointerdown', (event) => {
            if (event.target.closest('button')) return;
            pointerDown = { id: event.pointerId, x: event.clientX };
            visual.setPointerCapture?.(event.pointerId);
            techShowcase.classList.add('is-dragging');
            pauseProgress();
        });
        visual.addEventListener('pointerup', (event) => {
            if (!pointerDown || pointerDown.id !== event.pointerId) return;
            const distance = event.clientX - pointerDown.x;
            pointerDown = null;
            techShowcase.classList.remove('is-dragging');
            if (Math.abs(distance) > 48) navigate(distance < 0 ? 1 : -1); else restartProgress();
        });
        visual.addEventListener('pointercancel', () => { pointerDown = null; techShowcase.classList.remove('is-dragging'); resumeProgress(); });

        visual.addEventListener('pointermove', (event) => {
            if (!finePointer.matches || reducedMotion.matches) return;
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                const rect = visual.getBoundingClientRect();
                const x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width - 0.5) * 2));
                const y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height - 0.5) * 2));
                product.style.transform = `translate3d(${x * 14}px, ${y * 10}px, 0) rotateX(${-y * 4}deg) rotateY(${x * 5}deg)`;
                glow.style.transform = `translate3d(${x * 34}px, ${y * 26}px, 0)`;
            });
        });
        visual.addEventListener('pointerleave', () => {
            if (!pointerDown) {
                product.style.transform = '';
                glow.style.transform = '';
            }
        });

        const visibilityObserver = new IntersectionObserver(([entry]) => {
            inViewport = entry.isIntersecting && entry.intersectionRatio >= 0.35;
            if (inViewport) resumeProgress(); else pauseProgress();
        }, { threshold: [0, 0.35] });
        visibilityObserver.observe(techShowcase);
        document.addEventListener('visibilitychange', () => document.hidden ? pauseProgress() : resumeProgress());
        render(0, 1, false);
    }

    /* --- 5. CARROSSEL PREMIUM AUTOMÁTICO --- */
    const track = document.getElementById('sliderTrack');
    const carousel = document.getElementById('modelsCarousel');

    if (track && carousel) {
        const originalCards = Array.from(track.children);
        let isPaused = false;
        let isDragging = false;
        let hasDragged = false;
        let shouldSuppressClick = false;
        let activePointerCard = null;
        let startX = 0;
        let startPosition = 0;
        let position = 0;
        let lastTimestamp = 0;
        let rafId = null;
        let loopWidth = 0;
        const speed = 86;

        function cloneCardsForLoop() {
            track.querySelectorAll('[data-carousel-clone="true"]').forEach(clone => clone.remove());
            originalCards.forEach(card => {
                const clone = card.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.setAttribute('data-carousel-clone', 'true');
                clone.setAttribute('tabindex', '-1');
                track.appendChild(clone);
            });
        }

        function measureLoop() {
            loopWidth = track.scrollWidth / 2;
            normalizePosition();
            renderCarousel();
        }

        function normalizePosition() {
            if (loopWidth <= 0) return;
            while (position >= loopWidth) {
                position -= loopWidth;
            }
            while (position < 0) {
                position += loopWidth;
            }
        }

        function renderCarousel() {
            track.style.transform = `translate3d(${-position}px, 0, 0)`;
        }

        function animateCarousel(timestamp) {
            if (!lastTimestamp) lastTimestamp = timestamp;
            const deltaSeconds = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
            lastTimestamp = timestamp;

            if (!isPaused && !isDragging) {
                position += speed * deltaSeconds;
                normalizePosition();
                renderCarousel();
            }

            rafId = requestAnimationFrame(animateCarousel);
        }

        cloneCardsForLoop();

        const pauseArea = carousel;

        pauseArea.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        pauseArea.addEventListener('mouseleave', () => {
            isPaused = false;
            isDragging = false;
            carousel.classList.remove('is-dragging');
        });

        carousel.addEventListener('pointerdown', (event) => {
            if (event.button !== undefined && event.button !== 0) return;
            isDragging = true;
            hasDragged = false;
            shouldSuppressClick = false;
            activePointerCard = event.target.closest('.model-card');
            isPaused = true;
            startX = event.clientX;
            startPosition = position;
            carousel.classList.add('is-dragging');
            carousel.setPointerCapture(event.pointerId);
        });

        carousel.addEventListener('pointermove', (event) => {
            if (!isDragging) return;
            event.preventDefault();
            const dragDistance = event.clientX - startX;
            if (Math.abs(dragDistance) > 8) {
                hasDragged = true;
            }
            position = startPosition - dragDistance;
            normalizePosition();
            renderCarousel();
        });

        carousel.addEventListener('pointerup', (event) => {
            const clickedCard = activePointerCard;
            isDragging = false;
            isPaused = false;
            carousel.classList.remove('is-dragging');
            if (carousel.hasPointerCapture(event.pointerId)) {
                carousel.releasePointerCapture(event.pointerId);
            }
            if (hasDragged) {
                shouldSuppressClick = true;
            } else if (clickedCard) {
                const href = clickedCard.getAttribute('data-href') || clickedCard.getAttribute('href');
                if (href && href !== '#') {
                    window.location.assign(href);
                }
            }
            activePointerCard = null;
        });

        carousel.addEventListener('pointercancel', () => {
            isDragging = false;
            isPaused = false;
            hasDragged = false;
            shouldSuppressClick = false;
            activePointerCard = null;
            carousel.classList.remove('is-dragging');
        });

        carousel.addEventListener('click', (event) => {
            if (shouldSuppressClick) {
                event.preventDefault();
                event.stopPropagation();
                hasDragged = false;
                shouldSuppressClick = false;
                return;
            }

            const card = event.target.closest('.model-card');
            if (!card) return;

            const href = card.getAttribute('data-href') || card.getAttribute('href');
            if (href && href !== '#') {
                event.preventDefault();
                window.location.assign(href);
            }
        }, true);

        carousel.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;

            const card = event.target.closest('.model-card');
            if (!card) return;

            event.preventDefault();
            const href = card.getAttribute('data-href') || card.getAttribute('href');
            if (href && href !== '#') {
                window.location.assign(href);
            }
        });

        carousel.addEventListener('touchstart', () => {
            isPaused = true;
        }, { passive: true });

        carousel.addEventListener('touchend', () => {
            isPaused = false;
        }, { passive: true });

        carousel.addEventListener('wheel', (event) => {
            const horizontalDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
            if (!horizontalDelta) return;
            event.preventDefault();
            position += horizontalDelta * 0.8;
            normalizePosition();
            renderCarousel();
        }, { passive: false });

        window.addEventListener('resize', () => {
            measureLoop();
        });

        window.addEventListener('load', () => {
            measureLoop();
        });

        requestAnimationFrame(() => {
            measureLoop();
            renderCarousel();
            rafId = requestAnimationFrame(animateCarousel);
        });

        window.addEventListener('beforeunload', () => {
            if (rafId) cancelAnimationFrame(rafId);
        });
    }

    /* --- 7. ANIMAÇÃO DOS NÚMEROS (CONTADOR) --- */
    const counters = document.querySelectorAll('.counter');
    const specsSection = document.querySelector('.aumark-specs-section');

    if (specsSection && counters.length > 0) {
        let countersStarted = false;

        const animateCounters = () => {
            if (countersStarted) return;
            countersStarted = true;

            counters.forEach(counter => {
                const target = Number(counter.getAttribute('data-target')) || 0;
                const duration = 1650;
                const startTime = performance.now();

                const updateCount = (currentTime) => {
                    const progress = Math.min((currentTime - startTime) / duration, 1);
                    const easedProgress = 1 - Math.pow(1 - progress, 3);
                    const currentValue = Math.round(target * easedProgress);

                    counter.innerText = currentValue.toLocaleString('pt-BR');

                    if (progress < 1) {
                        requestAnimationFrame(updateCount);
                        return;
                    }

                    counter.innerText = target.toLocaleString('pt-BR');
                };

                counter.innerText = '0';
                requestAnimationFrame(updateCount);
            });
        };

        const startCountersIfVisible = () => {
            const specsRect = specsSection.getBoundingClientRect();
            const specsVisible = specsRect.top < window.innerHeight * 0.88 && specsRect.bottom > window.innerHeight * 0.12;

            if (!specsVisible) return;

            animateCounters();
            window.removeEventListener('scroll', startCountersIfVisible);
            window.removeEventListener('resize', startCountersIfVisible);
        };

        startCountersIfVisible();
        setTimeout(startCountersIfVisible, 600);
        setTimeout(startCountersIfVisible, 1400);
        const counterVisibilityInterval = setInterval(() => {
            if (countersStarted) {
                clearInterval(counterVisibilityInterval);
                return;
            }

            startCountersIfVisible();
        }, 350);

        setTimeout(() => {
            clearInterval(counterVisibilityInterval);
        }, 8000);
        window.addEventListener('scroll', startCountersIfVisible, { passive: true });
        window.addEventListener('resize', startCountersIfVisible);

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.18, rootMargin: '0px 0px -10% 0px' });

        counterObserver.observe(specsSection);
    }

    /* --- 8. API DO IBGE (ESTADOS E CIDADES) --- */
    const estadoSelect = document.getElementById('estadoSelect');
    const cidadeSelect = document.getElementById('cidadeSelect');

    if (estadoSelect && cidadeSelect) {
        const estadosFallback = [
            ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'],
            ['BA', 'Bahia'], ['CE', 'Ceará'], ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'],
            ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'], ['MS', 'Mato Grosso do Sul'],
            ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
            ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'],
            ['RN', 'Rio Grande do Norte'], ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'],
            ['RR', 'Roraima'], ['SC', 'Santa Catarina'], ['SP', 'São Paulo'],
            ['SE', 'Sergipe'], ['TO', 'Tocantins']
        ];

        const preencherEstados = (estados) => {
            estadoSelect.innerHTML = '<option value="" disabled selected>Selecione o estado</option>';
            estados.forEach(estado => {
                const sigla = Array.isArray(estado) ? estado[0] : estado.sigla;
                const nome = Array.isArray(estado) ? estado[1] : estado.nome;
                if (sigla && nome) {
                    const option = document.createElement('option');
                    option.value = sigla;
                    option.textContent = nome;
                    estadoSelect.appendChild(option);
                }
            });
        };

        const habilitarCidadeManual = () => {
            if (!cidadeSelect.isConnected) return;
            const input = document.createElement('input');
            input.type = 'text';
            input.id = cidadeSelect.id;
            input.name = cidadeSelect.name || 'city';
            input.required = true;
            input.autocomplete = 'address-level2';
            input.placeholder = 'Digite sua cidade';
            cidadeSelect.replaceWith(input);
        };

        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome', {
            signal: AbortSignal.timeout(8000)
        })
            .then(res => {
                if (!res.ok) throw new Error(`IBGE estados: HTTP ${res.status}`);
                return res.json();
            })
            .then(preencherEstados)
            .catch(error => {
                console.error("Erro ao buscar estados:", error);
                preencherEstados(estadosFallback);
            });

        estadoSelect.addEventListener('change', function() {
            const uf = this.value; 
            cidadeSelect.innerHTML = '<option value="" disabled selected>Carregando cidades...</option>';
            cidadeSelect.disabled = true;

            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`, {
                signal: AbortSignal.timeout(8000)
            })
                .then(res => {
                    if (!res.ok) throw new Error(`IBGE cidades: HTTP ${res.status}`);
                    return res.json();
                })
                .then(cidades => {
                    cidadeSelect.innerHTML = '<option value="" disabled selected>Selecione a cidade</option>';
                    cidades.forEach(cidade => {
                        const option = document.createElement('option');
                        option.value = cidade.nome;
                        option.textContent = cidade.nome;
                        cidadeSelect.appendChild(option);
                    });
                    cidadeSelect.disabled = false;
                })
                .catch(error => {
                    console.error("Erro ao buscar cidades:", error);
                    habilitarCidadeManual();
                });
        });
    }

    /* --- 9. MODAL DE TELEFONES --- */
    const btnOpen = document.getElementById('btnOpenTelefones');
    const btnClose = document.getElementById('btnCloseTelefones');
    const modal = document.getElementById('modalTelefones');

    if (btnOpen && modal) {
        btnOpen.addEventListener('click', () => {
            modal.classList.add('active');
        });

        btnClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    }

    /* --- 10. ACORDEÃO NO CLIQUE (AUMARK S 315) --- */
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        
        header.addEventListener('click', function(e) {
            e.preventDefault();
            const parentAccordion = item.closest('.specs-accordion');
            const content = item.querySelector('.accordion-content');
            const allSiblingItems = parentAccordion.querySelectorAll('.accordion-item');

            if (item.classList.contains('active')) {
                item.classList.remove('active');
                content.style.maxHeight = null;
            } else {
                allSiblingItems.forEach(sibling => {
                    sibling.classList.remove('active');
                    sibling.querySelector('.accordion-content').style.maxHeight = null;
                });
                item.classList.add('active');
                setTimeout(() => {
                    content.style.maxHeight = content.scrollHeight + 50 + "px";
                }, 10);
            }
        });
    });

    /* --- 11. LÓGICA DA SIDEBAR MOBILE / MACBOOK --- */
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const sidebarLinksElements = document.querySelectorAll('.sidebar-links a, .sidebar-buttons a');

    if (sidebar) {
        sidebar.setAttribute('aria-hidden', 'true');
        sidebar.inert = true;
    }
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');

    function openSidebar() {
        if(sidebar) {
            sidebar.classList.add('active');
            sidebar.removeAttribute('inert');
            sidebar.setAttribute('aria-hidden', 'false');
        }
        if(menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
        if(sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        closeSidebarBtn?.focus();
    }

    function closeSidebar() {
        if(sidebar) {
            sidebar.classList.remove('active');
            sidebar.setAttribute('inert', '');
            sidebar.setAttribute('aria-hidden', 'true');
        }
        if(menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        if(sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
        menuToggle?.focus();
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', openSidebar);
        closeSidebarBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        sidebarLinksElements.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && sidebar.classList.contains('active')) closeSidebar();
        });
    }

    /* --- 12. AUTO-PREENCHIMENTO DO MODELO (CONTATO E TEST DRIVE) --- */
    const urlParams = new URLSearchParams(window.location.search);
    const modeloSelecionado = urlParams.get('modelo');

    const mapaModelosGeral = {
        'aumark-s-315': 'Aumark S 315 MT',
        'aumark-s-315-mt': 'Aumark S 315 MT',
        'aumark-s-315-amt': 'Aumark S 315 AMT',
        'aumark-s-715': 'Aumark S 715',
        'aumark-s-916': 'Aumark S 916',
        'aumark-s-1217': 'Aumark S 1217',
        'aumark-s-1217-l': 'Aumark S 1217 L',
        'auman-d-1722': 'Auman D 1722',
        'auman-d-1830': 'Auman D 1830',
        'auman-d-2632': 'Auman D 2632',
        'auman-d-2632-l': 'Auman D 2632 L',
        'tunland': 'Tunland V7 HEV',
        'tunland-v7': 'Tunland V7 HEV',
        'tunland-v9': 'Tunland V9 HEV',
        'ewonder': 'eWonder',
        'etoano-pro': 'eToano Pro M',
        'etoano-pro-m': 'eToano Pro M',
        'etoano-pro-h': 'eToano Pro H',
        'eview-grand': 'eView Grand Teto Baixo',
        'eview-grand-teto-baixo': 'eView Grand Teto Baixo',
        'eview-grand-teto-medio': 'eView Grand Teto Médio',
        'eview-connect': 'eView Connect',
        'eaumark': 'eAumark 6T',
        'eaumark-6t': 'eAumark 6T',
        'eaumark-9t': 'eAumark 9T',
        'eaumark-9t-l': 'eAumark 9T L',
        'eaumark-12t': 'eAumark 12T',
        'eaumark-12t-l': 'eAumark 12T L'
    };

    // Auto-preenche o formulário de COTAÇÃO (se existir na página)
    if (modeloSelecionado) {
        setTimeout(() => {
            const selectCotacao = document.getElementById('modeloSelect');
            if (selectCotacao) {
                const valorExato = mapaModelosGeral[modeloSelecionado];
                if (valorExato) {
                    selectCotacao.value = valorExato; 
                }
            }
        }, 500); 
    }

    /* --- 13. TROCA DE IMAGEM DINÂMICA (PÁGINA DE TEST DRIVE) --- */
    const tdSelect = document.getElementById('tdModeloSelect');
    const tdImg = document.getElementById('tdCarImage');
    const tdName = document.getElementById('tdCarName');

    if (tdSelect && tdImg && tdName) {
        const assetBase = window.location.pathname.includes('/pages/') || window.location.pathname.includes('/models/')
            ? '../assets/images/'
            : 'assets/images/';

        const imagensModelos = {
            "Aumark S 315 MT": `${assetBase}modelo_1.webp`,
            "Aumark S 315 AMT": `${assetBase}modelo_1.webp`,
            "Aumark S 715": `${assetBase}modelo_2.webp`,
            "Aumark S 916": `${assetBase}modelo_2.webp`,
            "Aumark S 1217": `${assetBase}modelo_2.webp`,
            "Aumark S 1217 L": `${assetBase}modelo_2.webp`,
            "Auman D 1722": `${assetBase}modelo_4.webp`,
            "Auman D 1830": `${assetBase}modelo_11.webp`,
            "Auman D 2632": `${assetBase}modelo_12.webp`,
            "Auman D 2632 L": `${assetBase}modelo_12.webp`,
            "Tunland V7 HEV": `${assetBase}tunland_v7.webp`,
            "Tunland V9 HEV": `${assetBase}tunland_v9.webp`,
            "eWonder": `${assetBase}modelo_6.webp`,
            "eToano Pro": `${assetBase}modelo_7.webp`,
            "eToano Pro M": `${assetBase}modelo_7.webp`,
            "eToano Pro H": `${assetBase}modelo_7.webp`,
            "eView Grand": `${assetBase}modelo_8.png`,
            "eView Grand Teto Baixo": `${assetBase}modelo_8.png`,
            "eView Grand Teto Médio": `${assetBase}modelo_8.png`,
            "eView Connect": `${assetBase}modelo_9.webp`,
            "eAumark": `${assetBase}modelo_10.webp`,
            "eAumark 6T": `${assetBase}modelo_10.webp`,
            "eAumark 9T": `${assetBase}modelo_10.webp`,
            "eAumark 9T L": `${assetBase}modelo_10.webp`,
            "eAumark 12T": `${assetBase}modelo_10.webp`,
            "eAumark 12T L": `${assetBase}modelo_10.webp`
        };

        function atualizarCarro() {
            const modeloEscolhido = tdSelect.value;
            
            tdImg.style.opacity = 0;
            tdImg.style.transform = "scale(0.95)";
            
            setTimeout(() => {
                if (imagensModelos[modeloEscolhido]) {
                    tdImg.src = imagensModelos[modeloEscolhido];
                }
                tdName.textContent = modeloEscolhido;
                
                tdImg.style.opacity = 1;
                tdImg.style.transform = "scale(1)";
            }, 300);
        }

        tdSelect.addEventListener('change', atualizarCarro);

        // Preenchimento automático para o Test Drive (força a atualização da imagem na chegada)
        if (modeloSelecionado) {
            const valorExatoTD = mapaModelosGeral[modeloSelecionado];
            if (valorExatoTD) {
                tdSelect.value = valorExatoTD;
                atualizarCarro(); 
            }
        }
    }
/* --- Bloqueio de datas retroativas no calendário --- */
const inputData = document.getElementById('dataAgendamento');
if (inputData) {
    const agora = new Date();
    const hoje = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
    inputData.setAttribute('min', hoje); // Define a data mínima como hoje
}/* --- 14. SISTEMA DE FILTROS (PÁGINA NOVOS.HTML ESTILO PORSCHE) --- */
    const filterRadios = document.querySelectorAll('.filters-sidebar input[type="radio"]');
    const porscheCards = document.querySelectorAll('.porsche-card');
    const btnResetFiltros = document.getElementById('btnResetFiltros');
    const showroomGrid = document.getElementById('showroomGrid');

    if (filterRadios.length > 0 && porscheCards.length > 0) {
        
        // Função principal que lê os filtros e esconde/mostra os cards
        function aplicarFiltros() {
            // Pega o valor dos radios marcados. Se nenhum estiver, usa 'todos'
            const modeloSelecionado = document.querySelector('input[name="modelo"]:checked')?.value || 'todos';
            const combustivelSelecionado = document.querySelector('input[name="combustivel"]:checked')?.value || 'todos';

            let visibleCards = 0;

            porscheCards.forEach(card => {
                const cardModelo = card.getAttribute('data-modelo');
                const cardCombustivel = card.getAttribute('data-combustivel');

                // Verifica se o card bate com o modelo e com o combustível selecionado
                const matchModelo = (modeloSelecionado === 'todos' || modeloSelecionado === cardModelo);
                const matchCombustivel = (combustivelSelecionado === 'todos' || combustivelSelecionado === cardCombustivel);

                if (matchModelo && matchCombustivel) {
                    card.style.display = 'flex'; // Mostra o card
                    card.classList.remove('is-filter-hidden');
                    visibleCards += 1;
                } else {
                    card.style.display = 'none'; // Esconde o card
                    card.classList.add('is-filter-hidden');
                }
            });

            if (showroomGrid) {
                showroomGrid.dataset.visibleCards = String(visibleCards);
                showroomGrid.classList.toggle('is-filtered', modeloSelecionado !== 'todos' || combustivelSelecionado !== 'todos');
                showroomGrid.classList.toggle('has-few-cards', visibleCards > 0 && visibleCards <= 2);
            }
        }

/// Adiciona um "ouvidor" para cada clique nos botões de filtro
        filterRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                aplicarFiltros(); // Filtra os caminhões
                
                // Faz a tela subir suavemente para o topo
                document.querySelector('.showroom-header')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        });

        // Configuração do botão "Reset do Filtro"
        if (btnResetFiltros) {
            btnResetFiltros.addEventListener('click', () => {
                document.querySelector('input[name="modelo"][value="todos"]').checked = true;
                document.querySelector('input[name="combustivel"][value="todos"]').checked = true;
                aplicarFiltros(); // Reseta os caminhões
                
                // Também faz a tela subir ao resetar
                document.querySelector('.showroom-header')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            });
        }
        
    } // ðŸŒŸ A CHAVE QUE FALTAVA: Essa chave fecha o "if" dos filtros

}); // Fim do DOMContentLoaded

function initFotonCumminsSlider() {
    if (window.fotonCumminsSlider) return;

    const cumminsSection = document.querySelector('.cummins-section');
    const cumminsSlides = Array.from(document.querySelectorAll('[data-cummins-slide]'));
    const cumminsPrev = document.querySelector('.cummins-arrow-prev');
    const cumminsNext = document.querySelector('.cummins-arrow-next');
    const cumminsDots = Array.from(document.querySelectorAll('.cummins-dots button'));

    if (!cumminsSection || cumminsSection.classList.contains('cummins-static') || cumminsSlides.length === 0) return;

    let currentCumminsSlide = 0;
    let cumminsAutoplay = null;

    const renderCumminsSlide = (nextIndex) => {
        currentCumminsSlide = (nextIndex + cumminsSlides.length) % cumminsSlides.length;

        cumminsSlides.forEach((slide, index) => {
            slide.classList.toggle('is-active', index === currentCumminsSlide);
            slide.setAttribute('aria-hidden', index === currentCumminsSlide ? 'false' : 'true');
        });

        cumminsDots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === currentCumminsSlide);
            dot.setAttribute('aria-current', index === currentCumminsSlide ? 'true' : 'false');
        });
    };

    const goToNextCummins = () => renderCumminsSlide(currentCumminsSlide + 1);
    const goToPrevCummins = () => renderCumminsSlide(currentCumminsSlide - 1);

    const stopCumminsAutoplay = () => {
        if (!cumminsAutoplay) return;
        clearInterval(cumminsAutoplay);
        cumminsAutoplay = null;
    };

    const startCumminsAutoplay = () => {
        stopCumminsAutoplay();
        cumminsAutoplay = setInterval(goToNextCummins, 6500);
    };

    cumminsPrev?.addEventListener('click', () => {
        goToPrevCummins();
        startCumminsAutoplay();
    });

    cumminsNext?.addEventListener('click', () => {
        goToNextCummins();
        startCumminsAutoplay();
    });

    cumminsDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            renderCumminsSlide(index);
            startCumminsAutoplay();
        });
    });

    cumminsSection.addEventListener('mouseenter', stopCumminsAutoplay);
    cumminsSection.addEventListener('mouseleave', startCumminsAutoplay);
    cumminsSection.addEventListener('focusin', stopCumminsAutoplay);
    cumminsSection.addEventListener('focusout', startCumminsAutoplay);

    window.fotonCumminsSlider = {
        next: goToNextCummins,
        prev: goToPrevCummins,
        goTo: renderCumminsSlide
    };

    renderCumminsSlide(0);
    startCumminsAutoplay();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFotonCumminsSlider, { once: true });
} else {
    initFotonCumminsSlider();
}

function initDeferredDealerMaps() {
    const deferredMaps = document.querySelectorAll('.dealer-map-deferred');
    if (!deferredMaps.length) return;

    const isMobileLike = window.matchMedia('(max-width: 820px), (hover: none) and (pointer: coarse)').matches;

    if (isMobileLike) {
        deferredMaps.forEach((map) => {
            map.classList.add('is-mobile-disabled');
        });
        return;
    }

    const loadMap = (map) => {
        if (!map.dataset.mapSrc || map.querySelector('iframe')) return;

        const iframe = document.createElement('iframe');
        iframe.src = map.dataset.mapSrc;
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.title = map.dataset.mapTitle || 'Mapa da concessionaria';
        map.appendChild(iframe);
        map.classList.add('is-loaded');
    };

    const scheduleMapLoad = (map) => {
        if (map.dataset.mapScheduled === 'true') return;
        map.dataset.mapScheduled = 'true';

        const run = () => loadMap(map);

        if ('requestIdleCallback' in window) {
            requestIdleCallback(run, { timeout: 1200 });
        } else {
            setTimeout(run, 650);
        }
    };

    if (!('IntersectionObserver' in window)) {
        deferredMaps.forEach(scheduleMapLoad);
        return;
    }

    const mapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            scheduleMapLoad(entry.target);
            observer.unobserve(entry.target);
        });
    }, {
        rootMargin: '360px 0px',
        threshold: 0.01
    });

    deferredMaps.forEach((map) => {
        mapObserver.observe(map);
    });

    deferredMaps.forEach((map, index) => {
        setTimeout(() => scheduleMapLoad(map), 1800 + (index * 900));
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDeferredDealerMaps, { once: true });
} else {
    initDeferredDealerMaps();
}

/* =======================================================
   AUTORIZACAO DE COOKIES PARA MONITORAMENTO
   ======================================================= */
function initCookieConsent() {
    const storageKey = 'foton_cookies_accepted_v1';
    let savedConsent = 'pending';

    try {
        const savedValue = localStorage.getItem(storageKey);
        if (savedValue === 'true' || savedValue === 'granted') savedConsent = 'granted';
        if (savedValue === 'false' || savedValue === 'denied') savedConsent = 'denied';
    } catch (error) {
        savedConsent = 'pending';
    }

    function notifyConsent(status) {
        const isGranted = status === 'granted';
        document.documentElement.dataset.trackingConsent = status;
        window.fotonConsent = {
            hasTrackingConsent: () => isGranted,
            status: () => status
        };
        window.dispatchEvent(new CustomEvent('foton:tracking-consent-changed', {
            detail: { status }
        }));
        if (isGranted) {
            window.dispatchEvent(new CustomEvent('foton:tracking-consent-granted'));
        }
    }

    if (savedConsent !== 'pending') {
        notifyConsent(savedConsent);
        return;
    }

    document.documentElement.dataset.trackingConsent = 'pending';
    document.body.classList.add('cookie-lock');
    window.fotonConsent = { hasTrackingConsent: () => false };

    const consentLayer = document.createElement('div');
    consentLayer.className = 'cookie-gate';
    consentLayer.innerHTML = `
        <div class="cookie-gate-backdrop" aria-hidden="true"></div>
        <section class="cookie-gate-dialog" role="dialog" aria-modal="true" aria-labelledby="cookieGateTitle" aria-describedby="cookieGateText">
            <div class="cookie-gate-copy">
                <span>Privacidade e cookies</span>
                <h2 id="cookieGateTitle">Utilizamos cookies</h2>
                <p id="cookieGateText">Com sua permiss&atilde;o, usamos cookies de medi&ccedil;&atilde;o para entender a navega&ccedil;&atilde;o e melhorar nossos ve&iacute;culos e servi&ccedil;os. Voc&ecirc; pode recusar sem perder o acesso ao site.</p>
            </div>
            <div class="cookie-gate-actions">
                <button type="button" class="cookie-gate-reject">Recusar</button>
                <button type="button" class="cookie-gate-accept">Aceitar cookies</button>
            </div>
        </section>
    `;
    document.body.appendChild(consentLayer);

    const acceptButton = consentLayer.querySelector('.cookie-gate-accept');
    const rejectButton = consentLayer.querySelector('.cookie-gate-reject');
    const focusableButtons = [rejectButton, acceptButton];
    const keepFocusOnConsent = (event) => {
        if (event.key !== 'Tab') return;
        const currentIndex = focusableButtons.indexOf(document.activeElement);
        const nextIndex = event.shiftKey
            ? (currentIndex <= 0 ? focusableButtons.length - 1 : currentIndex - 1)
            : (currentIndex >= focusableButtons.length - 1 ? 0 : currentIndex + 1);
        event.preventDefault();
        focusableButtons[nextIndex].focus();
    };
    const preventOutsideFocus = (event) => {
        if (!consentLayer.contains(event.target)) {
            acceptButton.focus();
        }
    };

    document.addEventListener('keydown', keepFocusOnConsent);
    document.addEventListener('focusin', preventOutsideFocus);
    acceptButton.focus();
    const finishConsent = (status) => {
        try {
            localStorage.setItem(storageKey, status);
        } catch (error) {
            // A escolha ainda permanece valida durante esta navegacao.
        }

        document.removeEventListener('keydown', keepFocusOnConsent);
        document.removeEventListener('focusin', preventOutsideFocus);
        document.body.classList.remove('cookie-lock');
        consentLayer.classList.add('is-closing');
        setTimeout(() => consentLayer.remove(), 260);
        notifyConsent(status);
    };

    acceptButton.addEventListener('click', () => finishConsent('granted'));
    rejectButton.addEventListener('click', () => finishConsent('denied'));
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieConsent, { once: true });
} else {
    initCookieConsent();
}

/* =======================================================
   ENVIO DOS FORMULARIOS PARA A API DE LEADS
   ======================================================= */
function initLeadForms() {
    const forms = document.querySelectorAll('form[data-lead-form]');
    if (!forms.length) return;

    // Em producao, site e API usam o mesmo dominio. A excecao abaixo existe
    // somente para previews locais (ex.: Live Server na porta 5500).
    const isLocalPreview = ['localhost', '127.0.0.1'].includes(window.location.hostname)
        && window.location.port
        && window.location.port !== '3000';
    const localApiUrl = `${window.location.protocol}//${window.location.hostname}:3000/api/leads`;
    const apiUrl = window.FOTON_LEADS_API_URL || (isLocalPreview ? localApiUrl : '/api/leads');

    const getUtm = (key) => new URLSearchParams(window.location.search).get(key) || null;

    const createRequestId = () => {
        if (window.crypto?.randomUUID) return window.crypto.randomUUID();
        const bytes = new Uint8Array(16);
        window.crypto.getRandomValues(bytes);
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'));
        return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
    };

    const normalizeLabel = (text) => text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\*/g, '')
        .trim();

    const getFieldValue = (form, names) => {
        for (const name of names) {
            const directField = form.elements.namedItem(name);
            if (directField && typeof directField.value === 'string') {
                return directField.value.trim() || null;
            }
        }

        const normalizedNames = names.map(normalizeLabel);
        const groups = form.querySelectorAll('.input-group');

        for (const group of groups) {
            const label = group.querySelector('label');
            const field = group.querySelector('input, select, textarea');

            if (!label || !field) continue;

            const labelText = normalizeLabel(label.textContent || '');

            if (normalizedNames.includes(labelText)) {
                return field.value?.trim() || null;
            }
        }

        return null;
    };

    const setFormMessage = (form, message, type) => {
        let messageBox = form.querySelector('[data-form-message]');

        if (!messageBox) {
            messageBox = document.createElement('div');
            messageBox.setAttribute('data-form-message', '');
            messageBox.style.marginTop = '14px';
            messageBox.style.fontWeight = '700';
            form.appendChild(messageBox);
        }

        messageBox.textContent = message;
        messageBox.style.color = type === 'success' ? '#19b36b' : '#d93025';
    };

    const getTestDriveModel = (form) => {
        if (form.dataset.leadForm !== 'test_drive') return null;
        return document.getElementById('tdModeloSelect')?.value?.trim() || null;
    };

    forms.forEach((form) => {
        if (!form.querySelector('[name="lgpdConsent"]')) {
            const consentLabel = document.createElement('label');
            consentLabel.className = 'lead-consent';
            consentLabel.innerHTML = `
                <input type="checkbox" name="lgpdConsent" required>
                <span>Autorizo o uso dos meus dados exclusivamente para o atendimento desta solicita&ccedil;&atilde;o.</span>
            `;
            const submitButton = form.querySelector('[type="submit"]');
            form.insertBefore(consentLabel, submitButton);
        }

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            if (form.dataset.submitting === 'true') return;

            if (!form.reportValidity()) return;

            const testDriveModelSelect = form.dataset.leadForm === 'test_drive'
                ? document.getElementById('tdModeloSelect')
                : null;

            if (testDriveModelSelect && !testDriveModelSelect.value) {
                testDriveModelSelect.setCustomValidity('Selecione o modelo para agendar o test drive.');
                testDriveModelSelect.reportValidity();
                testDriveModelSelect.focus();
                setFormMessage(form, 'Selecione o modelo antes de agendar o test drive.', 'error');
                return;
            }

            if (testDriveModelSelect) {
                testDriveModelSelect.setCustomValidity('');
            }

            const submitButton = form.querySelector('[type="submit"]');
            const originalText = submitButton?.textContent;
            const requestId = form.dataset.pendingRequestId || createRequestId();
            form.dataset.pendingRequestId = requestId;
            form.dataset.submitting = 'true';

            const payload = {
                formType: form.dataset.leadForm || 'contact',
                name: getFieldValue(form, ['name', 'nome', 'nome completo']),
                email: getFieldValue(form, ['email', 'e-mail']),
                phone: getFieldValue(form, ['phone', 'telefone', 'celular']),
                document: getFieldValue(form, ['document', 'cpf/cnpj']),
                dealershipUnit: getFieldValue(form, ['dealershipUnit', 'unidade', 'unidade de preferencia']),
                state: getFieldValue(form, ['state', 'estado']),
                city: getFieldValue(form, ['city', 'cidade']),
                model: getFieldValue(form, ['model', 'modelo']) || getTestDriveModel(form),
                department: getFieldValue(form, ['department', 'departamento']),
                serviceType: getFieldValue(form, ['serviceType', 'servico']),
                preferredDate: getFieldValue(form, ['preferredDate', 'data preferencial']),
                preferredTime: getFieldValue(form, ['preferredTime', 'horario']),
                message: getFieldValue(form, ['message', 'mensagem']),
                pageUrl: `${window.location.origin}${window.location.pathname}`,
                utmSource: getUtm('utm_source'),
                utmMedium: getUtm('utm_medium'),
                utmCampaign: getUtm('utm_campaign'),
                utmTerm: getUtm('utm_term'),
                utmContent: getUtm('utm_content'),
                gclid: getUtm('gclid'),
                fbclid: getUtm('fbclid'),
                lgpdConsent: Boolean(form.querySelector('[name="lgpdConsent"]:checked'))
            };

            let httpStatusGroup = 'unknown';
            let errorType = 'network_error';

            try {
                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'ENVIANDO...';
                }

                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Idempotency-Key': requestId
                    },
                    body: JSON.stringify(payload)
                });
                httpStatusGroup = `${Math.floor(response.status / 100)}xx`;

                const result = await response.json().catch(() => ({}));

                if (!response.ok || !result.ok) {
                    errorType = response.ok ? 'api_rejected' : 'http_error';
                    throw new Error(result.message || 'Nao foi possivel enviar o formulario.');
                }

                setFormMessage(form, 'Solicitacao enviada com sucesso.', 'success');
                form.dispatchEvent(new CustomEvent('foton:lead-form-result', {
                    bubbles: true,
                    detail: { status: 'success' }
                }));
                delete form.dataset.pendingRequestId;
                form.reset();
            } catch (error) {
                const isNetworkError = error instanceof TypeError;
                if (isNetworkError) {
                    errorType = 'network_error';
                }
                const userMessage = isNetworkError
                    ? 'Nao foi possivel conectar ao servidor. Verifique se o site foi iniciado com npm start e tente novamente.'
                    : (error.message || 'Erro ao enviar. Tente novamente.');
                setFormMessage(form, userMessage, 'error');
                form.dispatchEvent(new CustomEvent('foton:lead-form-result', {
                    bubbles: true,
                    detail: { status: 'error', errorType, httpStatusGroup }
                }));
            } finally {
                delete form.dataset.submitting;
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = originalText;
                }
            }
        });
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLeadForms, { once: true });
} else {
    initLeadForms();
}


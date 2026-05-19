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
        document.querySelectorAll('.models-section, .seminovos-section').forEach(sec => {
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

    document.querySelectorAll('.models-section, .seminovos-section, .cummins-section, .dealers-section').forEach(section => {
        sectionObserver.observe(section);
    });

    /* --- 4.1. SLIDER PREMIUM CUMMINS --- */
    const cumminsSection = document.querySelector('.cummins-section');
    const cumminsSlides = Array.from(document.querySelectorAll('[data-cummins-slide]'));
    const cumminsPrev = document.querySelector('.cummins-arrow-prev');
    const cumminsNext = document.querySelector('.cummins-arrow-next');
    const cumminsDots = Array.from(document.querySelectorAll('.cummins-dots button'));

    if (cumminsSection && !cumminsSection.classList.contains('cummins-static') && cumminsSlides.length > 0) {
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
        window.fotonCumminsSlider = {
            next: goToNextCummins,
            prev: goToPrevCummins,
            goTo: renderCumminsSlide
        };

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
        cumminsSection.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                goToPrevCummins();
                startCumminsAutoplay();
            }

            if (event.key === 'ArrowRight') {
                goToNextCummins();
                startCumminsAutoplay();
            }
        });

        renderCumminsSlide(0);
        startCumminsAutoplay();
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
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
            .then(res => res.json())
            .then(estados => {
                estadoSelect.innerHTML = '<option value="" disabled selected>Selecione o estado</option>';
                estados.forEach(estado => {
                    const option = document.createElement('option');
                    option.value = estado.sigla; 
                    option.textContent = estado.nome;
                    estadoSelect.appendChild(option);
                });
            })
            .catch(error => {
                console.error("Erro ao buscar estados:", error);
            });

        estadoSelect.addEventListener('change', function() {
            const uf = this.value; 
            cidadeSelect.innerHTML = '<option value="" disabled selected>Carregando cidades...</option>';
            cidadeSelect.disabled = true;

            fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
                .then(res => res.json())
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
                    cidadeSelect.innerHTML = '<option value="" disabled>Erro ao carregar</option>';
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

    function openSidebar() {
        if(sidebar) sidebar.classList.add('active');
        if(sidebarOverlay) sidebarOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; 
    }

    function closeSidebar() {
        if(sidebar) sidebar.classList.remove('active');
        if(sidebarOverlay) sidebarOverlay.classList.remove('active');
        document.body.style.overflow = ''; 
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', openSidebar);
        closeSidebarBtn.addEventListener('click', closeSidebar);
        sidebarOverlay.addEventListener('click', closeSidebar);

        sidebarLinksElements.forEach(link => {
            link.addEventListener('click', closeSidebar);
        });
    }

    /* --- 12. AUTO-PREENCHIMENTO DO MODELO (CONTATO E TEST DRIVE) --- */
    const urlParams = new URLSearchParams(window.location.search);
    const modeloSelecionado = urlParams.get('modelo');

    const mapaModelosGeral = {
        'aumark-s-315': 'Aumark S 315',
        'aumark-s-715': 'Aumark S 715',
        'aumark-s-916': 'Aumark S 916',
        'aumark-s-1217': 'Aumark S 1217',
        'iblue': 'iBlue EV',
        'auman-d-1722': 'Auman D 1722',
        'tunland': 'Tunland EV',
        'ewonder': 'eWonder',
        'etoano-pro': 'eToano Pro',
        'eview-grand': 'eView Grand',
        'eview-connect': 'eView Connect',
        'eaumark': 'eAumark'
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
        const imagensModelos = {
            "Aumark S 315": "assets/modelo_1.webp",
            "Aumark S 715": "assets/modelo_2.webp",
            "Aumark S 916": "assets/modelo_2.webp",
            "Aumark S 1217": "assets/modelo_2.webp",
            "iBlue EV": "assets/modelo_3.webp",
            "Auman D 1722": "assets/modelo_4.webp",
            "Tunland EV": "assets/modelo_5.webp",
            "eWonder": "assets/modelo_6.webp",
            "eToano Pro": "assets/modelo_7.webp",
            "eView Grand": "assets/modelo_8.webp",
            "eView Connect": "assets/modelo_9.webp",
            "eAumark": "assets/modelo_10.webp"
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
    const hoje = new Date().toISOString().split('T')[0];
    inputData.setAttribute('min', hoje); // Define a data mínima como hoje
}/* --- 14. SISTEMA DE FILTROS (PÁGINA NOVOS.HTML ESTILO PORSCHE) --- */
    const filterRadios = document.querySelectorAll('.filters-sidebar input[type="radio"]');
    const porscheCards = document.querySelectorAll('.porsche-card');
    const btnResetFiltros = document.getElementById('btnResetFiltros');

    if (filterRadios.length > 0 && porscheCards.length > 0) {
        
        // Função principal que lê os filtros e esconde/mostra os cards
        function aplicarFiltros() {
            // Pega o valor dos radios marcados. Se nenhum estiver, usa 'todos'
            const modeloSelecionado = document.querySelector('input[name="modelo"]:checked')?.value || 'todos';
            const combustivelSelecionado = document.querySelector('input[name="combustivel"]:checked')?.value || 'todos';

            porscheCards.forEach(card => {
                const cardModelo = card.getAttribute('data-modelo');
                const cardCombustivel = card.getAttribute('data-combustivel');

                // Verifica se o card bate com o modelo e com o combustível selecionado
                const matchModelo = (modeloSelecionado === 'todos' || modeloSelecionado === cardModelo);
                const matchCombustivel = (combustivelSelecionado === 'todos' || combustivelSelecionado === cardCombustivel);

                if (matchModelo && matchCombustivel) {
                    card.style.display = 'flex'; // Mostra o card
                } else {
                    card.style.display = 'none'; // Esconde o card
                }
            });
        }

/// Adiciona um "ouvidor" para cada clique nos botões de filtro
        filterRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                aplicarFiltros(); // Filtra os caminhões
                
                // Faz a tela subir suavemente para o topo
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
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
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
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




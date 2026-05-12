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

    document.querySelectorAll('.models-section, .seminovos-section').forEach(section => {
        sectionObserver.observe(section);
    });

    /* --- 5. SLIDER DE MODELOS --- */
    const track = document.getElementById('sliderTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const cards = document.querySelectorAll('.model-card');

    let currentIndex = 0;
    let totalCards = cards ? cards.length : 0;

    function getCardWidth() {
        if (!cards || !cards.length) return 0;
        const trackStyle = window.getComputedStyle(track);
        const gap = parseFloat(trackStyle.gap) || 0;
        return cards[0].getBoundingClientRect().width + gap;
    }

    function updateSlider() {
        if (!cards || !cards.length || !track) return;

        const cardWidth = getCardWidth();
        track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;

        const viewportWidth = track.parentElement.getBoundingClientRect().width;
        const cardsVisible = Math.round(viewportWidth / cardWidth);
        const maxIndex = totalCards - cardsVisible;

        if (prevBtn) prevBtn.disabled = currentIndex <= 0;
        if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    if (nextBtn && prevBtn) {
        nextBtn.addEventListener('click', () => {
            const cardWidth = getCardWidth();
            const viewportWidth = track.parentElement.getBoundingClientRect().width;
            const cardsVisible = Math.round(viewportWidth / cardWidth);
            const maxIndex = totalCards - cardsVisible;

            if (currentIndex < maxIndex) {
                currentIndex++;
                updateSlider();
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        });
    }

    window.addEventListener('resize', updateSlider);
    setTimeout(updateSlider, 100);

    /* --- 6. SWIPE DO SLIDER NO CELULAR --- */
    if (track) {
        let touchStartX = 0;
        let touchEndX = 0;

        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].clientX; 
        }, { passive: true });

        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].clientX;
            const minSwipeDistance = 40; 
            if (touchEndX < touchStartX - minSwipeDistance) {
                if(nextBtn && !nextBtn.disabled) nextBtn.click();
            }
            if (touchEndX > touchStartX + minSwipeDistance) {
                if(prevBtn && !prevBtn.disabled) prevBtn.click();
            }
        }, { passive: true });
    }

    /* --- 7. ANIMAÇÃO DOS NÚMEROS (CONTADOR) --- */
    const counters = document.querySelectorAll('.counter');
    const specsSection = document.querySelector('.aumark-specs-section');

    if (specsSection && counters.length > 0) {
        const speed = 200; 
        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText.replace(/\./g, ''); 
                    const inc = target / speed;

                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc).toLocaleString('pt-BR');
                        setTimeout(updateCount, 15);
                    } else {
                        counter.innerText = target.toLocaleString('pt-BR');
                    }
                };
                counter.innerText = '0';
                updateCount();
            });
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target); 
                }
            });
        }, { threshold: 0.5 });

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
        'aumark-s-715': 'Aumark S 715/916/1217',
        'iblue': 'IBlue',
        'auman-d-1722': 'Auman D 1722',
        'tunland': 'Tunland',
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
            "Aumark S 715/916/1217": "assets/modelo_2.webp",
            "IBlue": "assets/modelo_3.webp",
            "Auman D 1722": "assets/modelo_4.webp",
            "Tunland": "assets/modelo_5.webp",
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
        
    } // 🌟 A CHAVE QUE FALTAVA: Essa chave fecha o "if" dos filtros

}); // Fim do DOMContentLoaded
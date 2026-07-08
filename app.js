/* ==========================================================================
   MRT AÉREO - ELITE CREATIVE CODING ENGINE (JS ESM) - PARTICLES BACKGROUND
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Inicializador geral do site
function initApp() {
    // Se o GSAP não estiver disponível por falha de carregamento do CDN,
    // revelamos o body e o site imediatamente de forma direta (fallback)
    if (typeof gsap === 'undefined') {
        console.error("GSAP CDN não carregado. Ativando fallback estático.");
        document.body.style.overflow = "";
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";

        // Tenta iniciar a cena 3D se THREE estiver carregado
        try { initHeroScene(); } catch (e) { console.error(e); }
        try { initLightbox(); } catch (e) { console.error(e); }
        return;
    }

    // 1. Desativar scroll nativo temporariamente no carregamento
    document.body.style.overflow = "hidden";

    // 2. Animar Loader e Revelações Iniciais (GSAP)
    try { initLoader(); } catch (e) { console.error(e); }

    // 3. Iniciar Cena 3D Principal (Three.js + Background de Partículas Fluidas)
    try { initHeroScene(); } catch (e) { console.error(e); }

    // 4. Iniciar Shaders GLSL de Distorção nos Cards de Portfólio
    try { initPortfolioShaders(); } catch (e) { console.error(e); }

    // 5. Iniciar Cursor Personalizado Inteligente
    try { initCustomCursor(); } catch (e) { console.error(e); }

    // 6. Iniciar Carrossel de Imagens de Background do Hero
    try { initHeroCarousel(); } catch (e) { console.error(e); }

    // 7. Iniciar Transições Suaves de Seção por Seção (GSAP ScrollTrigger)
    try { initSectionTransitions(); } catch (e) { console.error(e); }

    // 8. Iniciar visualizador de imagens do portfólio (Lightbox)
    try { initLightbox(); } catch (e) { console.error(e); }

    // 9. Iniciar interceptor de formulário de contato (WhatsApp)
    try { initContactForm(); } catch (e) { console.error(e); }

    // 10. Iniciar menu responsivo (mobile menu)
    try { initMobileMenu(); } catch (e) { console.error(e); }
}

// Previne condição de corrida do ciclo de vida em scripts carregados como tipo módulo
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}

/* ==========================================
   B. KINETIC LOADER & ENTER TRANSITIONS (GSAP)
   ========================================== */
function initLoader() {
    const tl = gsap.timeline({
        onComplete: () => {
            document.body.style.overflow = ""; // Reativar scroll original
            const loader = document.getElementById("loader");
            if (loader) loader.style.display = "none";
        }
    });

    gsap.set(".header", { y: -80, opacity: 0 });
    gsap.set(".reveal-word", { y: "105%" });
    gsap.set(".reveal-line", { y: "105%" });
    gsap.set(".hero-desc", { y: 30, opacity: 0 });
    gsap.set(".hero-cta-group", { y: 40, opacity: 0 });

    tl.to(".loader-letter", {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power4.out"
    })
        .to(".loader-letter", {
            letterSpacing: "40px",
            scale: 1.15,
            opacity: 0,
            duration: 1.0,
            ease: "power3.inOut"
        }, "+=0.3")
        .to(".loader-sub", {
            opacity: 0,
            y: -15,
            duration: 0.5,
            ease: "power3.in"
        }, "-=0.8")
        .to(".loader-container", {
            y: "-100%",
            duration: 0.85,
            ease: "power4.inOut",
            onComplete: () => {
                const loader = document.getElementById("loader");
                if (loader) loader.style.display = "none";
            }
        }, "-=0.3")

        .to(".header", {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out"
        }, "-=0.1")
        .to(".reveal-word", {
            y: 0,
            duration: 0.55,
            stagger: 0.08,
            ease: "power3.out"
        }, "-=0.8")
        .to(".reveal-line", {
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power4.out"
        }, "-=0.7")
        .to(".hero-desc", {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out"
        }, "-=0.6")
        .to(".hero-cta-group", {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power3.out"
        }, "-=0.7");
}

/* ==========================================
   C. HERO 3D SCENE (Particles Wave & Mouse Parallax)
   ========================================== */
function initHeroScene() {
    const canvas = document.getElementById("canvas-webgl");
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#080907');

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    // 2. Camera Setup (Perspective)
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 250;

    // 3. Grid de Partículas (Estilo Topográfico Champagne)
    const count = 60;
    const numParticles = count * count;
    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);

    let i = 0;
    for (let x = 0; x < count; x++) {
        for (let y = 0; y < count; y++) {
            // Posicionamento espacial no plano
            positions[i] = (x - count / 2) * 16;     // X
            positions[i + 1] = 0;                    // Y
            positions[i + 2] = (y - count / 2) * 16; // Z

            // Cores (Champagne Gold suave com variação tonal)
            const ratio = x / count;
            colors[i] = 0.77 + ratio * 0.1;           // R
            colors[i + 1] = 0.64 + ratio * 0.05;      // G
            colors[i + 2] = 0.47 + ratio * 0.05;      // B

            i += 3;
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material de pontos brilhantes
    const pointsMaterial = new THREE.PointsMaterial({
        size: 3.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, pointsMaterial);
    scene.add(particles);

    // 4. Variáveis Dinâmicas & Interações (Mouse)
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    window.addEventListener("mousemove", (e) => {
        mouse.targetX = (e.clientX / width - 0.5) * 2;
        mouse.targetY = -(e.clientY / height - 0.5) * 2;
    });

    // 5. Loop de Animação com Ondulação Senoidal Tridimensional
    const waveClock = new THREE.Clock();

    function renderLoop() {
        requestAnimationFrame(renderLoop);

        const time = waveClock.getElapsedTime();
        const positionsArr = particles.geometry.attributes.position.array;

        // Ondular as partículas de forma orgânica e fluida
        let index = 0;
        for (let x = 0; x < count; x++) {
            for (let y = 0; y < count; y++) {
                const posX = positionsArr[index];
                const posZ = positionsArr[index + 2];

                // Fórmulas matemáticas cruzadas para simular ondas fluidas tridimensionais
                positionsArr[index + 1] = Math.sin(posX * 0.009 + time * 1.2) * 24 +
                    Math.cos(posZ * 0.009 + time * 1.2) * 24;

                index += 3;
            }
        }
        particles.geometry.attributes.position.needsUpdate = true;

        // Efeito de paralaxe de inclinação baseado no mouse
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        particles.rotation.y = mouse.x * 0.15;
        particles.rotation.x = -mouse.y * 0.1 + 0.45; // Angulado fixo para visualização 3D

        renderer.render(scene, camera);
    }
    renderLoop();

    // Redimensionamento responsivo do Canvas
    window.addEventListener("resize", () => {
        width = window.innerWidth;
        height = window.innerHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
}

/* ==========================================
   D. GLSL LIQUID SHADERS ON PORTFOLIO CARDS
   ========================================== */
function initPortfolioShaders() {
    const cardCanvasElements = document.querySelectorAll(".project-card-canvas");
    if (!cardCanvasElements.length) return;

    const vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    // Shader de distorção líquida em tempo real leve e sem texturas extras
    const fragmentShader = `
        uniform sampler2D uTexture;
        uniform float uTime;
        uniform float uHover;
        varying vec2 vUv;

        float waveNoise(vec2 p) {
            float wave = sin(p.x * 8.0 + uTime * 2.0) * cos(p.y * 8.0 + uTime * 2.0);
            wave += sin(p.x * 15.0 - uTime * 4.0) * 0.4;
            return wave * 0.5;
        }

        void main() {
            vec2 uv = vUv;
            
            float distortion = waveNoise(uv) * 0.08 * uHover;
            uv.x += distortion;
            uv.y += distortion * 0.5;

            if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
                discard;
            }

            vec4 color = texture2D(uTexture, uv);
            
            float vignette = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y);
            vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
            
            gl_FragColor = vec4(color.rgb * vignette, color.a);
        }
    `;

    cardCanvasElements.forEach(canvas => {
        const wrap = canvas.closest(".project-card");
        const imageUrl = canvas.getAttribute("data-image");

        let w = wrap.clientWidth;
        let h = wrap.clientHeight;

        const localScene = new THREE.Scene();

        const localCamera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
        localCamera.position.z = 2.0;

        const localRenderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
        localRenderer.setSize(w, h);
        localRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(imageUrl);
        texture.minFilter = THREE.LinearFilter;

        const uniforms = {
            uTexture: { value: texture },
            uTime: { value: 0 },
            uHover: { value: 0 }
        };

        const shaderMaterial = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: uniforms,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(1.85, 1.85);
        const mesh = new THREE.Mesh(geometry, shaderMaterial);
        localScene.add(mesh);

        let hoverObj = { value: 0 };
        let clock = new THREE.Clock();

        function renderLocal() {
            requestAnimationFrame(renderLocal);

            uniforms.uTime.value = clock.getElapsedTime();
            uniforms.uHover.value = hoverObj.value;

            localRenderer.render(localScene, localCamera);
        }
        renderLocal();

        wrap.addEventListener("mouseenter", () => {
            gsap.to(hoverObj, {
                value: 1.0,
                duration: 0.8,
                ease: "power2.out"
            });
        });

        wrap.addEventListener("mouseleave", () => {
            gsap.to(hoverObj, {
                value: 0.0,
                duration: 0.6,
                ease: "power2.out"
            });
        });

        window.addEventListener("resize", () => {
            w = wrap.clientWidth;
            h = wrap.clientHeight;
            localCamera.aspect = w / h;
            localCamera.updateProjectionMatrix();
            localRenderer.setSize(w, h);
        });
    });
}

/* ==========================================
   E. INTERACTION EFFECTS (Custom Cursor & Magnetic elements)
   ========================================== */
function initCustomCursor() {
    const cursor = document.getElementById("custom-cursor");
    if (!cursor) return;

    // Desativar em tablets, smartphones ou telas touch para evitar lag e sobreposição
    if (window.innerWidth <= 1024 || ('ontouchstart' in window) || navigator.maxTouchPoints > 0) {
        cursor.style.display = "none";
        return;
    }

    let mouse = { x: -100, y: -100 };
    let pos = { x: -100, y: -100 };

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    function updateCursor() {
        pos.x += (mouse.x - pos.x) * 0.15;
        pos.y += (mouse.y - pos.y) * 0.15;

        cursor.style.transform = `translate3d(${pos.x - 12}px, ${pos.y - 12}px, 0)`;

        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    const hoverTargets = document.querySelectorAll("a, button, select, textarea, input, [data-magnetic]");
    hoverTargets.forEach(el => {
        el.addEventListener("mouseenter", () => {
            cursor.classList.add("hover");
        });
        el.addEventListener("mouseleave", () => {
            cursor.classList.remove("hover");
        });
    });

    const cards = document.querySelectorAll(".project-card");
    cards.forEach(card => {
        card.addEventListener("mouseenter", () => {
            cursor.classList.add("card-hover");
        });
        card.addEventListener("mouseleave", () => {
            cursor.classList.remove("card-hover");
        });
    });

    const magneticElements = document.querySelectorAll("[data-magnetic]");
    if (window.innerWidth > 1024) {
        magneticElements.forEach(el => {
            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - (rect.left + rect.width / 2);
                const y = e.clientY - (rect.top + rect.height / 2);

                gsap.to(el, {
                    x: x * 0.3,
                    y: y * 0.3,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });

            el.addEventListener("mouseleave", () => {
                gsap.to(el, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1.1, 0.5)"
                });
            });
        });
    }
}

/* ==========================================
   F. PORTFOLIO SPLIT REVEALS (Intersection Observer)
   ========================================== */
const splitTextElements = document.querySelectorAll(".js-split-text");
splitTextElements.forEach(el => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);
    el.innerHTML = "";

    words.forEach(word => {
        const span = document.createElement("span");
        span.classList.add("word");
        span.textContent = word;
        el.appendChild(span);
    });

    const spans = el.querySelectorAll("span.word");
    const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                spans.forEach((span, index) => {
                    setTimeout(() => {
                        span.classList.add("in-view");
                    }, index * 30);
                });
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    obs.observe(el);
});

const revealItems = document.querySelectorAll(".reveal-item");
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

revealItems.forEach((item, idx) => {
    item.style.transitionDelay = `${idx * 0.12}s`;
    revealObs.observe(item);
});

let lastScrollY = 0;
const mainHeader = document.getElementById("main-header");
window.addEventListener("scroll", () => {
    const scrollY = window.scrollY;
    if (scrollY <= 60) {
        if (mainHeader) mainHeader.classList.remove("hide");
        return;
    }
    if (scrollY > lastScrollY) {
        if (mainHeader) mainHeader.classList.add("hide");
    } else {
        if (mainHeader) mainHeader.classList.remove("hide");
    }
    lastScrollY = scrollY;
});

/* ==========================================
   E. HERO BACKGROUND CAROUSEL (Crossfade Rotation)
   ========================================== */
function initHeroCarousel() {
    const slides = document.querySelectorAll(".hero-carousel-slide");
    if (slides.length === 0) return;

    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }, 5000); // Roda a cada 5 segundos
}

/* ==========================================
   F. TRANSITIONS DE SEÇÃO (GSAP ScrollTrigger)
   ========================================== */
function initSectionTransitions() {
    if (typeof ScrollTrigger === 'undefined') {
        console.warn("ScrollTrigger não está disponível. Transições de seção ignoradas.");
        return;
    }

    try {
        gsap.registerPlugin(ScrollTrigger);

        // Selecionar blocos internos de conteúdo para animar, evitando mudar a tag section inteira
        const targets = document.querySelectorAll(".about-content, .section-header, .projects-grid, .services-list, .contact-container");

        targets.forEach((target) => {
            gsap.fromTo(target,
                {
                    opacity: 0,
                    y: 40
                },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1.2,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: target,
                        start: "top 90%",
                        toggleActions: "play none none none", // Uma animação de entrada limpa e mais estável
                        markers: false
                    }
                }
            );
        });
    } catch (e) {
        console.error("Erro ao registrar ScrollTrigger no GSAP:", e);
    }
}

/* ==========================================
   G. LIGHTBOX INTERATIVO DO PORTFÓLIO
   ========================================== */
function initLightbox() {
    const cards = document.querySelectorAll(".project-card");
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCategory = document.getElementById("lightbox-category");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCounter = document.getElementById("lightbox-counter");
    const closeBtn = document.getElementById("lightbox-close");
    const prevBtn = document.getElementById("lightbox-prev");
    const nextBtn = document.getElementById("lightbox-next");

    if (!lightbox || cards.length === 0) return;

    // Banco de Imagens completo com todas as mídias da galeria e slides do background (8 no total)
    const galleryImages = [
        { src: 'assets/conteudo1.jpeg', title: 'Piloto DJI mini 4K', category: 'TECNOLOGIA E EQUIPAMENTO' },
        { src: 'assets/conteudo2.jpeg', title: 'Cachoeiras de Capitólio', category: 'IMAGENS AÉREAS' },
        { src: 'assets/conteudo3.jpeg', title: 'Imagens aéreas de Campos', category: 'PRODUÇÃO EXCLUSIVA' },
        { src: 'assets/conteudo4.jpeg', title: 'Topografia de Áreas', category: 'EQUIPAMENTO E BASE' },
        { src: 'assets/conteudo5.jpeg', title: 'Cobertura Vegetal', category: 'IMAGENS DE LUXO' },
        { src: 'assets/conteudo6.jpeg', title: 'Monitoramento de Área', category: 'PERSPECTIVAS CRIATIVAS' },
        { src: 'assets/conteudo7.jpeg', title: 'Monitoramento de Lavouras', category: 'CINEMA E MONITORAMENTO' },
    ];

    let currentIndex = 0;

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxContent();
        lightbox.classList.add("active");
        document.body.style.overflow = "hidden"; // Trava o scroll
    }

    function closeLightbox() {
        lightbox.classList.remove("active");
        document.body.style.overflow = ""; // Restaura o scroll
        setTimeout(() => {
            lightboxImg.style.opacity = "0";
            lightboxImg.style.transform = "scale(0.95)";
        }, 300);
    }

    function updateLightboxContent() {
        // Transição sutil de saída da imagem anterior
        lightboxImg.style.opacity = "0";
        lightboxImg.style.transform = "scale(0.95)";

        setTimeout(() => {
            const item = galleryImages[currentIndex];
            lightboxImg.src = item.src;
            lightboxCategory.innerText = item.category;
            lightboxTitle.innerText = item.title;
            lightboxCounter.innerText = `${currentIndex + 1} / ${galleryImages.length}`;

            // Reflow do browser para re-animar a nova foto
            lightboxImg.offsetHeight;
            lightboxImg.style.opacity = "1";
            lightboxImg.style.transform = "scale(1)";
        }, 150);
    }

    // Vincula clique em cada card da galeria
    console.log("initLightbox: vinculando cliques em", cards.length, "cards.");
    cards.forEach((card, index) => {
        card.addEventListener("click", () => {
            console.log("Card clicado via event listener, abrindo lightbox no índice:", index);
            openLightbox(index);
        });
    });

    closeBtn.addEventListener("click", closeLightbox);

    // Clicar no fundo fecha
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxContent();
    });

    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryImages.length;
        updateLightboxContent();
    });

    // Teclas direcionais
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") {
            currentIndex = (currentIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightboxContent();
        }
        if (e.key === "ArrowRight") {
            currentIndex = (currentIndex + 1) % galleryImages.length;
            updateLightboxContent();
        }
    });
}

// Interceptador e formatador de orçamento para WhatsApp
function initContactForm() {
    const contactForm = document.getElementById("contact-form");
    if (!contactForm) return;

    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();

        const projectTypeSelect = document.getElementById("project-type");
        const projectTypeText = projectTypeSelect ? projectTypeSelect.options[projectTypeSelect.selectedIndex].text : "N/A";

        const message = document.getElementById("message").value.trim();

        // Montar a mensagem estruturada
        const whatsappText = `Olá! Gostaria de solicitar um orçamento para meu projeto.\n\n` +
            `*Nome/Empresa:* ${name}\n` +
            `*E-mail:* ${email}\n` +
            `*Foco do Projeto:* ${projectTypeText}\n` +
            `*Expectativas:* ${message}`;

        const whatsappUrl = `https://wa.me/553196429501?text=${encodeURIComponent(whatsappText)}`;

        // Abrir WhatsApp em nova aba
        window.open(whatsappUrl, "_blank");
    });
}

// Menu interativo mobile hambúrguer
function initMobileMenu() {
    const menuToggle = document.getElementById("menu-toggle");
    const headerNav = document.querySelector(".header-nav");

    console.log("initMobileMenu: elements loaded", { menuToggle, headerNav });

    if (!menuToggle || !headerNav) return;

    menuToggle.addEventListener("click", () => {
        console.log("menuToggle clicked! Current classes:", menuToggle.className, headerNav.className);
        menuToggle.classList.toggle("active");
        headerNav.classList.toggle("active");

        // Travar scroll do body quando menu está aberto
        if (headerNav.classList.contains("active")) {
            console.log("menu open, body overflow hidden");
            document.body.style.overflow = "hidden";
        } else {
            console.log("menu closed, body overflow dynamic");
            document.body.style.overflow = "";
        }
    });

    // Fechar menu ao clicar em qualquer link
    const navLinks = headerNav.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
        link.addEventListener("click", () => {
            console.log("navLink clicked", link.getAttribute("href"));
            menuToggle.classList.remove("active");
            headerNav.classList.remove("active");
            document.body.style.overflow = "";
        });
    });
}

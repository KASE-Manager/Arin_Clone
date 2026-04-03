/* ARIN MHC - Main JavaScript */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Register GSAP Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // 2. Swiper (Hero Slider)
    const heroSwiper = new Swiper('.hero-swiper', {
        loop: false,
        speed: 1000,
        effect: 'fade'
    });

    // ─────────────────────────────────────────────
    // 3. Full-Page Section Navigation
    //    Intercepts wheel / touch events and scrolls
    //    exactly one section at a time. No bleed-through.
    // ─────────────────────────────────────────────
    const sectionSelectors = [
        '.hero',
        '#section-mission',
        '#section-kase',
        '#section-influencer',
        '#section-values',
    ];
    const sections = sectionSelectors.map(s => document.querySelector(s)).filter(Boolean);

    let currentIndex = 0;
    let isAnimating = false;
    let touchStartY = 0;

    // ─────────────────────────────────────────────
    // 3. Navigation Helper
    //    Used for header links and indicator clicks.
    // ─────────────────────────────────────────────
    function goToSection(index) {
        if (index < 0 || index >= sections.length) return;

        currentIndex = index;

        // Logical scroll position target
        let scrollTarget = sections[index];
        const serviceCards = ['#section-kase', '#section-doko', '#section-influencer'];
        
        const cardIndex = serviceCards.indexOf(sectionSelectors[index]);
        if (cardIndex !== -1) {
            const wrapper = document.querySelector('.services-stack-wrapper');
            if (wrapper) {
                // With pin: true and end: "+=300%":
                // Total pinning distance is 3x viewport height.
                const pinDuration = window.innerHeight * 3;
                if (cardIndex === 0) scrollTarget = wrapper.offsetTop;
                else if (cardIndex === 1) scrollTarget = wrapper.offsetTop + (pinDuration * 0.45);
                else if (cardIndex === 2) scrollTarget = wrapper.offsetTop + (pinDuration * 0.9);
            }
        }

        gsap.to(window, {
            scrollTo: { y: scrollTarget, offsetY: 0 },
            duration: 1.0,
            ease: 'power2.inOut'
        });
    }

    // REMOVED manual wheel/touch interception to allow native "detailed" scroll

    // Handle nav-link clicks
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionIndex = parseInt(link.getAttribute('data-section'));
            // Map data-section values to section indices
            let targetIndex = sectionIndex;
            if (sectionIndex === 1) targetIndex = 2; // Service
            if (sectionIndex === 4) targetIndex = 4; // About (Partners)
            
            goToSection(targetIndex);
        });
    });

    // ─────────────────────────────────────────────
    // 4. Entrance Animation (Hero)
    // ─────────────────────────────────────────────
    const initEntranceAnimation = () => {
        const heroImage = document.querySelector('.hero-image');
        const title = document.querySelector('.hero-title');
        const subtitle = document.querySelector('.hero-subtitle');
        const button = document.querySelector('.btn-glass');

        gsap.set(heroImage, { opacity: 0, scale: 1.1 });
        gsap.set(['#header', title, subtitle, button], { opacity: 0, y: 30 });
        gsap.set('#header', { y: -20 });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1.2 } });
        tl.to(heroImage, { opacity: 1, scale: 1, duration: 2 }, 0)
          .to('#header', { opacity: 1, y: 0 }, 0.4)
          .to(title, { opacity: 1, y: 0 }, 0.6)
          .to(subtitle, { opacity: 1, y: 0 }, 0.8)
          .to(button, { opacity: 1, y: 0 }, 1.0);
    };

    // ─────────────────────────────────────────────
    // 6. Toss-style Stacking Animation (ScrollTrigger)
    // ─────────────────────────────────────────────
    const setupCardStacking = () => {
        const stackWrapper = document.querySelector('.services-stack-wrapper');
        const pinnedContainer = document.querySelector('.services-pinned-container');
        if (!stackWrapper || !pinnedContainer) return;

        const card1 = document.querySelector('#section-kase');
        const card3 = document.querySelector('#section-influencer');
        if (!card1 || !card3) return;

        const card1Grid = card1.querySelector('.service-grid');
        const card3Grid = card3.querySelector('.service-grid');

        // Master Timeline with Pinning
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: stackWrapper,
                start: "top top",
                end: "+=300%",
                pin: true,
                scrub: 1,
                markers: false
            }
        });

        // 1. Initial State
        gsap.set(card1, { opacity: 1, pointerEvents: "auto" });
        gsap.set(card3, { opacity: 0, pointerEvents: "none" });

        // All cards start hidden
        gsap.set([card1Grid, card3Grid], { y: 100, opacity: 0 });

        // 2. Timeline Sequence
        masterTl
            // --- Card 1 Rising In ---
            .to(card1Grid, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0)

            // Stay on Card 1
            .to({}, { duration: 1 })

            // --- Transition: Card 1 (Out) -> Card 3 (Rising In) ---
            .to(card1Grid, { opacity: 0, scale: 0.8, filter: "blur(4px)", duration: 1 })
            .to(card3, { opacity: 1, pointerEvents: "auto", duration: 0.1 }, "-=0.8")
            .to(card3Grid, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.7")

            // Final Stay on Card 3
            .to({}, { duration: 0.5 });
    };

    // ─────────────────────────────────────────────
    // Custom Cursor for Service Cards
    // ─────────────────────────────────────────────
    const cursorEl = document.createElement('div');
    cursorEl.className = 'custom-cursor';
    cursorEl.innerHTML = '<span class="cursor-arrow">→</span>';
    document.body.appendChild(cursorEl);

    let cursorX = 0, cursorY = 0, currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function animateCursor() {
        currentX += (cursorX - currentX) * 0.15;
        currentY += (cursorY - currentY) * 0.15;
        cursorEl.style.left = currentX + 'px';
        cursorEl.style.top = currentY + 'px';
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    document.querySelectorAll('.service-grid').forEach(card => {
        card.addEventListener('mouseenter', () => {
            cursorEl.classList.add('active');
        });
        card.addEventListener('mouseleave', () => {
            cursorEl.classList.remove('active');
        });
    });

    // ─────────────────────────────────────────────
    // 6. Section Content Reveal (hl-reveal elements)
    // ─────────────────────────────────────────────
    // Pre-hide all reveal elements across service sections
    const allRevealEls = document.querySelectorAll('.hl-reveal');
    gsap.set(allRevealEls, { opacity: 0, y: 40 });

    // Track which sections have already animated
    const revealedSections = new Set();

    function triggerSectionReveal(index) {
        const sectionEl = sections[index];
        if (!sectionEl || revealedSections.has(index)) return;

        // Custom reveal for stacked cards to ensure they animate when they come into view
        const revealEls = sectionEl.querySelectorAll('.hl-reveal');
        if (revealEls.length > 0) {
            revealedSections.add(index);
            gsap.to(revealEls, {
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.2,
                ease: "power3.out"
            });
        }
    }

    // ─────────────────────────────────────────────
    // 7. Header state + Section Indicator
    // ─────────────────────────────────────────────


    const updateHeader = (index) => {
        const header = document.getElementById('header');
        if (index === 0) {
            header.classList.remove('scrolled');
        } else {
            header.classList.add('scrolled');
        }
    };
    // ─────────────────────────────────────────────
    // 7. Real-time Scroll Tracking (Header & Indicator)
    // ─────────────────────────────────────────────
    sections.forEach((section, i) => {
        ScrollTrigger.create({
            trigger: section,
            start: "top 50%",
            end: "bottom 50%",
            onToggle: self => {
                if (self.isActive) {
                    currentIndex = i;
                    triggerSectionReveal(i);
                }
            }
        });
    });

    // ─────────────────────────────────────────────
    // Keyword Transition Section
    // ─────────────────────────────────────────────
    const keywordSection = document.querySelector('.keyword-section');
    const words = document.querySelectorAll('.keyword-word');
    const dotExpand = document.querySelector('.dot-expand');
    const keywordDot = document.querySelector('.keyword-dot');
    if (keywordSection && words.length === 3 && dotExpand && keywordDot) {
        // First word hidden below; others hidden with 0 width
        gsap.set(words[0], { opacity: 0, y: 60 });
        gsap.set([words[1], words[2]], { opacity: 0, width: 0, overflow: 'hidden' });

        // Measure dot position with all words visible
        const clipProxy = { r: 0 };
        let dotCx = 50, dotCy = 50;

        const measureDot = () => {
            // Temporarily show all words at full size
            gsap.set(words, { opacity: 1, width: 'auto', overflow: 'visible' });
            const dotRect = keywordDot.getBoundingClientRect();
            const sectionRect = keywordSection.getBoundingClientRect();
            dotCx = ((dotRect.left + dotRect.width / 2 - sectionRect.left) / sectionRect.width * 100);
            dotCy = ((dotRect.bottom - dotRect.height * 0.3 - sectionRect.top) / sectionRect.height * 100);
            // Reset to initial state
            gsap.set(words[0], { opacity: 0, y: 60, width: 'auto', overflow: 'visible' });
            gsap.set([words[1], words[2]], { opacity: 0, width: 0, overflow: 'hidden' });
            gsap.set(dotExpand, { clipPath: `circle(0% at ${dotCx}% ${dotCy}%)` });
        };

        measureDot();

        const kwTl = gsap.timeline();
        kwTl
            // Empty space for 2/3 of section entry
            .to({}, { duration: 1.5 })
            // First word rises up from below
            .to(words[0], { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })
            // Hold first word centered
            .to({}, { duration: 0.5 })
            // Second word expands in, pushing first word left
            .to(words[1], { opacity: 1, width: 'auto', overflow: 'visible', duration: 1, ease: "power3.out" })
            .to({}, { duration: 0.3 })
            // Third word expands in
            .to(words[2], { opacity: 1, width: 'auto', overflow: 'visible', duration: 1, ease: "power3.out" })
            // Hold all words visible
            .to({}, { duration: 0.3 })
            // Expand circle from '.' position using proxy
            .to(clipProxy, {
                r: 150,
                duration: 1.5,
                ease: "power2.in",
                onUpdate: () => {
                    dotExpand.style.clipPath = `circle(${clipProxy.r}% at ${dotCx}% ${dotCy}%)`;
                },
            });

        ScrollTrigger.create({
            trigger: keywordSection,
            start: "top top",
            end: "+=350%",
            scrub: 0.5,
            pin: true,
            pinSpacing: true,
            animation: kwTl,
            onRefresh: measureDot,
        });

        document.fonts.ready.then(measureDot);
    }

    // Header style change: only after hero section is fully scrolled past
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        ScrollTrigger.create({
            trigger: heroSection,
            start: "bottom top",
            onEnter: () => updateHeader(1),
            onLeaveBack: () => updateHeader(0),
        });
    }

    // Toggle header light-bg during keyword section (white background)
    const headerEl = document.getElementById('header');
    if (keywordSection) {
        ScrollTrigger.create({
            trigger: keywordSection,
            start: "top top",
            end: "+=350%",
            onEnter: () => headerEl.classList.add('light-bg'),
            onLeaveBack: () => headerEl.classList.remove('light-bg'),
            onLeave: () => headerEl.classList.remove('light-bg'),
            onEnterBack: () => headerEl.classList.add('light-bg'),
        });
    }

    // Handle Mission-to-Services transition to ensure card stack wrapper is active
    const stackWrapper = document.querySelector('.services-stack-wrapper');
    if (stackWrapper) {
        ScrollTrigger.create({
            trigger: stackWrapper,
            start: "top top",
            end: "bottom bottom",
        });
    }

    // Keyboard navigation (arrow keys handled natively by browser now, 
    // but we can still use goToSection for larger jumps if desired)

    // ─────────────────────────────────────────────
    // Logo click handling (Refresh/Reset Hero)
    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            
            // 1. Scroll to top (Hero section)
            goToSection(0);
            
            // 2. Reset Swiper to first slide
            if (heroSwiper) heroSwiper.slideTo(0);
            
            // 3. Replay entrance animations
            initEntranceAnimation();
        });
    }

    // ─────────────────────────────────────────────
    // 8. Snap to nearest section on resize
    // ─────────────────────────────────────────────
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (sections[currentIndex]) {
                window.scrollTo({ top: sections[currentIndex].offsetTop, behavior: 'instant' });
            }
        }, 200);
    });

    // Section indicator click handlers
    const siItems = document.querySelectorAll('.si-item');
    siItems.forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index, 10);
            goToSection(index);
        });
    });

    // ─────────────────────────────────────────────
    // Init
    // ─────────────────────────────────────────────
    // Force browser to let us handle scroll position (essential for 'Back' button behavior)
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }

    // Intercept VIEW MORE link to ensure 'Back' returns to Hero (Index 0)
    document.querySelectorAll('.btn-view-more[href*=".html"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Silently update the history entry so when user returns via 'Back', 
            // the main page starts at the top (Hero) instead of the middle.
            history.replaceState({ sectionIndex: 0 }, '', 'index.html');
        });
    });

    // Ensure page starts locked at top
    window.scrollTo(0, 0);
    setupCardStacking();
    initEntranceAnimation();
    updateHeader(0); // initial header state

    // Refresh ScrollTrigger after custom fonts load to fix measurement errors
    document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
    });
});

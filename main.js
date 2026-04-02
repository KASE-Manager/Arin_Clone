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
        '#section-doko',
        '#section-influencer',
        '#section-values',
        '#section-contact'
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
            // Map the old data-section values (1, 4, 5) to new indices (2, 5, 6)
            let targetIndex = sectionIndex;
            if (sectionIndex === 1) targetIndex = 2; // Service
            if (sectionIndex === 4) targetIndex = 5; // About
            if (sectionIndex === 5) targetIndex = 6; // Contact (values-contact end)
            
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
        const card2 = document.querySelector('#section-doko');
        const card3 = document.querySelector('#section-influencer');
        
        const card1Grid = card1.querySelector('.service-grid');
        const card2Grid = card2.querySelector('.service-grid');
        const card3Grid = card3.querySelector('.service-grid');

        // Master Timeline with Pinning
        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: stackWrapper,
                start: "top top",
                end: "+=300%", // Stay pinned for 3x viewport height
                pin: true,
                scrub: 1,
                markers: false
            }
        });

        // 1. Initial State: Ensure Card 1 is active, others are ready for rising
        gsap.set(card1, { opacity: 1, pointerEvents: "auto" });
        gsap.set([card2, card3], { opacity: 0, pointerEvents: "none" });

        // Hide ALL cards' internal elements below, including Card 1
        const card1Visual = card1.querySelector('.service-visual');
        const card1Content = card1.querySelector('.service-content');
        const cardElements = [
            card1Visual, card1Content,
            card2.querySelector('.service-visual'), card2.querySelector('.service-content'),
            card3.querySelector('.service-visual'), card3.querySelector('.service-content')
        ];
        gsap.set(cardElements, { y: 100, opacity: 0 });

        // Card 1 Rising Entry: triggers when the services section enters the viewport
        ScrollTrigger.create({
            trigger: stackWrapper,
            start: "top 80%",
            once: true,
            onEnter: () => {
                gsap.to(card1Visual, { y: 0, opacity: 1, duration: 0.9, ease: "power2.out", delay: 0 });
                gsap.to(card1Content, { y: 0, opacity: 1, duration: 0.9, ease: "power2.out", delay: 0.2 });
            }
        });

        // 2. Timeline Sequence
        masterTl
            // --- Transition 1: Card 1 (Out) -> Card 2 (Rising In) ---
            .to(card1Grid, { opacity: 0, scale: 0.8, filter: "blur(4px)", duration: 1 }, 0)
            .to(card2, { opacity: 1, pointerEvents: "auto", duration: 0.1 }, 0.2)
            .to(card2.querySelector('.service-visual'), { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0.3)
            .to(card2.querySelector('.service-content'), { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, 0.5)
            
            // Stay on Card 2
            .to({}, { duration: 0.5 })

            // --- Transition 2: Card 2 (Out) -> Card 3 (Rising In) ---
            .to(card2.querySelector('.service-grid'), { opacity: 0, scale: 0.8, filter: "blur(4px)", duration: 1 })
            .to(card3, { opacity: 1, pointerEvents: "auto", duration: 0.1 }, "-=0.8")
            .to(card3.querySelector('.service-visual'), { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.7")
            .to(card3.querySelector('.service-content'), { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, "-=0.5")

            // Final Stay on Card 3
            .to({}, { duration: 0.5 });
    };

    // ─────────────────────────────────────────────
    // 6. Section Content Reveal (hl-reveal elements)
    // ─────────────────────────────────────────────
    // Pre-hide all reveal elements across service sections
    const allRevealEls = document.querySelectorAll('.hl-reveal:not(.mission-text .hl-reveal):not(.mission-text)');
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
    // Mission Section: Zoom-out text effect on scroll
    // ─────────────────────────────────────────────
    const missionSection = document.querySelector('.mission-section');
    const missionText = document.querySelector('.mission-text');
    const focusLetter = document.querySelector('.mission-focus-letter');
    if (missionSection && missionText && focusLetter) {
        const startScale = 50;

        // Calculate transform-origin so the 's' letter is the zoom center
        const updateOrigin = () => {
            // Temporarily reset scale to measure real positions
            const currentScale = gsap.getProperty(missionText, "scale");
            gsap.set(missionText, { scale: 1 });
            const textRect = missionText.getBoundingClientRect();
            const letterRect = focusLetter.getBoundingClientRect();
            const originX = ((letterRect.left + letterRect.width / 2) - textRect.left) / textRect.width * 100;
            const originY = ((letterRect.top + letterRect.height / 2) - textRect.top) / textRect.height * 100;
            gsap.set(missionText, { transformOrigin: `${originX}% ${originY}%`, scale: currentScale });
        };

        gsap.set(missionText, { scale: startScale, opacity: 1, y: 0 });
        requestAnimationFrame(() => {
            updateOrigin();
        });

        ScrollTrigger.create({
            trigger: missionSection,
            start: "top top",
            end: "+=300%",
            scrub: 0.5,
            pin: true,
            pinSpacing: true,
            animation: gsap.to(missionText, {
                scale: 1,
                ease: "none",
            }),
            onRefresh: updateOrigin,
        });
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
    // Contact form submission logic
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const message = document.getElementById('contact-message').value;
            
            const subject = encodeURIComponent(`YOURKASE_[Contact] ${name}님으로부터의 문의`);
            const body = encodeURIComponent(`성명: ${name}\n이메일: ${email}\n\n문의내용:\n${message}`);
            
            window.location.href = `mailto:ruby@yourkase.com?subject=${subject}&body=${body}`;
        });
    }

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
});

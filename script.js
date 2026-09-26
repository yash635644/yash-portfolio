document.addEventListener("DOMContentLoaded", function () {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const header = document.getElementById("siteHeader");
    const progress = document.querySelector(".scroll-progress");
    const toTop = document.getElementById("toTop");

    // 1. Mobile menu
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu");

    function setMenu(open) {
        menu.classList.toggle("active", open);
        hamburger.setAttribute("aria-expanded", String(open));
        hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    if (hamburger && menu) {
        hamburger.addEventListener("click", () => setMenu(!menu.classList.contains("active")));
        menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setMenu(false)));
        document.addEventListener("keydown", e => {
            if (e.key === "Escape" && menu.classList.contains("active")) {
                setMenu(false);
                hamburger.focus();
            }
        });
        document.addEventListener("click", e => {
            if (menu.classList.contains("active") && !menu.contains(e.target) && !hamburger.contains(e.target)) {
                setMenu(false);
            }
        });
    }

    // 2. Header state, scroll progress, back-to-top (one rAF-throttled listener)
    let ticking = false;
    function onScroll() {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        header.classList.toggle("scrolled", y > 40);
        progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        toTop.classList.toggle("show", y > 700);
        ticking = false;
    }
    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });
    onScroll();

    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

    // 3. Reveal on scroll (with small stagger inside grids)
    const revealEls = document.querySelectorAll(".reveal");
    revealEls.forEach(el => {
        const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains("reveal"));
        el.style.setProperty("--delay", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => revealObserver.observe(el));

    // 4. Active nav link
    const navLinks = menu.querySelectorAll("a[href^='#']");
    const sectionObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const id = entry.target.id;
            navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${id}`));
        });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(s => sectionObserver.observe(s));

    // 5. Counters
    // Real numbers stay in the HTML for crawlers; only animate from 0 when motion is allowed
    const counters = document.querySelectorAll("[data-count]");
    if (!reduceMotion) counters.forEach(c => { c.textContent = "0"; });
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            observer.unobserve(el);
            if (reduceMotion) {
                el.textContent = target;
                return;
            }
            const start = performance.now();
            const duration = 1400;
            (function tick(now) {
                const t = Math.min((now - start) / duration, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(tick);
            })(start);
        });
    }, { threshold: 0.6 });
    counters.forEach(c => counterObserver.observe(c));

    // 6. Typing rotator
    const typed = document.getElementById("typed");
    const words = ["AI automation", "technical SEO", "AEO & GEO for AI search", "AI-powered apps", "schema & llms.txt"];
    if (typed && !reduceMotion) {
        let w = 0, i = words[0].length, deleting = true;
        function type() {
            const word = words[w];
            typed.textContent = word.slice(0, i);
            let delay = deleting ? 45 : 85;
            if (!deleting && i === word.length) {
                delay = 1800;
                deleting = true;
            } else if (deleting && i === 0) {
                deleting = false;
                w = (w + 1) % words.length;
                delay = 300;
            } else {
                i += deleting ? -1 : 1;
            }
            setTimeout(type, delay);
        }
        setTimeout(type, 2200);
    }

    // 7. Neural network background in hero
    const canvas = document.getElementById("neural");
    if (canvas && canvas.getContext) {
        const ctx = canvas.getContext("2d");
        const hero = canvas.parentElement;
        let nodes = [], w = 0, h = 0, running = false, rafId = null, heroVisible = true;
        const mouse = { x: -9999, y: -9999 };

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            w = hero.clientWidth;
            h = hero.clientHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            const count = Math.min(Math.round((w * h) / 16000), 90);
            nodes = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.8 + 0.8
            }));
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);
            const linkDist = 130;
            for (let a = 0; a < nodes.length; a++) {
                const n = nodes[a];
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > w) n.vx *= -1;
                if (n.y < 0 || n.y > h) n.vy *= -1;

                for (let b = a + 1; b < nodes.length; b++) {
                    const m = nodes[b];
                    const dx = n.x - m.x, dy = n.y - m.y;
                    const d = Math.sqrt(dx * dx + dy * dy);
                    if (d < linkDist) {
                        ctx.strokeStyle = `rgba(187, 225, 250, ${(1 - d / linkDist) * 0.35})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(n.x, n.y);
                        ctx.lineTo(m.x, m.y);
                        ctx.stroke();
                    }
                }

                const md = Math.hypot(n.x - mouse.x, n.y - mouse.y);
                if (md < 160) {
                    ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - md / 160) * 0.5})`;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
                ctx.fill();
            }
            if (running) rafId = requestAnimationFrame(draw);
        }

        function start() {
            if (running || reduceMotion || !heroVisible || document.hidden) return;
            running = true;
            rafId = requestAnimationFrame(draw);
        }

        function stop() {
            running = false;
            cancelAnimationFrame(rafId);
        }

        resize();
        if (reduceMotion) draw();

        let resizeTimer;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                // Mobile address bar show/hide fires resize with a small height change; ignore it
                if (hero.clientWidth === w && Math.abs(hero.clientHeight - h) < 150) return;
                resize();
                if (!running) draw();
            }, 200);
        });

        hero.addEventListener("pointermove", e => {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

        // Only animate while the hero is on screen and the tab is visible
        new IntersectionObserver(([entry]) => {
            heroVisible = entry.isIntersecting;
            heroVisible ? start() : stop();
        }).observe(hero);
        document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
    }

    // 8. Contact form via Formspree
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();
            const button = form.querySelector("button[type='submit']");
            const label = button.querySelector("span");
            button.disabled = true;
            label.textContent = "Sending…";
            status.className = "form-status";
            status.textContent = "";

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { "Accept": "application/json" }
                });

                if (response.ok) {
                    status.textContent = "✅ Message sent! I'll get back to you soon.";
                    status.classList.add("ok");
                    form.reset();
                } else {
                    status.textContent = "❌ Something went wrong. Please try again or email me directly.";
                    status.classList.add("err");
                }
            } catch (error) {
                status.textContent = "❌ Network error. Please try again later.";
                status.classList.add("err");
            } finally {
                button.disabled = false;
                label.textContent = "Send message";
            }
        });
    }

    document.getElementById("year").textContent = new Date().getFullYear();
});

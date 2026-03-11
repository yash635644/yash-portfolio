document.addEventListener("DOMContentLoaded", function () {
    // 1. Hamburger Menu Toggle
    const hamburger = document.getElementById("hamburger");
    const menu = document.getElementById("menu");
    if (hamburger && menu) {
        hamburger.onclick = () => menu.classList.toggle("active");

        document.querySelectorAll('nav a').forEach(link => {
            link.onclick = () => menu.classList.remove("active");
        });
    }

    // 2. Scroll Animation (Intersection Observer)
    const fadeSections = document.querySelectorAll('.fade-in-section');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeSections.forEach(section => {
        sectionObserver.observe(section);
    });

    // 3. Active Navigation Highlighting
    const sections = document.querySelectorAll("section, .hero");
    const navLinks = document.querySelectorAll("nav a");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href").includes(current)) {
                link.classList.add("active");
            }
        });
    });

    // 4. Form Submission handling via Formspree API
    const form = document.getElementById("contactForm");
    const status = document.getElementById("formStatus");

    if (form) {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            const data = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    status.innerHTML = "✅ Message sent successfully!";
                    status.style.color = "#0f4c75";
                    form.reset();
                } else {
                    status.innerHTML = "❌ Oops! Something went wrong. Try again.";
                    status.style.color = "red";
                }
            } catch (error) {
                status.innerHTML = "❌ Network error. Please try later.";
                status.style.color = "red";
            }
        });
    }
});

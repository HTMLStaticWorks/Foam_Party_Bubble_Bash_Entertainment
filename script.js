/**
 * FoamFest — Global interactions
 */
(function () {
  "use strict";

  const STORAGE_THEME = "foamfest-theme";
  const STORAGE_DIR = "foamfest-dir";

  function initTheme() {
    const saved = localStorage.getItem(STORAGE_THEME);
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = saved || (prefersDark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  }

  function toggleTheme() {
    const next =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(STORAGE_THEME, next);
  }

  function initDir() {
    const saved = localStorage.getItem(STORAGE_DIR);
    const dir = saved === "rtl" ? "rtl" : "ltr";
    document.documentElement.setAttribute("data-dir", dir);
    document.documentElement.setAttribute("dir", dir);
  }

  function toggleDir() {
    const next =
      document.documentElement.getAttribute("data-dir") === "rtl" ? "ltr" : "rtl";
    document.documentElement.setAttribute("data-dir", next);
    document.documentElement.setAttribute("dir", next);
    localStorage.setItem(STORAGE_DIR, next);
  }

  function bindHeaderToggles() {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", toggleTheme);
    });
    document.querySelectorAll("[data-dir-toggle]").forEach(function (btn) {
      btn.addEventListener("click", toggleDir);
    });
  }

  /* --- Hamburger --- */
  function initMobileNav() {
    const openBtn = document.querySelector("[data-menu-open]");
    const closeBtn = document.querySelector("[data-menu-close]");
    const overlay = document.getElementById("mobileOverlay");

    function openMenu() {
      if (!overlay) return;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
      openBtn?.setAttribute("aria-expanded", "true");
    }

    function closeMenu() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      openBtn?.setAttribute("aria-expanded", "false");
    }

    openBtn?.addEventListener("click", openMenu);
    closeBtn?.addEventListener("click", closeMenu);

    overlay?.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay?.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  /* --- Header scroll --- */
  function initHeaderScroll() {
    const header = document.getElementById("siteHeader");
    if (!header) return;

    function onScroll() {
      if (window.scrollY > 50) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* --- IntersectionObserver scroll animations --- */
  function initScrollAnimations() {
    const els = document.querySelectorAll("[data-animate]");
    if (!els.length) return;

    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    els.forEach(function (el) {
      io.observe(el);
    });
  }

  /* --- Stats counters --- */
  function initCounters() {
    const counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;

    const animate = function (el) {
      const target = parseInt(el.getAttribute("data-target"), 10);
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1800;
      const start = performance.now();

      function frame(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const val = Math.round(eased * target);
        el.textContent = val + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    counters.forEach(function (c) {
      io.observe(c);
    });
  }

  /* --- Testimonial carousel --- */
  function initCarousel() {
    const root = document.querySelector("[data-carousel]");
    if (!root) return;

    const track = root.querySelector(".carousel-track");
    const slides = root.querySelectorAll(".carousel-slide");
    const dots = root.querySelectorAll(".carousel-dot");
    const prevBtn = root.querySelector("[data-carousel-prev]");
    const nextBtn = root.querySelector("[data-carousel-next]");
    let index = 0;
    let timer = null;
    const delay = 4000;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach(function (d, j) {
        d.classList.toggle("is-active", j === index);
      });
    }

    function next() {
      goTo(index + 1);
    }

    function start() {
      stop();
      timer = setInterval(next, delay);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        goTo(i);
        start();
      });
    });

    prevBtn?.addEventListener("click", function () {
      goTo(index - 1);
      start();
    });
    nextBtn?.addEventListener("click", function () {
      goTo(index + 1);
      start();
    });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);

    start();
    goTo(0);
  }

  /* --- FAQ / Accordion --- */
  function initAccordions() {
    document.querySelectorAll("[data-accordion]").forEach(function (acc) {
      const items = acc.querySelectorAll(".accordion-item");

      items.forEach(function (item) {
        const trigger = item.querySelector(".accordion-trigger");
        const panel = item.querySelector(".accordion-panel");
        const inner = panel?.querySelector(".accordion-panel-inner");
        if (!trigger || !panel || !inner) return;

        panel.style.height = item.classList.contains("is-open")
          ? inner.scrollHeight + "px"
          : "0px";

        trigger.addEventListener("click", function () {
          const isOpen = item.classList.contains("is-open");

          items.forEach(function (other) {
            if (other !== item && acc.hasAttribute("data-accordion-single")) {
              other.classList.remove("is-open");
              const op = other.querySelector(".accordion-panel");
              if (op) op.style.height = "0px";
            }
          });

          if (isOpen) {
            item.classList.remove("is-open");
            panel.style.height = "0px";
          } else {
            item.classList.add("is-open");
            panel.style.height = inner.scrollHeight + "px";
          }
        });

        window.addEventListener(
          "resize",
          function () {
            if (item.classList.contains("is-open")) {
              panel.style.height = inner.scrollHeight + "px";
            }
          },
          { passive: true }
        );
      });
    });
  }

  /* --- Gallery filter --- */
  function initGalleryFilter() {
    const buttons = document.querySelectorAll("[data-gallery-filter]");
    const items = document.querySelectorAll("[data-gallery-item]");
    if (!buttons.length || !items.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        const cat = btn.getAttribute("data-gallery-filter");
        buttons.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        items.forEach(function (item) {
          const ic = item.getAttribute("data-category") || "";
          const cats = ic.split(/\s+/).filter(Boolean);
          const show = cat === "all" || cats.indexOf(cat) !== -1;
          item.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* --- Gallery lightbox --- */
  function initLightbox() {
    const items = document.querySelectorAll("[data-lightbox-item]");
    const lightbox = document.getElementById("lightbox");
    const lbImg = document.getElementById("lightboxImage");
    const closeBtn = document.querySelector("[data-lightbox-close]");
    const prevBtn = document.querySelector("[data-lightbox-prev]");
    const nextBtn = document.querySelector("[data-lightbox-next]");

    if (!lightbox || !lbImg) return;

    let visibleItems = [];
    let currentIndex = 0;

    function collectVisible() {
      visibleItems = Array.from(items).filter(function (it) {
        return !it.classList.contains("is-hidden") && !it.hidden;
      });
    }

    function openAt(el) {
      collectVisible();
      currentIndex = visibleItems.indexOf(el);
      if (currentIndex < 0) currentIndex = 0;
      updateImage();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("menu-open");
    }

    function updateImage() {
      const el = visibleItems[currentIndex];
      if (!el) return;
      const src = el.getAttribute("data-full-src") || el.querySelector("img")?.src;
      const alt = el.querySelector("img")?.getAttribute("alt") || "";
      lbImg.src = src;
      lbImg.alt = alt;
    }

    function closeLb() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("menu-open");
      lbImg.src = "";
    }

    function prev() {
      collectVisible();
      currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      updateImage();
    }

    function next() {
      collectVisible();
      currentIndex = (currentIndex + 1) % visibleItems.length;
      updateImage();
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () {
        openAt(item);
      });
    });

    closeBtn?.addEventListener("click", closeLb);
    prevBtn?.addEventListener("click", function (e) {
      e.stopPropagation();
      prev();
    });
    nextBtn?.addEventListener("click", function (e) {
      e.stopPropagation();
      next();
    });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLb();
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("is-open")) return;
      if (e.key === "Escape") closeLb();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    });
  }

  /* --- 3D tilt --- */
  function initTilt() {
    const coarse =
      window.matchMedia && window.matchMedia("(pointer: coarse)").matches;

    document.querySelectorAll(".tilt-card").forEach(function (cardWrap) {
      const card = cardWrap.querySelector(".glass-card") || cardWrap;

      if (coarse) {
        card.addEventListener(
          "touchstart",
          function () {
            card.classList.add("is-tapping");
            setTimeout(function () {
              card.classList.remove("is-tapping");
            }, 500);
          },
          { passive: true }
        );
        return;
      }

      cardWrap.addEventListener("mousemove", function (e) {
        const r = cardWrap.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const px = (x / r.width - 0.5) * 2;
        const py = (y / r.height - 0.5) * 2;
        const max = 8;
        card.style.transform =
          "perspective(800px) rotateY(" +
          px * max +
          "deg) rotateX(" +
          -py * max +
          "deg)";
      });

      cardWrap.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* --- Package builder --- */
  function initPackageBuilder() {
    const root = document.querySelector("[data-package-builder]");
    if (!root) return;

    const output = root.querySelector("[data-builder-total]");
    const checkboxes = root.querySelectorAll('input[type="checkbox"][data-price]');

    function recalc() {
      let total = parseInt(root.getAttribute("data-base") || "0", 10);
      checkboxes.forEach(function (cb) {
        if (cb.checked) {
          total += parseInt(cb.getAttribute("data-price"), 10);
        }
      });
      if (output) output.textContent = "$" + total.toLocaleString();
    }

    checkboxes.forEach(function (cb) {
      cb.addEventListener("change", recalc);
    });
    recalc();
  }

  /* --- Star rating picker --- */
  function initPasswordToggles() {
    document.querySelectorAll(".password-field").forEach(function (wrap) {
      const input = wrap.querySelector("input");
      const btn = wrap.querySelector(".toggle-eye");
      if (!input || !btn) return;
      btn.addEventListener("click", function () {
        const isPwd = input.getAttribute("type") === "password";
        input.setAttribute("type", isPwd ? "text" : "password");
        btn.setAttribute("aria-pressed", isPwd ? "true" : "false");
      });
    });
  }

  function initStarPicker() {
    const picker = document.querySelector("[data-star-picker]");
    if (!picker) return;

    const stars = picker.querySelectorAll("button[data-star-value]");
    const input = picker.querySelector('input[type="hidden"]');

    stars.forEach(function (star, i) {
      star.addEventListener("click", function () {
        const val = i + 1;
        if (input) input.value = String(val);
        stars.forEach(function (s, j) {
          s.classList.toggle("is-active", j < val);
        });
      });
    });
  }

  /* --- Active nav --- */
  function initActiveNav() {
    const path =
      (window.location.pathname || "")
        .replace(/\\/g, "/")
        .split("/")
        .pop() || "index.html";
    const links = document.querySelectorAll(".nav-list a, .dropdown-panel a, .mobile-overlay-nav a");

    links.forEach(function (a) {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      const file = href.split("/").pop();
      if (file === path || (path === "" && file === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* --- Smooth scroll --- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        const id = a.getAttribute("href");
        if (id.length <= 1) return;
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  /* --- Package filter tabs (packages page) --- */
  function initGalleryLoadMore() {
    const btn = document.querySelector("[data-load-more-gallery]");
    if (!btn) return;
    const extras = document.querySelectorAll("[data-gallery-extra]");
    btn.addEventListener("click", function () {
      extras.forEach(function (el) {
        el.hidden = false;
      });
      btn.hidden = true;
    });
  }

  function initPackageTabs() {
    const tabs = document.querySelectorAll("[data-package-filter]");
    const cards = document.querySelectorAll("[data-package-card]");
    if (!tabs.length || !cards.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        const f = tab.getAttribute("data-package-filter");
        tabs.forEach(function (t) {
          t.classList.toggle("is-active", t === tab);
        });
        cards.forEach(function (card) {
          const cats = (card.getAttribute("data-category") || "").split(/\s+/);
          const show = f === "all" || cats.includes(f);
          card.classList.toggle("is-hidden", !show);
        });
      });
    });
  }

  /* --- Bubble positions (home hero) --- */
  function initRandomBubbles() {
    const layer = document.querySelector("[data-bubbles]");
    if (!layer) return;

    for (let i = 0; i < 18; i++) {
      const b = document.createElement("span");
      b.className = "bubble";
      const size = 12 + Math.random() * 48;
      b.style.width = size + "px";
      b.style.height = size + "px";
      b.style.left = Math.random() * 100 + "%";
      b.style.animationDuration = 8 + Math.random() * 12 + "s";
      b.style.animationDelay = Math.random() * 8 + "s";
      layer.appendChild(b);
    }
  }

  /* --- Back to top --- */
  function initBackToTop() {
    const btn = document.querySelector("[data-back-to-top]");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 400) {
          btn.classList.add("is-visible");
        } else {
          btn.classList.remove("is-visible");
        }
      },
      { passive: true }
    );

    initBackToTop();
  }

  /* --- FAQ View More Toggle --- */
  function initFaqToggle() {
    const btn = document.getElementById("viewMoreFaqLink");
    const extraFaqs = document.getElementById("faqExtraQuestions");
    const item5 = document.getElementById("accordion-item-5");
    if (!btn || !extraFaqs) return;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const isHidden = extraFaqs.style.display === "none" || !extraFaqs.style.display;
      const arrow = btn.querySelector("svg");
      const span = btn.querySelector("span");

      if (isHidden) {
        extraFaqs.style.display = "block";
        if (item5) item5.style.borderBottom = "1px solid var(--color-border)";
        if (span) span.textContent = "View Less";
        if (arrow) arrow.style.transform = "rotate(180deg)";
      } else {
        extraFaqs.style.display = "none";
        if (item5) item5.style.borderBottom = "none";
        if (span) span.textContent = "View More Questions";
        if (arrow) arrow.style.transform = "rotate(0deg)";
        
        btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function boot() {
    initTheme();
    initDir();
    bindHeaderToggles();
    initMobileNav();
    initHeaderScroll();
    initScrollAnimations();
    initCounters();
    initCarousel();
    initAccordions();
    initGalleryFilter();
    initLightbox();
    initTilt();
    initPackageBuilder();
    initPasswordToggles();
    initStarPicker();
    initActiveNav();
    initSmoothScroll();
    initPackageTabs();
    initGalleryLoadMore();
    initRandomBubbles();
    initBackToTop();
    initFaqToggle();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const NAVBAR_HEIGHT = 70;
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");

  /* ---------------------------------------------------------------------------
     1. Mobile navigation
     --------------------------------------------------------------------------- */
  function closeNav() {
    if (navLinks) {
      navLinks.classList.remove("nav-open");
    }
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
    }
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = navLinks.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        closeNav();
      });
    });

    document.addEventListener("click", (e) => {
      if (!navLinks.classList.contains("nav-open")) return;
      const target = e.target;
      if (target instanceof Node && !navLinks.contains(target) && !navToggle.contains(target)) {
        closeNav();
      }
    });
  }

  /* ---------------------------------------------------------------------------
     2. Smooth scrolling (hash links, offset for fixed nav)
     --------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ---------------------------------------------------------------------------
     3. Active nav highlighting + 4. Navbar scroll shadow
     --------------------------------------------------------------------------- */
  const sectionSelectors = ["section[id]", "main [id]"];
  const sections = Array.from(
    new Set(
      sectionSelectors.flatMap((sel) => Array.from(document.querySelectorAll(sel)))
    )
  ).filter((el) => el.id && document.querySelector(`.nav-links a[href="#${el.id}"]`));

  function onScrollNav() {
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.classList.add("nav-scrolled");
      } else {
        navbar.classList.remove("nav-scrolled");
      }
    }

    const scrollPos = window.scrollY + NAVBAR_HEIGHT + 40;
    let currentId = "";
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if (scrollPos >= top) {
        currentId = section.id;
      }
    }

    document.querySelectorAll(".nav-links a").forEach((link) => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        link.classList.toggle("active", href === `#${currentId}`);
      }
    });
  }

  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------------------------------------------------------------------
     5. Scroll animations (IntersectionObserver)
     --------------------------------------------------------------------------- */
  const fadeEls = document.querySelectorAll(".fade-in");
  if (fadeEls.length > 0 && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.2 }
    );
    fadeEls.forEach((el) => io.observe(el));
  } else {
    fadeEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------------------------------------------------------------------------
     6. Testimonial carousel
     --------------------------------------------------------------------------- */
  const track = document.querySelector(".testimonial-track");
  const prevBtn = document.querySelector(".testimonial-prev");
  const nextBtn = document.querySelector(".testimonial-next");
  const dotsWrap = document.querySelector(".testimonial-dots");
  const carousel = document.querySelector(".testimonial-carousel");

  if (track && prevBtn && nextBtn) {
    const slides = track.querySelectorAll(".testimonial-slide");
    const total = slides.length;
    let index = 0;
    let autoTimer = null;

    const dots = dotsWrap
      ? Array.from(dotsWrap.querySelectorAll(".testimonial-dot"))
      : [];

    function updateCarousel() {
      track.style.transform = `translateX(-${index * 100}%)`;
      prevBtn.disabled = index <= 0;
      nextBtn.disabled = index >= total - 1;
      dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
        dot.setAttribute("aria-current", i === index ? "true" : "false");
      });
    }

    function startAuto() {
      stopAuto();
      if (total <= 1) return;
      autoTimer = window.setInterval(() => {
        if (index >= total - 1) {
          index = 0;
        } else {
          index += 1;
        }
        updateCarousel();
      }, 8000);
    }

    function stopAuto() {
      if (autoTimer !== null) {
        window.clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    prevBtn.addEventListener("click", () => {
      index = Math.max(0, index - 1);
      updateCarousel();
      startAuto();
    });

    nextBtn.addEventListener("click", () => {
      index = Math.min(total - 1, index + 1);
      updateCarousel();
      startAuto();
    });

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        index = i;
        updateCarousel();
        startAuto();
      });
    });

    if (carousel) {
      carousel.addEventListener("mouseenter", stopAuto);
      carousel.addEventListener("mouseleave", startAuto);
    }

    updateCarousel();
    startAuto();
  }

  /* ---------------------------------------------------------------------------
     7. Lightbox (work gallery)
     --------------------------------------------------------------------------- */
  const lightbox = document.querySelector(".lightbox-overlay");
  const lightboxImg = lightbox?.querySelector("img");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  const galleryItems = document.querySelectorAll(".gallery-item");

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.classList.remove("active");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (!img || !img.src) return;
      openLightbox(img.src, img.getAttribute("alt") || "");
    });
  });

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  lightboxClose?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox?.classList.contains("active")) {
      closeLightbox();
    }
  });
});

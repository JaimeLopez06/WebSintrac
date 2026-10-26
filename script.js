const menuToggle = document.querySelector(".menu-toggle");
const primaryNavigation = document.querySelector(".primary-navigation");
const dropdowns = primaryNavigation
  ? Array.from(primaryNavigation.querySelectorAll(".nav-dropdown"))
  : [];

function closeDropdown(dropdown) {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  const menu = dropdown.querySelector(".nav-dropdown-menu");
  if (!toggle || !menu) return;
  dropdown.dataset.openedByHover = "false";
  toggle.setAttribute("aria-expanded", "false");
  menu.hidden = true;
}

function closeDropdowns(except) {
  dropdowns.forEach((dropdown) => {
    if (dropdown !== except) closeDropdown(dropdown);
  });
}

function openDropdown(dropdown, openedByHover = false) {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  const menu = dropdown.querySelector(".nav-dropdown-menu");
  if (!toggle || !menu) return;
  closeDropdowns(dropdown);
  dropdown.dataset.openedByHover = String(openedByHover);
  toggle.setAttribute("aria-expanded", "true");
  menu.hidden = false;
}

function closeMenu() {
  if (menuToggle && primaryNavigation) {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    primaryNavigation.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }
  closeDropdowns();
}

dropdowns.forEach((dropdown) => {
  const toggle = dropdown.querySelector(".nav-dropdown-toggle");
  if (!toggle) return;

  toggle.addEventListener("click", (event) => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen && dropdown.dataset.openedByHover === "true" && event.detail > 0) {
      dropdown.dataset.openedByHover = "false";
      return;
    }
    if (isOpen) closeDropdown(dropdown);
    else openDropdown(dropdown);
  });

  dropdown.addEventListener("pointerenter", (event) => {
    if (event.pointerType !== "touch" && window.innerWidth > 760) {
      openDropdown(dropdown, true);
    }
  });

  dropdown.addEventListener("pointerleave", () => {
    if (window.innerWidth > 760) closeDropdown(dropdown);
  });

  dropdown.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && dropdown.contains(event.relatedTarget)) return;
    closeDropdown(dropdown);
  });
});

if (menuToggle && primaryNavigation) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Abrir menú" : "Cerrar menú");
    primaryNavigation.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const openDropdown = dropdowns.find((dropdown) => (
      dropdown.querySelector(".nav-dropdown-toggle")?.getAttribute("aria-expanded") === "true"
    ));
    if (openDropdown) {
      closeDropdown(openDropdown);
      openDropdown.querySelector(".nav-dropdown-toggle")?.focus();
      return;
    }
    closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof Node && !primaryNavigation.contains(event.target)) {
      closeDropdowns();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) closeMenu();
  });
}

const year = document.querySelector("#current-year");
if (year) year.textContent = String(new Date().getFullYear());

const contactForm = document.querySelector("#contact-form");
const formFeedback = document.querySelector("#form-feedback");

if (contactForm instanceof HTMLFormElement && formFeedback) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      formFeedback.textContent = "Completa los campos obligatorios para preparar tu consulta.";
      return;
    }

    const subject = encodeURIComponent(`Consulta web de ${name}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nCorreo: ${email}\nTeléfono: ${phone || "No indicado"}\n\nConsulta:\n${message}`
    );
    formFeedback.textContent = "Se abrirá tu aplicación de correo con la consulta preparada.";
    window.location.href = `mailto:promociones@sintracengineering.es?subject=${subject}&body=${body}`;
  });
}

const photoPresentation = document.querySelector(".photo-presentation");

if (photoPresentation) {
  const slides = Array.from(photoPresentation.querySelectorAll(".photo-slide"));
  const paginationButtons = Array.from(photoPresentation.querySelectorAll(".photo-pagination button"));
  const previousButton = photoPresentation.querySelector(".photo-previous");
  const nextButton = photoPresentation.querySelector(".photo-next");
  const toggleButton = photoPresentation.querySelector(".photo-toggle");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (slides.length > 1 && paginationButtons.length === slides.length && previousButton && nextButton && toggleButton) {
    let currentSlide = 0;
    let userPaused = prefersReducedMotion;
    let pointerPaused = false;
    let timer = 0;

    const updateToggleButton = () => {
      toggleButton.setAttribute("aria-label", userPaused ? "Iniciar presentación" : "Pausar presentación");
      toggleButton.setAttribute("aria-pressed", String(userPaused));
      toggleButton.querySelector("span").textContent = userPaused ? "▶" : "Ⅱ";
    };

    const stopTimer = () => {
      window.clearTimeout(timer);
    };

    const scheduleNextSlide = () => {
      stopTimer();
      if (userPaused || pointerPaused || document.hidden) return;
      timer = window.setTimeout(() => {
        showSlide(currentSlide + 1);
        scheduleNextSlide();
      }, 6500);
    };

    const showSlide = (index) => {
      currentSlide = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === currentSlide;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });
      paginationButtons.forEach((button, buttonIndex) => {
        button.setAttribute("aria-pressed", String(buttonIndex === currentSlide));
      });
    };

    previousButton.addEventListener("click", () => {
      showSlide(currentSlide - 1);
      scheduleNextSlide();
    });

    nextButton.addEventListener("click", () => {
      showSlide(currentSlide + 1);
      scheduleNextSlide();
    });

    paginationButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        showSlide(index);
        scheduleNextSlide();
      });
    });

    toggleButton.addEventListener("click", () => {
      userPaused = !userPaused;
      updateToggleButton();
      scheduleNextSlide();
    });

    photoPresentation.addEventListener("pointerenter", () => {
      pointerPaused = true;
      stopTimer();
    });

    photoPresentation.addEventListener("pointerleave", () => {
      pointerPaused = false;
      scheduleNextSlide();
    });

    photoPresentation.addEventListener("focusin", () => {
      pointerPaused = true;
      stopTimer();
    });

    photoPresentation.addEventListener("focusout", (event) => {
      if (event.relatedTarget instanceof Node && photoPresentation.contains(event.relatedTarget)) return;
      pointerPaused = false;
      scheduleNextSlide();
    });

    document.addEventListener("visibilitychange", scheduleNextSlide);
    updateToggleButton();
    scheduleNextSlide();
  }
}

const revealSelectors = [
  ".intro-strip-inner",
  ".section-heading",
  ".home-link-card",
  ".home-approach",
  ".project-band-inner",
  ".about-image",
  ".about-content",
  ".promotion-card",
  ".delivered-card",
  ".contact-copy",
  ".contact-panel",
  ".contact-bottom > *",
  ".project-gallery a",
  ".detail-intro",
  ".spec-grid article",
  ".payment-panel",
  ".availability-panel",
  ".document-links",
  ".map-panel",
  ".site-footer"
].join(", ");

const revealElements = Array.from(document.querySelectorAll(revealSelectors));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && "IntersectionObserver" in window) {
  const siblingIndexes = new WeakMap();
  revealElements.forEach((element) => {
    const parent = element.parentElement;
    const siblings = parent
      ? Array.from(parent.children).filter((sibling) => sibling.matches(revealSelectors))
      : [];
    const index = siblingIndexes.get(parent) || 0;
    siblingIndexes.set(parent, index + 1);
    element.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
    element.classList.add("scroll-reveal");
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });

  revealElements.forEach((element) => revealObserver.observe(element));
}
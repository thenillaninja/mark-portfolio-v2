const year = document.querySelector("#year");
if (year) {
  year.textContent = new Date().getFullYear();
}

const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const sections = document.querySelectorAll("[data-section]");
const navLinks = document.querySelectorAll("[data-section-link]");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const current = entry.target.getAttribute("data-section");

      navLinks.forEach((link) => {
        const isActive = link.getAttribute("data-section-link") === current;
        link.classList.toggle("active", isActive);
      });
    });
  },
  {
    rootMargin: "-35% 0px -45% 0px",
    threshold: 0
  }
);

sections.forEach((section) => sectionObserver.observe(section));


const buildPanel = document.querySelector("#build-panel");

if (buildPanel) {
  const rows = buildPanel.querySelectorAll(".build-row");
  const reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reducedMotion) {
    buildPanel.classList.add("cards-ready");
  } else {
    const heroCardObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          setTimeout(() => {
            buildPanel.classList.add("cards-ready");
          }, 200);

          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.35
      }
    );

    heroCardObserver.observe(buildPanel);

    rows.forEach((row) => {
      row.addEventListener("animationend", () => {
        row.classList.add("flip-complete");
      });
    });

    buildPanel.addEventListener("mousemove", (event) => {
      if (!buildPanel.classList.contains("cards-ready")) return;

      const rect = buildPanel.getBoundingClientRect();

      const x =
        (event.clientX - rect.left) / rect.width - 0.5;

      const y =
        (event.clientY - rect.top) / rect.height - 0.5;

      buildPanel.style.transform =
        `rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;

      rows.forEach((row) => {
        if (!row.classList.contains("flip-complete")) return;

        const depth = Number(row.dataset.depth || 1);

        row.style.transform =
          `translate3d(${x * depth * 2}px, ${y * depth * 2}px, ${depth * 2}px)`;
      });
    });

    buildPanel.addEventListener("mouseleave", () => {
      buildPanel.style.transform = "";

      rows.forEach((row) => {
        if (row.classList.contains("flip-complete")) {
          row.style.transform = "";
        }
      });
    });
  }
}


const menuToggle = document.querySelector("#menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");

if (menuToggle && mobileMenu) {
  const closeMobileMenu = () => {
    menuToggle.classList.remove("active");
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("open");

    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });
}

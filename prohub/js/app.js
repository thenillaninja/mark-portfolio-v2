(() => {
  const config = window.PROHUB_CONFIG;
  if (!config) return;

  const root = document.documentElement;

  root.style.setProperty("--accent", config.theme.accent);
  root.style.setProperty("--bg", config.theme.background);
  root.style.setProperty("--surface", config.theme.surface);
  root.style.setProperty("--text", config.theme.text);
  root.style.setProperty("--muted", config.theme.muted);
  root.style.setProperty(
    "--home-nav",
    config.theme.homeNav || "#62a8ff"
  );
  root.style.setProperty(
    "--share-bg",
    config.theme.shareBackground || "#1a2030"
  );
  root.style.setProperty(
    "--share-text",
    config.theme.shareText || "#f8fafc"
  );

  root.style.setProperty(
    "--about-text",
    config.theme.sectionText?.about || "#f8fafc"
  );

  root.style.setProperty(
    "--portfolio-text",
    config.theme.sectionText?.portfolio || "#f8fafc"
  );

  root.style.setProperty(
    "--contact-text",
    config.theme.sectionText?.contact || "#f8fafc"
  );

  root.style.setProperty(
    "--social-text",
    config.theme.sectionText?.social || "#f8fafc"
  );

  root.style.setProperty(
    "--avatar-border-start",
    config.theme.avatarBorder?.start || "#f8fafc"
  );

  root.style.setProperty(
    "--avatar-border-end",
    config.theme.avatarBorder?.end || "#62a8ff"
  );

  root.style.setProperty(
    "--avatar-border-angle",
    `${config.theme.avatarBorder?.angle ?? 135}deg`
  );
  root.style.setProperty("--card-radius", `${config.theme.radius}px`);

  function setText(selector, value) {
    const el = document.querySelector(selector);
    if (el && value !== undefined) el.textContent = value;
  }

  setText(".card-home .eyebrow", config.profile.eyebrow);
  setText(".card-home h1", config.profile.name);
  setText(".card-home .role", config.profile.title);
  setText(".card-home .bio", config.profile.bio);

  async function resolveAssetURL(value) {
    if (!value) return "";

    if (value.startsWith("asset://")) {
      const key = value.slice("asset://".length);

      try {
        return await window.ProHubAssets.getURL(key) || "";
      } catch (error) {
        console.error("Could not load asset:", error);
        return "";
      }
    }

    return value;
  }

  const avatar = document.querySelector(".avatar");

  if (avatar && config.profile.avatar) {
    resolveAssetURL(config.profile.avatar).then(src => {
      if (src) avatar.src = src;
    });
  }

  const cardBackgrounds = {
    home:
      "radial-gradient(circle at 12% 10%, rgba(50,145,255,.24), transparent 40%), radial-gradient(circle at 85% 90%, rgba(109,69,255,.22), transparent 42%)",

    about:
      "radial-gradient(circle at 10% 20%, rgba(36,145,255,.22), transparent 38%)",

    contact:
      "radial-gradient(circle at 90% 22%, rgba(116,72,255,.24), transparent 38%)",

    portfolio:
      "radial-gradient(circle at 50% 0%, rgba(50,159,255,.24), transparent 42%)",

    links:
      "radial-gradient(circle at 60% 100%, rgba(108,73,255,.25), transparent 38%)"
  };

  async function applyCardBackgrounds() {
    for (const [name, glow] of Object.entries(cardBackgrounds)) {
      const card =
        document.querySelector(`[data-card="${name}"]`);

      if (!card) continue;

      const stored =
        config.backgrounds?.[name] || "";

      const base =
        config.theme.background || "#070b13";

      let imageURL = null;

      if (stored.startsWith("asset://")) {
        const key =
          stored.slice("asset://".length);

        try {
          imageURL =
            await window.ProHubAssets.getURL(key);
        } catch (error) {
          console.error(
            `Could not load ${name} background:`,
            error
          );
        }
      } else if (stored) {
        imageURL = stored;
      }

      /*
        We deliberately set the entire shorthand inline.
        That beats the older section background rules
        without touching layout or z-index.
      */
      if (imageURL) {
        card.style.background = [
          "linear-gradient(" +
            "to bottom," +
            "rgba(4,8,15,.10)," +
            "rgba(4,8,15,.38)" +
          ")",
          `url("${imageURL}")`,
          base
        ].join(", ");

        card.style.backgroundSize =
          "cover, cover, auto";

        card.style.backgroundPosition =
          "center, center, center";

        card.style.backgroundRepeat =
          "no-repeat, no-repeat, no-repeat";
      } else {
        card.style.background =
          `${glow}, ${base}`;

        card.style.backgroundSize = "auto";
        card.style.backgroundPosition = "center";
        card.style.backgroundRepeat = "no-repeat";
      }
    }
  }

  applyCardBackgrounds();


  setText(".card-about h2", config.about.heading);
  setText(".card-about .section-lead", config.about.text);

  const aboutGrid = document.querySelector(".info-grid");

  if (aboutGrid) {
    aboutGrid.innerHTML = config.about.items.map(item => `
      <article class="info-tile">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.value)}</strong>
      </article>
    `).join("");
  }

  const contactList = document.querySelector(".contact-list");

  if (contactList) {
    contactList.innerHTML = config.contact.map(item => `
      <a href="${escapeAttr(item.url)}" class="contact-row">
        <span>${escapeHTML(item.label)}</span>
        <strong>${escapeHTML(item.value)}</strong>
      </a>
    `).join("");
  }

  const qrBlock = document.getElementById("contactQrBlock");
  const qrTarget = document.getElementById("contactQr");
  const qrLabel = document.getElementById("contactQrLabel");

  if (qrBlock) {
    qrBlock.hidden = !config.qr?.enabled;

    if (qrTarget) {
      qrTarget.innerHTML = "";
    }

    if (config.qr?.enabled && qrTarget) {
      const mode = config.qr?.mode || "generated";

      if (
        mode === "custom" &&
        config.qr?.customImage
      ) {
        const img = document.createElement("img");

        resolveAssetURL(config.qr.customImage).then(src => {
          if (!src) return;

          img.src = src;
          img.alt = "QR code";
          img.className = "custom-qr-image";

          qrTarget.appendChild(img);
        });
      } else if (
        config.qr?.target &&
        typeof QRCode !== "undefined"
      ) {
        new QRCode(qrTarget, {
          text: config.qr.target,
          width: 128,
          height: 128,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      }
    }

    if (qrLabel) {
      qrLabel.textContent =
        config.qr?.label || "Scan to open profile";
    }
  }

  const projectList = document.querySelector(".project-list");

  if (projectList) {
    projectList.innerHTML = config.portfolio.map(item => `
      <a href="${escapeAttr(item.url)}" class="project-card">
        ${item.image ? `
          <img class="project-thumb"
               data-project-asset="${escapeAttr(item.image)}"
               alt="">
        ` : ""}
        <div>
          <span>${escapeHTML(item.subtitle || "")}</span>
          <strong>${escapeHTML(item.title)}</strong>
          ${item.description
            ? `<small>${escapeHTML(item.description)}</small>`
            : ""}
        </div>
        <b>↗</b>
      </a>
    `).join("");
  }

  document
    .querySelectorAll("[data-project-asset]")
    .forEach(async img => {
      const src = await resolveAssetURL(
        img.dataset.projectAsset
      );

      if (src) {
        img.src = src;
      }
    });



  const linksGrid = document.querySelector(".links-grid");

  if (linksGrid) {
    linksGrid.innerHTML = config.links.map(item => `
      <a href="${escapeAttr(item.url)}" class="social-row">
        <span class="social-icon">
          ${item.iconPreset
            ? `<img src="assets/social/${escapeAttr(item.iconPreset)}.svg" alt="">`
            : item.icon
              ? item.icon.startsWith("asset://")
                ? `<img data-link-asset="${escapeAttr(item.icon)}" alt="">`
                : `<img src="${escapeAttr(item.icon)}" alt="">`
              : escapeHTML(item.iconText || "+")}
        </span>

        <span class="social-copy">
          <strong>${escapeHTML(item.label)}</strong>
          <small>${escapeHTML(item.subtitle || "")}</small>
        </span>

        <b>↗</b>
      </a>
    `).join("");
  }

  
  document
    .querySelectorAll("[data-link-asset]")
    .forEach(async img => {
      const src = await resolveAssetURL(img.dataset.linkAsset);

      if (src) {
        img.src = src;
      }
    });

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value = "") {
    return escapeHTML(value);
  }

  const stage = document.getElementById("cardStage");
  if (!stage) return;

  const cards = {
    home: document.querySelector('[data-card="home"]'),
    about: document.querySelector('[data-card="about"]'),
    contact: document.querySelector('[data-card="contact"]'),
    portfolio: document.querySelector('[data-card="portfolio"]'),
    links: document.querySelector('[data-card="links"]')
  };

  const positions = {
    home:      { x: 0, y: 0 },
    about:     { x: -1, y: 0 },
    contact:   { x: 1, y: 0 },
    portfolio: { x: 0, y: -1 },
    links:     { x: 0, y: 1 }
  };

  let current = "home";
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let deltaX = 0;
  let deltaY = 0;

  function render(extraX = 0, extraY = 0) {
    const currentPos = positions[current];

    Object.entries(cards).forEach(([name, card]) => {
      const pos = positions[name];

      const x =
        (pos.x - currentPos.x) * stage.clientWidth +
        extraX;

      const y =
        (pos.y - currentPos.y) * stage.clientHeight +
        extraY;

      card.style.transform =
        `translate3d(${x}px, ${y}px, 0)`;
    });
  }

  function navigate(target) {
    if (!cards[target]) return;
    current = target;

    /*
      The admin live preview reloads whenever configuration changes.
      Remember its current card so edits do not kick the preview
      back to Home.
    */
    if (window.self !== window.top) {
      sessionStorage.setItem(
        "prohub-preview-section",
        current
      );
    }

  /*
    Allow the Admin live preview to move directly
    to a specific ProHUB card.
  */
  window.ProHubNavigate = navigate;
    stage.classList.remove("dragging");
    render();
  }

  let activeScroller = null;

  function pointerDown(event) {
    if (
      event.target.closest("a") ||
      event.target.closest(".action-button") ||
      event.target.closest(".swipe-indicator") ||
      event.target.closest(".back-home")
    ) return;

    dragging = true;
    deltaX = 0;
    deltaY = 0;

    startX = event.clientX;
    startY = event.clientY;

    activeScroller = event.target.closest(".section-content");

    stage.classList.add("dragging");

    if (stage.setPointerCapture) {
      stage.setPointerCapture(event.pointerId);
    }
  }

  function pointerMove(event) {
    if (!dragging) return;

    deltaX = event.clientX - startX;
    deltaY = event.clientY - startY;

    const horizontal =
      Math.abs(deltaX) > Math.abs(deltaY);

    /*
      If the gesture begins inside a scrollable section and is vertical,
      let the section scroll normally unless it is already at the edge
      needed to navigate back to Home.
    */
    if (
      current !== "home" &&
      activeScroller &&
      !horizontal
    ) {
      const pos = positions[current];

      const maxScroll =
        activeScroller.scrollHeight -
        activeScroller.clientHeight;

      const atTop =
        activeScroller.scrollTop <= 1;

      const atBottom =
        activeScroller.scrollTop >= maxScroll - 1;

      const wantsHomeFromPortfolio =
        pos.y < 0 &&
        deltaY < 0 &&
        atBottom;

      const wantsHomeFromLinks =
        pos.y > 0 &&
        deltaY > 0 &&
        atTop;

      /*
        About and Contact live horizontally, so vertical movement
        should always belong to their internal scroller.
      */
      if (pos.x !== 0) {
        stage.classList.remove("dragging");
        return;
      }

      /*
        Portfolio / Social only hand vertical control back to the
        card-navigation layer at the appropriate scroll edge.
      */
      if (
        pos.y !== 0 &&
        !wantsHomeFromPortfolio &&
        !wantsHomeFromLinks
      ) {
        stage.classList.remove("dragging");
        return;
      }

      stage.classList.add("dragging");
    }

    let x = horizontal ? deltaX : 0;
    let y = horizontal ? 0 : deltaY;

    if (current !== "home") {
      const pos = positions[current];

      if (pos.x !== 0) {
        y = 0;

        if (
          (pos.x < 0 && x < 0) ||
          (pos.x > 0 && x > 0)
        ) x *= .18;
      }

      if (pos.y !== 0) {
        x = 0;

        if (
          (pos.y < 0 && y < 0) ||
          (pos.y > 0 && y > 0)
        ) y *= .18;
      }
    }

    render(x, y);
  }

  function pointerUp() {
    if (!dragging) return;

    dragging = false;
    stage.classList.remove("dragging");

    const thresholdX =
      stage.clientWidth * .18;

    const thresholdY =
      stage.clientHeight * .14;

    if (current === "home") {
      if (
        Math.abs(deltaX) > Math.abs(deltaY) &&
        Math.abs(deltaX) > thresholdX
      ) {
        navigate(deltaX < 0 ? "contact" : "about");
        return;
      }

      if (Math.abs(deltaY) > thresholdY) {
        navigate(deltaY < 0 ? "links" : "portfolio");
        return;
      }
    } else {
      const pos = positions[current];

      if (pos.x < 0 && deltaX < -thresholdX) {
        navigate("home");
        return;
      }

      if (pos.x > 0 && deltaX > thresholdX) {
        navigate("home");
        return;
      }

      if (pos.y < 0 && deltaY < -thresholdY) {
        navigate("home");
        return;
      }

      if (pos.y > 0 && deltaY > thresholdY) {
        navigate("home");
        return;
      }
    }

    render();
    activeScroller = null;
  }

  stage.addEventListener("pointerdown", pointerDown);
  stage.addEventListener("pointermove", pointerMove);
  stage.addEventListener("pointerup", pointerUp);
  stage.addEventListener("pointercancel", pointerUp);

  document.querySelectorAll("[data-target]").forEach(control => {
    control.addEventListener("click", () => {
      navigate(control.dataset.target);
    });
  });

  /*
    Recalculate swipe-card positions whenever the viewport changes.

    Do not pass the browser resize Event directly into render(),
    because render() expects numeric drag offsets.
  */
  window.addEventListener("resize", () => {
    render();
  });

  /*
    The admin preview changes the iframe dimensions dynamically.
    ResizeObserver makes the swipe canvas respond to its actual
    rendered size even when the browser does not emit a useful
    window resize event inside the iframe.
  */
  if ("ResizeObserver" in window) {
    const stageObserver = new ResizeObserver(() => {
      if (!dragging) {
        render();
      }
    });

    stageObserver.observe(stage);
  }

  /*
    Restore the live preview position after an iframe refresh.
    Standalone/open-profile views intentionally still begin at Home.
  */
  if (window.self !== window.top) {

    const savedPreviewSection =
      sessionStorage.getItem(
        "prohub-preview-section"
      );

    if (
      savedPreviewSection &&
      cards[savedPreviewSection]
    ) {
      current = savedPreviewSection;
    }
  }

  render();
})();

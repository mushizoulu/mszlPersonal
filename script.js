const homeDataReady = window.siteDataReady || Promise.resolve(window.siteData);

homeDataReady.then((siteData) => {
  const { locales, itemLimit } = siteData;
  const homeWorksLimit = Math.min(9, itemLimit);
  const homePostsLimit = 12;
  const localeButtons = Array.from(document.querySelectorAll(".locale-button"));
  const heroStats = document.getElementById("hero-stats");
  const worksGrid = document.getElementById("works-grid");
  const picksList = document.getElementById("picks-list");
  const postList = document.getElementById("post-list");
  const spotlightCopy = document.getElementById("spotlight-copy");
  const menuToggle = document.querySelector(".menu-toggle");
  const siteNav = document.getElementById("site-nav");

  const savedLocale = window.localStorage.getItem("site-locale");
  let currentLocale = locales[savedLocale] ? savedLocale : "zh-Hans";

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) {
      node.textContent = value;
    }
  }

  function limitItems(items) {
    return items.slice(0, itemLimit);
  }

  function getSiteAgeDays() {
    const launchedAt = new Date("2026-05-27T00:00:00+09:00");
    const now = new Date();
    const diff = now.getTime() - launchedAt.getTime();
    return Math.max(1, Math.floor(diff / 86400000) + 1);
  }

  function createMetaChips(items, className) {
    return items.map((item) => `<span class="${className}">${item}</span>`).join("");
  }

  function renderStats(localeData) {
    const statItems = [
      {
        value: String(localeData.works.length),
        label: localeData.stats[0]?.label || ""
      },
      {
        value: String(localeData.posts.length),
        label: localeData.stats[1]?.label || ""
      },
      {
        value: String(getSiteAgeDays()),
        label: localeData.stats[2]?.label || ""
      }
    ];

    heroStats.innerHTML = "";
    statItems.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span class="stat-value">${item.value}</span>
        <span class="stat-label">${item.label}</span>
      `;
      heroStats.appendChild(li);
    });
  }

  function renderSpotlight(localeData) {
    const latestWorks = localeData.works.slice(0, 4);
    const latestPosts = localeData.posts.slice(0, 4);

    spotlightCopy.innerHTML = `
      <div class="spotlight-group">
        <p class="spotlight-group-title">${localeData.site.latestWorksHeading}</p>
        <ul class="spotlight-list">
          ${latestWorks.map((work) => `
            <li>
              <a href="${work.link}" target="_blank" rel="noreferrer">${work.title}</a>
            </li>
          `).join("")}
        </ul>
      </div>
      <div class="spotlight-group">
        <p class="spotlight-group-title">${localeData.site.latestPostsHeading}</p>
        <ul class="spotlight-list">
          ${latestPosts.map((post) => `
            <li>
              <a href="post.html?slug=${post.slug}">${post.title}</a>
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  }

  function renderWorks(localeData) {
    worksGrid.innerHTML = "";
    localeData.works.slice(0, homeWorksLimit).forEach((work) => {
      const article = document.createElement("article");
      article.className = "card";
      article.innerHTML = `
        <p class="card-tag">${work.tag}</p>
        <h3><a class="section-title-link" href="${work.link}" target="_blank" rel="noreferrer">${work.title}</a></h3>
        <div class="card-meta">${createMetaChips(work.meta || [], "meta-chip")}</div>
        <p class="card-copy">${work.copy}</p>
        <a class="card-link" href="${work.link}" target="_blank" rel="noreferrer">${work.linkLabel || localeData.buttons.viewProduct}</a>
      `;
      worksGrid.appendChild(article);
    });
  }

  function renderPicks(localeData) {
    picksList.innerHTML = "";
    limitItems(localeData.picks).forEach((pick) => {
      const article = document.createElement("article");
      article.className = "pick-item";
      const firstParagraph = (pick.body && pick.body[0]) || pick.copy;
      const excerpt = `${firstParagraph.slice(0, 56)}...`;
      article.innerHTML = `
        <div>
          <p class="pick-tag">${pick.tag}</p>
          <h3><a class="section-title-link" href="pick-post.html?slug=${pick.slug}">${pick.title}</a></h3>
          <p class="pick-meta">${pick.meta}</p>
          <p class="pick-copy">${excerpt}</p>
        </div>
        <a class="pick-link" href="${pick.productLink}" target="_blank" rel="noreferrer">${localeData.buttons.viewProduct}</a>
      `;
      picksList.appendChild(article);
    });
  }

  function renderPosts(localeData) {
    postList.innerHTML = "";
    localeData.posts.slice(0, homePostsLimit).forEach((post) => {
      const article = document.createElement("article");
      article.className = "post-card";
      article.innerHTML = `
        <p class="post-meta">${post.category} / ${post.date}</p>
        <h3><a class="section-title-link" href="post.html?slug=${post.slug}">${post.title}</a></h3>
        <p>${post.excerpt}</p>
        <a class="card-link" href="post.html?slug=${post.slug}">${localeData.buttons.readArticle}</a>
      `;
      postList.appendChild(article);
    });
  }

  function applyLocale(localeKey) {
    currentLocale = localeKey;
    window.localStorage.setItem("site-locale", localeKey);
    const localeData = locales[localeKey];

    document.documentElement.lang = localeData.site.htmlLang;
    document.title = localeData.site.title;
    document.querySelector('meta[name="description"]').setAttribute("content", localeData.site.description);

    setText("site-name", localeData.site.name);
    setText("site-tagline", localeData.site.tagline);
    setText("hero-note", localeData.site.heroNote);
    setText("hero-title", localeData.site.heroTitle);
    setText("hero-description", localeData.site.heroDescription);
    setText("spotlight-label", localeData.site.latestLabel);
    setText("spotlight-title", localeData.site.latestTitle);
    setText("about-copy", localeData.site.about);
    setText("contact-copy", localeData.site.contactCopy);
    setText("affiliate-note", localeData.site.affiliateDisclosure);
    setText("footer-copy", localeData.site.footer);
    setText("works-more-link", localeData.site.worksMoreText);
    setText("blog-more-link", localeData.site.blogMoreText);
    setText("contact-email-link", localeData.site.contactEmail);
    document.getElementById("contact-email-link").setAttribute("href", `mailto:${localeData.site.contactEmail}`);

    setText("nav-picks", localeData.nav.picks);
    setText("nav-works", localeData.nav.works);
    setText("nav-blog", localeData.nav.blog);
    setText("nav-about", localeData.nav.about);
    setText("nav-contact", localeData.nav.contact);

    setText("hero-primary", localeData.buttons.primary);
    setText("hero-secondary", localeData.buttons.secondary);
    setText("works-eyebrow", localeData.sections.worksEyebrow);
    setText("works-title", localeData.sections.worksTitle);
    setText("works-description", localeData.sections.worksDescription);
    setText("picks-eyebrow", localeData.sections.picksEyebrow);
    setText("picks-title", localeData.sections.picksTitle);
    setText("picks-description", localeData.sections.picksDescription);
    setText("blog-eyebrow", localeData.sections.blogEyebrow);
    setText("blog-title", localeData.sections.blogTitle);
    setText("blog-description", localeData.sections.blogDescription);
    setText("about-eyebrow", localeData.sections.aboutEyebrow);
    setText("about-title", localeData.sections.aboutTitle);
    setText("contact-eyebrow", localeData.sections.contactEyebrow);
    setText("contact-title", localeData.site.contactTitle);

    document.querySelector('[data-locale="zh-Hans"]').textContent = localeData.switcher.hans;
    document.querySelector('[data-locale="zh-Hant"]').textContent = localeData.switcher.hant;
    document.querySelector('[data-locale="ja"]').textContent = localeData.switcher.ja;

    menuToggle.textContent = localeData.buttons.menu;
    document.getElementById("hero-primary").setAttribute("href", "#picks");
    document.getElementById("picks-title").setAttribute("href", "picks.html");
    document.getElementById("hero-secondary").setAttribute("href", "blog.html");
    document.getElementById("works-title").setAttribute("href", "works.html");
    document.getElementById("blog-title").setAttribute("href", "blog.html");
    document.getElementById("works-more-link").setAttribute("href", "works.html");
    document.getElementById("blog-more-link").setAttribute("href", "blog.html");

    renderStats(localeData);
    renderSpotlight(localeData);
    renderWorks(localeData);
    renderPicks(localeData);
    renderPosts(localeData);

    localeButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.locale === localeKey);
    });
  }

  localeButtons.forEach((button) => {
    button.addEventListener("click", () => applyLocale(button.dataset.locale));
  });

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    siteNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        siteNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  applyLocale(currentLocale);
});

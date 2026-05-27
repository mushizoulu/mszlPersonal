const picksDataReady = window.siteDataReady || Promise.resolve(window.siteData);

picksDataReady.then((siteData) => {
  const picksLocales = siteData.locales;
  const picksPerPage = siteData.itemLimit;
  const picksButtons = Array.from(document.querySelectorAll(".locale-button"));
  const picksSearchParams = new URLSearchParams(window.location.search);

  let picksLocale = picksLocales[window.localStorage.getItem("site-locale")]
    ? window.localStorage.getItem("site-locale")
    : "zh-Hans";
  let picksCurrentPage = Number(picksSearchParams.get("page") || "1");

  function excerptText(text) {
    return `${text.slice(0, 72)}...`;
  }

  function applyPicksLocale(localeKey) {
    picksLocale = localeKey;
    window.localStorage.setItem("site-locale", localeKey);
    const localeData = picksLocales[localeKey];

    document.documentElement.lang = localeData.site.htmlLang;
    document.title = `${localeData.site.name} | ${localeData.picksPage.title}`;
    document.querySelector('meta[name="description"]').setAttribute("content", localeData.picksPage.intro);

    document.getElementById("picks-site-name").textContent = localeData.site.name;
    document.getElementById("picks-site-tagline").textContent = localeData.site.tagline;
    document.getElementById("picks-archive-title").textContent = localeData.picksPage.title;
    document.getElementById("picks-archive-intro").textContent = localeData.picksPage.intro;
    document.getElementById("picks-back-home").textContent = localeData.buttons.backHome;
    document.getElementById("picks-prev-page").textContent = localeData.buttons.newer;
    document.getElementById("picks-next-page").textContent = localeData.buttons.older;

    document.querySelector('[data-locale="zh-Hans"]').textContent = localeData.switcher.hans;
    document.querySelector('[data-locale="zh-Hant"]').textContent = localeData.switcher.hant;
    document.querySelector('[data-locale="ja"]').textContent = localeData.switcher.ja;

    picksButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.locale === localeKey);
    });

    renderPicksArchive();
  }

  function renderPicksArchive() {
    const localeData = picksLocales[picksLocale];
    const picks = localeData.picks;
    const totalPages = Math.max(1, Math.ceil(picks.length / picksPerPage));
    picksCurrentPage = Math.min(Math.max(1, picksCurrentPage), totalPages);

    const start = (picksCurrentPage - 1) * picksPerPage;
    const pagePicks = picks.slice(start, start + picksPerPage);
    const list = document.getElementById("picks-archive-list");

    list.innerHTML = "";
    pagePicks.forEach((pick) => {
      const article = document.createElement("article");
      article.className = "archive-item pick-archive-item";
      const firstParagraph = pick.body[0] || pick.copy;
      article.innerHTML = `
        <div class="pick-archive-header">
          <h3><a class="archive-link pick-archive-title" href="pick-post.html?slug=${pick.slug}">${pick.title}</a></h3>
          <a class="button-primary pick-buy-button" href="${pick.productLink}" target="_blank" rel="noreferrer">${localeData.buttons.viewProduct}</a>
        </div>
        <p class="pick-archive-copy">${excerptText(firstParagraph)}</p>
      `;
      list.appendChild(article);
    });

    document.getElementById("picks-page-label").textContent = localeData.picksPage.pageLabel
      .replace("{page}", String(picksCurrentPage))
      .replace("{total}", String(totalPages));

    document.getElementById("picks-prev-page").disabled = picksCurrentPage <= 1;
    document.getElementById("picks-next-page").disabled = picksCurrentPage >= totalPages;

    const url = new URL(window.location.href);
    url.searchParams.set("page", String(picksCurrentPage));
    window.history.replaceState({}, "", url);
  }

  document.getElementById("picks-prev-page").addEventListener("click", () => {
    picksCurrentPage -= 1;
    renderPicksArchive();
  });

  document.getElementById("picks-next-page").addEventListener("click", () => {
    picksCurrentPage += 1;
    renderPicksArchive();
  });

  picksButtons.forEach((button) => {
    button.addEventListener("click", () => applyPicksLocale(button.dataset.locale));
  });

  applyPicksLocale(picksLocale);
});

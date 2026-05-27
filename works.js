const worksLocales = window.siteData.locales;
const worksPerPage = window.siteData.itemLimit;
const worksButtons = Array.from(document.querySelectorAll(".locale-button"));
const worksSearchParams = new URLSearchParams(window.location.search);

let worksLocale = worksLocales[window.localStorage.getItem("site-locale")] ? window.localStorage.getItem("site-locale") : "zh-Hans";
let worksCurrentPage = Number(worksSearchParams.get("page") || "1");

function applyWorksLocale(localeKey) {
  worksLocale = localeKey;
  window.localStorage.setItem("site-locale", localeKey);
  const localeData = worksLocales[localeKey];

  document.documentElement.lang = localeData.site.htmlLang;
  document.title = `${localeData.site.name} | ${localeData.worksPage.title}`;
  document.querySelector('meta[name="description"]').setAttribute("content", localeData.worksPage.intro);

  document.getElementById("works-site-name").textContent = localeData.site.name;
  document.getElementById("works-site-tagline").textContent = localeData.site.tagline;
  document.getElementById("works-archive-title").textContent = localeData.worksPage.title;
  document.getElementById("works-archive-intro").textContent = localeData.worksPage.intro;
  document.getElementById("works-back-home").textContent = localeData.buttons.backHome;
  document.getElementById("works-prev-page").textContent = localeData.buttons.newer;
  document.getElementById("works-next-page").textContent = localeData.buttons.older;

  document.querySelector('[data-locale="zh-Hans"]').textContent = localeData.switcher.hans;
  document.querySelector('[data-locale="zh-Hant"]').textContent = localeData.switcher.hant;
  document.querySelector('[data-locale="ja"]').textContent = localeData.switcher.ja;

  worksButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.locale === localeKey);
  });

  renderWorksArchive();
}

function renderWorksArchive() {
  const localeData = worksLocales[worksLocale];
  const works = localeData.works;
  const totalPages = Math.max(1, Math.ceil(works.length / worksPerPage));
  worksCurrentPage = Math.min(Math.max(1, worksCurrentPage), totalPages);

  const start = (worksCurrentPage - 1) * worksPerPage;
  const pageWorks = works.slice(start, start + worksPerPage);
  const list = document.getElementById("works-archive-list");

  list.innerHTML = "";
  pageWorks.forEach((work) => {
    const article = document.createElement("article");
    article.className = "archive-item work-archive-item";
    article.innerHTML = `
      <h3><a class="archive-link" href="${work.link}" target="_blank" rel="noreferrer">${work.title}</a></h3>
      <p class="work-archive-copy">${work.copy}</p>
      <a class="card-link" href="${work.link}" target="_blank" rel="noreferrer">${localeData.buttons.viewProduct}</a>
    `;
    list.appendChild(article);
  });

  document.getElementById("works-page-label").textContent = localeData.worksPage.pageLabel
    .replace("{page}", String(worksCurrentPage))
    .replace("{total}", String(totalPages));

  document.getElementById("works-prev-page").disabled = worksCurrentPage <= 1;
  document.getElementById("works-next-page").disabled = worksCurrentPage >= totalPages;

  const url = new URL(window.location.href);
  url.searchParams.set("page", String(worksCurrentPage));
  window.history.replaceState({}, "", url);
}

document.getElementById("works-prev-page").addEventListener("click", () => {
  worksCurrentPage -= 1;
  renderWorksArchive();
});

document.getElementById("works-next-page").addEventListener("click", () => {
  worksCurrentPage += 1;
  renderWorksArchive();
});

worksButtons.forEach((button) => {
  button.addEventListener("click", () => applyWorksLocale(button.dataset.locale));
});

applyWorksLocale(worksLocale);

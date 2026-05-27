const blogDataReady = window.siteDataReady || Promise.resolve(window.siteData);

blogDataReady.then((siteData) => {
  const blogLocales = siteData.locales;
  const perPage = siteData.itemLimit;
  const blogButtons = Array.from(document.querySelectorAll(".locale-button"));
  const searchParams = new URLSearchParams(window.location.search);

  let blogLocale = blogLocales[window.localStorage.getItem("site-locale")]
    ? window.localStorage.getItem("site-locale")
    : "zh-Hans";
  let currentPage = Number(searchParams.get("page") || "1");

  function applyBlogLocale(localeKey) {
    blogLocale = localeKey;
    window.localStorage.setItem("site-locale", localeKey);
    const localeData = blogLocales[localeKey];

    document.documentElement.lang = localeData.site.htmlLang;
    document.title = `${localeData.site.name} | ${localeData.blogPage.title}`;
    document.querySelector('meta[name="description"]').setAttribute("content", localeData.blogPage.intro);

    document.getElementById("blog-site-name").textContent = localeData.site.name;
    document.getElementById("blog-site-tagline").textContent = localeData.site.tagline;
    document.getElementById("archive-title").textContent = localeData.blogPage.title;
    document.getElementById("archive-intro").textContent = localeData.blogPage.intro;
    document.getElementById("blog-back-home").textContent = localeData.buttons.backHome;
    document.getElementById("prev-page").textContent = localeData.buttons.newer;
    document.getElementById("next-page").textContent = localeData.buttons.older;

    document.querySelector('[data-locale="zh-Hans"]').textContent = localeData.switcher.hans;
    document.querySelector('[data-locale="zh-Hant"]').textContent = localeData.switcher.hant;
    document.querySelector('[data-locale="ja"]').textContent = localeData.switcher.ja;

    blogButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.locale === localeKey);
    });

    renderArchive();
  }

  function renderArchive() {
    const localeData = blogLocales[blogLocale];
    const posts = localeData.posts;
    const totalPages = Math.max(1, Math.ceil(posts.length / perPage));
    currentPage = Math.min(Math.max(1, currentPage), totalPages);

    const start = (currentPage - 1) * perPage;
    const pagePosts = posts.slice(start, start + perPage);
    const list = document.getElementById("archive-list");

    list.innerHTML = "";
    pagePosts.forEach((post) => {
      const article = document.createElement("article");
      article.className = "archive-item";
      article.innerHTML = `
        <a class="archive-link" href="post.html?slug=${post.slug}">${post.title}</a>
      `;
      list.appendChild(article);
    });

    document.getElementById("archive-page-label").textContent = localeData.blogPage.pageLabel
      .replace("{page}", String(currentPage))
      .replace("{total}", String(totalPages));

    document.getElementById("prev-page").disabled = currentPage <= 1;
    document.getElementById("next-page").disabled = currentPage >= totalPages;

    const url = new URL(window.location.href);
    url.searchParams.set("page", String(currentPage));
    window.history.replaceState({}, "", url);
  }

  document.getElementById("prev-page").addEventListener("click", () => {
    currentPage -= 1;
    renderArchive();
  });

  document.getElementById("next-page").addEventListener("click", () => {
    currentPage += 1;
    renderArchive();
  });

  blogButtons.forEach((button) => {
    button.addEventListener("click", () => applyBlogLocale(button.dataset.locale));
  });

  applyBlogLocale(blogLocale);
});

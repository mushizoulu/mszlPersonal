const postDataReady = window.siteDataReady || Promise.resolve(window.siteData);

postDataReady.then((siteData) => {
  const postLocales = siteData.locales;
  const postButtons = Array.from(document.querySelectorAll(".locale-button"));
  const postParams = new URLSearchParams(window.location.search);

  let postLocale = postLocales[window.localStorage.getItem("site-locale")]
    ? window.localStorage.getItem("site-locale")
    : "zh-Hans";

  function renderPostPage(localeKey) {
    postLocale = localeKey;
    window.localStorage.setItem("site-locale", localeKey);
    const localeData = postLocales[localeKey];
    const slug = postParams.get("slug") || "";
    const post = localeData.posts.find((item) => item.slug === slug);

    document.documentElement.lang = localeData.site.htmlLang;
    document.getElementById("post-site-name").textContent = localeData.site.name;
    document.getElementById("post-site-tagline").textContent = localeData.site.tagline;
    document.getElementById("post-back-blog").textContent = localeData.buttons.backBlog;

    document.querySelector('[data-locale="zh-Hans"]').textContent = localeData.switcher.hans;
    document.querySelector('[data-locale="zh-Hant"]').textContent = localeData.switcher.hant;
    document.querySelector('[data-locale="ja"]').textContent = localeData.switcher.ja;

    postButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.locale === localeKey);
    });

    if (!post) {
      document.title = `${localeData.site.name} | ${localeData.postPage.missingTitle}`;
      document.getElementById("post-meta").textContent = "";
      document.getElementById("post-title").textContent = localeData.postPage.missingTitle;
      document.getElementById("post-body").innerHTML = `<p>${localeData.postPage.missingBody}</p>`;
      return;
    }

    document.title = `${localeData.site.name} | ${post.title}`;
    document.querySelector('meta[name="description"]').setAttribute("content", post.excerpt);
    document.getElementById("post-meta").textContent = `${post.category} / ${post.date}`;
    document.getElementById("post-title").textContent = post.title;
    document.getElementById("post-body").innerHTML = post.body.map((paragraph) => `<p>${paragraph}</p>`).join("");
  }

  postButtons.forEach((button) => {
    button.addEventListener("click", () => renderPostPage(button.dataset.locale));
  });

  renderPostPage(postLocale);
});

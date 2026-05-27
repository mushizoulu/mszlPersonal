const pickPostDataReady = window.siteDataReady || Promise.resolve(window.siteData);

pickPostDataReady.then((siteData) => {
  const pickPostLocales = siteData.locales;
  const pickPostButtons = Array.from(document.querySelectorAll(".locale-button"));
  const pickPostParams = new URLSearchParams(window.location.search);

  let pickPostLocale = pickPostLocales[window.localStorage.getItem("site-locale")]
    ? window.localStorage.getItem("site-locale")
    : "zh-Hans";

  function renderPickPost(localeKey) {
    pickPostLocale = localeKey;
    window.localStorage.setItem("site-locale", localeKey);
    const localeData = pickPostLocales[localeKey];
    const slug = pickPostParams.get("slug") || "";
    const pick = localeData.picks.find((item) => item.slug === slug);

    document.documentElement.lang = localeData.site.htmlLang;
    document.getElementById("pick-post-site-name").textContent = localeData.site.name;
    document.getElementById("pick-post-site-tagline").textContent = localeData.site.tagline;
    document.getElementById("pick-post-back").textContent = localeData.buttons.backPicks;

    document.querySelector('[data-locale="zh-Hans"]').textContent = localeData.switcher.hans;
    document.querySelector('[data-locale="zh-Hant"]').textContent = localeData.switcher.hant;
    document.querySelector('[data-locale="ja"]').textContent = localeData.switcher.ja;

    pickPostButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.locale === localeKey);
    });

    if (!pick) {
      document.title = `${localeData.site.name} | ${localeData.pickPostPage.missingTitle}`;
      document.getElementById("pick-post-title").textContent = localeData.pickPostPage.missingTitle;
      document.getElementById("pick-post-body").innerHTML = `<p>${localeData.pickPostPage.missingBody}</p>`;
      document.getElementById("pick-product-link").textContent = localeData.picksPage.viewProductText;
      document.getElementById("pick-product-link").href = "#";
      return;
    }

    document.title = `${localeData.site.name} | ${pick.title}`;
    document.querySelector('meta[name="description"]').setAttribute("content", pick.copy);
    document.getElementById("pick-post-title").textContent = pick.title;
    document.getElementById("pick-post-body").innerHTML = pick.body.map((paragraph) => `<p>${paragraph}</p>`).join("");
    document.getElementById("pick-product-link").textContent = localeData.picksPage.viewProductText;
    document.getElementById("pick-product-link").href = pick.productLink;
  }

  pickPostButtons.forEach((button) => {
    button.addEventListener("click", () => renderPickPost(button.dataset.locale));
  });

  renderPickPost(pickPostLocale);
});

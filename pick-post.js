const pickPostDataReady = window.siteDataReady || Promise.resolve(window.siteData);

pickPostDataReady.then((siteData) => {
  const pickPostLocales = siteData.locales;
  const pickPostButtons = Array.from(document.querySelectorAll(".locale-button"));
  const pickPostParams = new URLSearchParams(window.location.search);
  const pickPostBody = document.getElementById("pick-post-body");
  const pickPostShare = document.getElementById("pick-post-share");

  let pickPostLocale = pickPostLocales[window.localStorage.getItem("site-locale")]
    ? window.localStorage.getItem("site-locale")
    : "zh-Hans";

  function renderBodyContent(container, items) {
    container.innerHTML = "";

    if (!Array.isArray(items)) {
      return;
    }

    items.forEach((item) => {
      if (typeof item === "string") {
        const paragraph = document.createElement("p");
        paragraph.textContent = item;
        container.appendChild(paragraph);
        return;
      }

      if (!item || typeof item !== "object") {
        return;
      }

      if (item.type === "image" && typeof item.src === "string" && item.src.trim()) {
        const figure = document.createElement("figure");
        figure.className = "post-body-figure";

        const image = document.createElement("img");
        image.className = "post-body-image";
        image.src = item.src;
        image.alt = typeof item.alt === "string" ? item.alt : "";
        image.loading = "lazy";

        figure.appendChild(image);

        if (typeof item.caption === "string" && item.caption.trim()) {
          const caption = document.createElement("figcaption");
          caption.className = "post-body-caption";
          caption.textContent = item.caption;
          figure.appendChild(caption);
        }

        container.appendChild(figure);
        return;
      }

      if (item.type !== "table" || !Array.isArray(item.rows) || item.rows.length === 0) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "post-body-table-wrap";

      const table = document.createElement("table");
      table.className = "post-body-table";

      if (Array.isArray(item.headers) && item.headers.length > 0) {
        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");

        item.headers.forEach((header) => {
          const th = document.createElement("th");
          th.scope = "col";
          th.textContent = `${header ?? ""}`;
          headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        table.appendChild(thead);
      }

      const tbody = document.createElement("tbody");

      item.rows.forEach((row) => {
        if (!Array.isArray(row)) {
          return;
        }

        const tr = document.createElement("tr");
        row.forEach((cell) => {
          const td = document.createElement("td");
          td.textContent = `${cell ?? ""}`;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });

      if (!tbody.children.length) {
        return;
      }

      table.appendChild(tbody);
      wrapper.appendChild(table);
      container.appendChild(wrapper);
    });
  }

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
      renderBodyContent(pickPostBody, [localeData.pickPostPage.missingBody]);
      if (pickPostShare) {
        pickPostShare.innerHTML = "";
        pickPostShare.className = "";
      }
      document.getElementById("pick-product-link").textContent = localeData.picksPage.viewProductText;
      document.getElementById("pick-product-link").href = "#";
      return;
    }

    document.title = `${localeData.site.name} | ${pick.title}`;
    document.querySelector('meta[name="description"]').setAttribute("content", pick.copy);
    document.getElementById("pick-post-title").textContent = pick.title;
    renderBodyContent(pickPostBody, pick.body);
    if (pickPostShare && window.siteShare) {
      window.siteShare.renderShareBlock(pickPostShare, {
        variant: "reading",
        labels: localeData.share,
        payload: {
          title: pick.title,
          excerpt: pick.copy || window.siteShare.extractExcerptFromBody(pick.body),
          url: window.location.href
        }
      });
    }
    document.getElementById("pick-product-link").textContent = localeData.picksPage.viewProductText;
    document.getElementById("pick-product-link").href = pick.productLink;
  }

  pickPostButtons.forEach((button) => {
    button.addEventListener("click", () => renderPickPost(button.dataset.locale));
  });

  renderPickPost(pickPostLocale);
});

const postDataReady = window.siteDataReady || Promise.resolve(window.siteData);

postDataReady.then((siteData) => {
  const postLocales = siteData.locales;
  const postButtons = Array.from(document.querySelectorAll(".locale-button"));
  const postParams = new URLSearchParams(window.location.search);
  const postBody = document.getElementById("post-body");
  const postNav = document.getElementById("post-reading-nav");
  const postPrevLink = document.getElementById("post-prev-link");
  const postNextLink = document.getElementById("post-next-link");

  let postLocale = postLocales[window.localStorage.getItem("site-locale")]
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

  function renderPostPage(localeKey) {
    postLocale = localeKey;
    window.localStorage.setItem("site-locale", localeKey);
    const localeData = postLocales[localeKey];
    const slug = postParams.get("slug") || "";
    const posts = Array.isArray(localeData.posts) ? localeData.posts : [];
    const postIndex = posts.findIndex((item) => item.slug === slug);
    const post = postIndex >= 0 ? posts[postIndex] : undefined;

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
      renderBodyContent(postBody, [localeData.postPage.missingBody]);
      if (postNav) {
        postNav.hidden = true;
      }
      return;
    }

    document.title = `${localeData.site.name} | ${post.title}`;
    document.querySelector('meta[name="description"]').setAttribute("content", post.excerpt);
    document.getElementById("post-meta").textContent = `${post.category} / ${post.date}`;
    document.getElementById("post-title").textContent = post.title;
    renderBodyContent(postBody, post.body);

    if (postNav && postPrevLink && postNextLink) {
      const prevPost = postIndex > 0 ? posts[postIndex - 1] : null;
      const nextPost = postIndex < posts.length - 1 ? posts[postIndex + 1] : null;

      postNav.hidden = false;

      postPrevLink.textContent = localeData.postPage.previous;
      if (prevPost) {
        postPrevLink.href = `post.html?slug=${prevPost.slug}`;
        postPrevLink.classList.remove("is-disabled");
        postPrevLink.removeAttribute("aria-disabled");
        postPrevLink.tabIndex = 0;
      } else {
        postPrevLink.href = "#";
        postPrevLink.classList.add("is-disabled");
        postPrevLink.setAttribute("aria-disabled", "true");
        postPrevLink.tabIndex = -1;
      }

      postNextLink.textContent = localeData.postPage.next;
      if (nextPost) {
        postNextLink.href = `post.html?slug=${nextPost.slug}`;
        postNextLink.classList.remove("is-disabled");
        postNextLink.removeAttribute("aria-disabled");
        postNextLink.tabIndex = 0;
      } else {
        postNextLink.href = "#";
        postNextLink.classList.add("is-disabled");
        postNextLink.setAttribute("aria-disabled", "true");
        postNextLink.tabIndex = -1;
      }
    }
  }

  postButtons.forEach((button) => {
    button.addEventListener("click", () => renderPostPage(button.dataset.locale));
  });

  renderPostPage(postLocale);
});

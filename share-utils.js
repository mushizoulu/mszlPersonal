(function initSiteShare() {
  function normalizeText(value) {
    return `${value || ""}`.replace(/\s+/g, " ").trim();
  }

  function truncateText(value, maxLength) {
    const text = normalizeText(value);
    if (!text || text.length <= maxLength) {
      return text;
    }

    return `${text.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
  }

  function extractExcerptFromBody(items, maxLength = 120) {
    if (!Array.isArray(items)) {
      return "";
    }

    for (const item of items) {
      if (typeof item === "string" && normalizeText(item)) {
        return truncateText(item, maxLength);
      }

      if (!item || typeof item !== "object") {
        continue;
      }

      if (Array.isArray(item.rows)) {
        for (const row of item.rows) {
          if (!Array.isArray(row)) {
            continue;
          }

          const rowText = normalizeText(row.join(" "));
          if (rowText) {
            return truncateText(rowText, maxLength);
          }
        }
      }

      if (typeof item.caption === "string" && normalizeText(item.caption)) {
        return truncateText(item.caption, maxLength);
      }
    }

    return "";
  }

  function buildShareText(payload) {
    const parts = [
      normalizeText(payload.title),
      normalizeText(payload.excerpt),
      normalizeText(payload.url)
    ].filter(Boolean);

    return parts.join("\n");
  }

  function buildXUrl(payload) {
    const url = new URL("https://twitter.com/intent/tweet");
    const textParts = [normalizeText(payload.title), normalizeText(payload.excerpt)].filter(Boolean);
    if (textParts.length) {
      url.searchParams.set("text", textParts.join(" - "));
    }
    url.searchParams.set("url", payload.url);
    return url.toString();
  }

  function buildWeiboUrl(payload) {
    const url = new URL("https://service.weibo.com/share/share.php");
    const textParts = [normalizeText(payload.title), normalizeText(payload.excerpt)].filter(Boolean);
    url.searchParams.set("title", textParts.length ? `${textParts.join(" - ")} ${payload.url}` : payload.url);
    url.searchParams.set("url", payload.url);
    return url.toString();
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  }

  function openExternal(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function createButton(label, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "share-button";
    button.textContent = label;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderShareBlock(container, options) {
    if (!container || !options || !options.labels || !options.payload) {
      return;
    }

    const payload = {
      title: normalizeText(options.payload.title),
      excerpt: normalizeText(options.payload.excerpt),
      url: options.payload.url || window.location.href
    };
    const labels = options.labels;
    const shareText = buildShareText(payload);

    container.innerHTML = "";
    container.className = "share-block";
    if (options.variant) {
      container.classList.add(`share-block--${options.variant}`);
    }

    const title = document.createElement("p");
    title.className = "share-title";
    title.textContent = labels.title;

    const actions = document.createElement("div");
    actions.className = "share-actions";

    const feedback = document.createElement("p");
    feedback.className = "share-feedback";
    feedback.setAttribute("aria-live", "polite");

    function setFeedback(message) {
      feedback.textContent = message || "";
    }

    actions.append(
      createButton(labels.x, () => {
        setFeedback("");
        openExternal(buildXUrl(payload));
      }),
      createButton(labels.threads, async () => {
        const copied = await copyText(shareText);
        setFeedback(copied ? labels.threadsCopied : labels.copyFailed);
        openExternal("https://www.threads.net/");
      }),
      createButton(labels.weibo, () => {
        setFeedback("");
        openExternal(buildWeiboUrl(payload));
      }),
      createButton(labels.copyLink, async () => {
        const copied = await copyText(payload.url);
        setFeedback(copied ? labels.copySuccess : labels.copyFailed);
      })
    );

    container.append(title, actions, feedback);
  }

  window.siteShare = {
    extractExcerptFromBody,
    renderShareBlock
  };
})();

(function initContentLoader() {
  window.siteContentChunks = window.siteContentChunks || [];
  window.siteContentFiles = window.siteContentFiles || [];

  function normalizeLocaleTargets(chunk) {
    if (Array.isArray(chunk.locales) && chunk.locales.length > 0) {
      return chunk.locales;
    }

    if (typeof chunk.locale === "string" && chunk.locale) {
      return [chunk.locale];
    }

    return [];
  }

  function mergeArrayField(localeData, chunk, key, mode) {
    if (!Array.isArray(chunk[key]) || chunk[key].length === 0) {
      return;
    }

    const currentItems = Array.isArray(localeData[key]) ? localeData[key] : [];
    localeData[key] = mode === "prepend"
      ? chunk[key].concat(currentItems)
      : currentItems.concat(chunk[key]);
  }

  function mergeContentChunk(chunk) {
    const targetLocales = normalizeLocaleTargets(chunk);
    const mode = chunk.mode === "prepend" ? "prepend" : "append";

    targetLocales.forEach((localeKey) => {
      const localeData = window.siteData.locales[localeKey];
      if (!localeData) {
        return;
      }

      mergeArrayField(localeData, chunk, "works", mode);
      mergeArrayField(localeData, chunk, "posts", mode);
      mergeArrayField(localeData, chunk, "picks", mode);
    });
  }

  function loadScript(path) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `${path}?v=20260527b`;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.appendChild(script);
    });
  }

  async function loadContentFiles() {
    const baseData = window.siteData;
    if (!baseData || !baseData.locales) {
      throw new Error("Base site data is missing.");
    }

    for (const file of window.siteContentFiles) {
      await loadScript(file);
    }

    window.siteContentChunks.forEach((chunk) => {
      mergeContentChunk(chunk);
    });

    return baseData;
  }

  window.siteDataReady = loadContentFiles().catch((error) => {
    console.warn("Content files could not be loaded.", error);
    return window.siteData;
  });
})();

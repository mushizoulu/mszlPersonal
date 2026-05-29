(function initAssetLoader() {
  const currentScript = document.currentScript;
  const pageScript = currentScript && currentScript.dataset
    ? currentScript.dataset.pageScript
    : "";
  const version = window.__ASSET_VERSION__ || "20260529e";

  function appendStylesheet() {
    if (document.querySelector('link[data-asset-style="styles"]')) {
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `styles.css?v=${encodeURIComponent(version)}`;
    link.dataset.assetStyle = "styles";
    document.head.appendChild(link);
  }

  function loadScript(path) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = `${path}?v=${encodeURIComponent(version)}`;
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.body.appendChild(script);
    });
  }

  async function loadPageAssets() {
    const sharedScripts = [
      "site-data.js",
      "content/manifest.js",
      "content-loader.js"
    ];
    const scriptQueue = pageScript ? sharedScripts.concat(pageScript) : sharedScripts;

    for (const path of scriptQueue) {
      await loadScript(path);
    }
  }

  appendStylesheet();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadPageAssets, { once: true });
  } else {
    loadPageAssets();
  }
})();

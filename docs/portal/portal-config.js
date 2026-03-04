/* Portal API Configuration
   Reads `portal_api_base` from localStorage (e.g. "https://xxx.trycloudflare.com")
   and prepends it to API paths. If not set, falls back to relative paths. */

(function () {
  const base = (localStorage.getItem('portal_api_base') || '').replace(/\/+$/, '');
  window.portalApiUrl = function (path) {
    return base ? base + path : path;
  };
})();

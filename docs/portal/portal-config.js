/* Portal API Configuration
   Reads from localStorage:
   - portal_api_base: tunnel URL (e.g. "https://xxx.trycloudflare.com")
   - portal_api_token: Bearer token for gateway auth

   Each dashboard sets window.PORTAL_SERVICE before loading this script
   (e.g. "mission-control", "isarv", "fitness").

   When a base URL is configured, API paths like "/api/dashboard" become
   "https://xxx.trycloudflare.com/api/mission-control/dashboard" to match
   the gateway's routing pattern /api/<service>/<path>. */

(function () {
  var base = (localStorage.getItem('portal_api_base') || '').replace(/\/+$/, '');
  var token = localStorage.getItem('portal_api_token') || '';
  var service = window.PORTAL_SERVICE || '';

  window.portalApiUrl = function (path) {
    if (!base) return path;
    // Transform /api/foo → /api/<service>/foo
    if (service && path.startsWith('/api/')) {
      path = '/api/' + service + '/' + path.slice(5);
    }
    return base + path;
  };

  // Patch global fetch to inject Authorization header when calling the tunnel
  if (base && token) {
    var _origFetch = window.fetch;
    window.fetch = function (url, opts) {
      if (typeof url === 'string' && url.startsWith(base)) {
        opts = opts || {};
        opts.headers = opts.headers || {};
        if (opts.headers instanceof Headers) {
          if (!opts.headers.has('Authorization')) opts.headers.set('Authorization', 'Bearer ' + token);
        } else if (Array.isArray(opts.headers)) {
          if (!opts.headers.some(function (h) { return h[0].toLowerCase() === 'authorization'; })) {
            opts.headers.push(['Authorization', 'Bearer ' + token]);
          }
        } else {
          if (!opts.headers['Authorization'] && !opts.headers['authorization']) {
            opts.headers['Authorization'] = 'Bearer ' + token;
          }
        }
      }
      return _origFetch.call(this, url, opts);
    };
  }
})();

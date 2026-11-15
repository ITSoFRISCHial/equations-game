// Cloudflare Worker that serves the static export and adds host-based routing.
//
// - times.jeremyfrisch.org/            -> the Times game (static index.html)
// - equationsgame.jeremyfrisch.org/    -> redirect to the Times game's own domain
// - /add  -> the original add/subtract game
// - /times -> the Times game
//
// All other requests are served straight from the static assets.

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/" && url.hostname === "equationsgame.jeremyfrisch.org") {
      return Response.redirect("https://times.jeremyfrisch.org/", 302);
    }

    return env.ASSETS.fetch(request);
  },
};

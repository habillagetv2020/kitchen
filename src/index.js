export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API route: receive contact form submissions and store them in D1
    if (url.pathname === "/api/contact" && request.method === "POST") {
      try {
        const data = await request.json();
        const name = (data.name || "").toString().trim();
        const email = (data.email || "").toString().trim();
        const party = (data.party || "").toString().trim();
        const message = (data.message || "").toString().trim();

        if (!name || !email) {
          return jsonResponse({ error: "Name and email are required." }, 400);
        }

        await env.DB.prepare(
          `INSERT INTO messages (name, email, party, message, created_at)
           VALUES (?, ?, ?, ?, datetime('now'))`
        ).bind(name, email, party, message).run();

        return jsonResponse({ ok: true });
      } catch (err) {
        return jsonResponse({ error: "Something went wrong. Please try again." }, 500);
      }
    }

    // Everything else: serve the static site files
    return env.ASSETS.fetch(request);
  }
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

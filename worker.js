export default {
  async fetch(request, env) {
    const relayKey = env.RELAY_KEY;
    const clientKey = request.headers.get("x-api-key");

    if (!relayKey || clientKey !== relayKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const reqBody = await request.json().catch(() => ({}));
    const { url, body, method = "POST", token, "Access-Token": accessToken } = reqBody;

    if (!url) return new Response(`Missing URL`, { status: 400 });

    const cleanToken = (token || accessToken || "").trim();
    if (!cleanToken) return new Response(`Missing Token`, { status: 400 });

    let fetchUrl = url;
    const targetMethod = method.toUpperCase();

    let fetchOptions = {
      method: targetMethod,
      headers: {
        "Access-Token": cleanToken,
        "Content-Type": "application/json"
      }
    };

    if (targetMethod === "GET") {
      const qs = new URLSearchParams();
      for (const [k, v] of Object.entries(body || {})) {
        if (typeof v === "object") qs.append(k, JSON.stringify(v));
        else qs.append(k, v);
      }
      fetchUrl += (fetchUrl.includes("?") ? "&" : "?") + qs.toString();
    } else {
      fetchOptions.body = JSON.stringify(body || {});
    }

    let resp = await fetch(fetchUrl, fetchOptions);
    const text = await resp.text();

    return new Response(text, {
      status: resp.status,
      headers: { "Content-Type": resp.headers.get("content-type") || "text/plain" }
    });
  }
};

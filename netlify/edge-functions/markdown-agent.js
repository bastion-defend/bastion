/**
 * Markdown-for-Agents: content negotiation edge function.
 *
 * When a request includes `Accept: text/markdown`, rewrite the URL
 * to serve a markdown version of the page.  Browsers without the
 * header get the normal HTML SPA.
 *
 * Path                Markdown variant
 * /                →  /index.md
 * /integrate       →  /integrate.md
 * /dashboard       →  /dashboard.md
 */

export default async function handler(request: Request, context: any) {
  const url = new URL(request.url);
  const accept = request.headers.get("accept") || "";

  if (!accept.includes("text/markdown")) {
    return context.next();
  }

  const pathname = url.pathname;

  if (pathname === "/" || pathname === "") {
    url.pathname = "/index.md";
  } else if (pathname === "/integrate") {
    url.pathname = "/integrate.md";
  } else if (pathname === "/dashboard") {
    url.pathname = "/dashboard.md";
  } else {
    return context.next();
  }

  const mdReq = new Request(url.toString(), request);
  const response = await context.next(mdReq);

  if (response.status === 200) {
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Content-Type", "text/markdown; charset=UTF-8");
    newHeaders.set("X-Markdown-Tokens", String(response.headers.get("content-length") || 0));
    return new Response(response.body, {
      status: 200,
      headers: newHeaders,
    });
  }

  return context.next();
}

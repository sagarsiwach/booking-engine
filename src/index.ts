import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const limit = Math.max(1, Math.min(parseInt(url.searchParams.get("limit") || "10", 10), 100));
      const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10));
      const stmt = env.DB.prepare(`SELECT * FROM comments LIMIT ? OFFSET ?`);
      const { results } = await stmt.bind(limit, offset).all();

      return new Response(JSON.stringify({ success: true, data: results }), {
        headers: { "content-type": "application/json" },
        status: 200,
      });
    } catch (err) {
      let errorMsg = "Internal Server Error";
      if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
        errorMsg = (err as any).message;
      }
      return new Response(JSON.stringify({ success: false, error: errorMsg }), {
        headers: { "content-type": "application/json" },
        status: 500,
      });
    }
  },
} satisfies ExportedHandler<Env>;

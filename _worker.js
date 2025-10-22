/**
 * ✅ BPB Pages Worker（兼容 Cloudflare Pages 环境）
 * 修复 /sub 返回空白问题
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const target = url.searchParams.get("target") || "v2ray";

    // ✅ 自动识别 KV 名称（兼容 kv/KV）
    const kv = env.kv || env.KV;

    // 订阅接口
    if (pathname.startsWith("/sub")) {
      try {
        const data = await kv.get("proxy");
        if (!data || data.trim() === "") {
          return new Response("⚠️ KV 数据为空，请检查是否已导入节点。", {
            status: 200,
            headers: { "content-type": "text/plain; charset=utf-8" }
          });
        }

        const type =
          target === "clash"
            ? "application/yaml; charset=utf-8"
            : "application/json; charset=utf-8";

        return new Response(data, {
          status: 200,
          headers: {
            "content-type": type,
            "cache-control": "no-cache"
          }
        });
      } catch (err) {
        return new Response("❌ 读取 KV 出错：" + err.message, { status: 500 });
      }
    }

    // 首页测试
    if (pathname === "/" || pathname === "/test") {
      return new Response(
        `✅ BPB Pages Worker 运行中\nKV绑定：${kv ? "✅" : "❌"}\n时间：${new Date().toISOString()}`,
        { headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    return new Response("404 Not Found", { status: 404 });
  }
};

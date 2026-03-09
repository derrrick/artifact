import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ frameable: false }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeout);

    const xfo = (res.headers.get("x-frame-options") || "").toLowerCase();
    const csp = res.headers.get("content-security-policy") || "";

    const blocked =
      xfo === "deny" ||
      xfo === "sameorigin" ||
      xfo.includes("deny") ||
      xfo.includes("sameorigin") ||
      (csp.includes("frame-ancestors") &&
        !csp.includes("frame-ancestors *"));

    return NextResponse.json({ frameable: !blocked });
  } catch {
    return NextResponse.json({ frameable: false });
  }
}

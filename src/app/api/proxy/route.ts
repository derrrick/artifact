import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: controller.signal,
      cache: "no-store",
    });

    clearTimeout(timeout);

    const contentType = response.headers.get("content-type") || "text/html";
    let body = await response.text();

    // Inject <base> so relative URLs resolve to the original origin
    const baseTag = `<base href="${parsed.origin}/">`;
    body = body.replace(/(<head[^>]*>)/i, `$1\n${baseTag}`);

    // Remove any CSP meta tags that would block resources loading from the proxied context
    body = body.replace(/<meta[^>]*http-equiv=["']content-security-policy["'][^>]*>/gi, "");

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch the requested URL" },
      { status: 502 }
    );
  }
}

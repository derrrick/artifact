import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_PATH = join(process.cwd(), "src/data/inspiration_websites.json");

export async function DELETE(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  try {
    const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
    let removed = false;

    for (const bucket of data.buckets) {
      const before = bucket.sources.length;
      bucket.sources = bucket.sources.filter(
        (s: { url: string }) => s.url !== url
      );
      if (bucket.sources.length < before) removed = true;
    }

    if (!removed) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    data.metadata.total_sources = data.buckets.reduce(
      (sum: number, b: { sources: unknown[] }) => sum + b.sources.length,
      0
    );

    writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
    return NextResponse.json({ ok: true, total: data.metadata.total_sources });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

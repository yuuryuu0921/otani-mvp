import { NextResponse } from "next/server";

type Article = {
  id: number;
  title: string | null;
  url: string;
  excerpt: string | null;
  published_at: string | null;
  source_name: string | null;
};

export async function GET() {
  // 記事を取得 (最新50件)
  const res = await fetch("https://otani-matome.com/api/articles?limit=50", {
    cache: "no-store",
  });
  const articles: Article[] = await res.json();

  // RSSのXMLを組み立てる
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>大谷翔平ニュースフィード</title>
  <link>https://otani-matome.com/</link>
  <description>大谷翔平に関する最新ニュースを配信します。</description>
  <language>ja</language>
  ${articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title ?? "(無題)"}]]></title>
      <link>${a.url}</link>
      <description><![CDATA[${a.excerpt ?? ""}]]></description>
      <pubDate>${a.published_at ? new Date(a.published_at).toUTCString() : ""}</pubDate>
      <source>${a.source_name ?? "不明"}</source>
    </item>`
    )
    .join("")}
</channel>
</rss>`;

  return new NextResponse(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

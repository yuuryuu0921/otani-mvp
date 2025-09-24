// app/articles/source/[id]/page.tsx
import { Metadata } from "next";
import SourceArticles from "./SourceArticles";

type Article = {
  id: number;
  title: string | null;
  url: string;
  excerpt: string | null;
  published_at: string | null;
  source_name: string | null;
  thumbnail: string | null;
  source_icon: string | null; // ← 追加
};

// ✅ metadata
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const res = await fetch(`http://otani-matome.com/api/sources`, { cache: "no-store" });
  const sources = await res.json();
  const source = sources.find((s: any) => String(s.id) === params.id);

  const sourceName = source ? source.name : "不明な出典";

  return {
    title: `${sourceName} の記事一覧 | Shohei Ohtani News`,
    description: `出典「${sourceName}」に基づく大谷翔平の最新ニュースをまとめています。成績速報、移籍情報、海外メディアの反応などを一括チェック！`,
    openGraph: {
      title: `${sourceName} の記事一覧`,
      description: `出典「${sourceName}」に基づく大谷翔平の最新ニュースまとめ。`,
      type: "website",
      locale: "ja_JP",
      siteName: "Shohei Ohtani News",
    },
    twitter: {
      card: "summary_large_image",
      title: `${sourceName} の記事一覧`,
      description: `出典「${sourceName}」の記事一覧をまとめました。`,
    },
  };
}

// ✅ JSON-LD 生成
async function getArticlesForJsonLd(sourceId: string): Promise<Article[]> {
  const res = await fetch(`http://otani-matome.com/api/articles/by-source/${sourceId}?limit=20`, { cache: "no-store" });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function Page({ params }: { params: { id: string } }) {
  const articles = await getArticlesForJsonLd(params.id);
  const sourceName = articles[0]?.source_name || "不明な出典";

  // JSON-LD データ
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${sourceName} の記事一覧`,
    description: `出典「${sourceName}」に基づく大谷翔平の最新ニュースまとめ。`,
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: a.url,
      item: {
        "@type": "NewsArticle",
        headline: a.title ?? "(無題)",
        datePublished: a.published_at ?? undefined,
        publisher: {
          "@type": "Organization",
          name: a.source_name ?? sourceName,
        },
        image: a.thumbnail ?? undefined,
        description: a.excerpt ?? undefined,
      },
    })),
  };

  return (
    <>
      {/* ✅ JSON-LD 埋め込み */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SourceArticles sourceId={params.id} />
    </>
  );
}

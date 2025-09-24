// app/articles/otani/page.tsx
import { Metadata } from "next";

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
export const metadata: Metadata = {
  title: "大谷翔平 記事一覧 | Shohei Ohtani News",
  description:
    "大谷翔平に関する最新ニュース記事をまとめています。移籍情報、成績速報、海外メディアの反応などを一括チェック！",
  openGraph: {
    title: "大谷翔平 記事一覧",
    description:
      "大谷翔平に関する最新ニュースまとめ。MLBの成績速報や海外メディアの反応もチェック！",
    type: "website",
    locale: "ja_JP",
    siteName: "Shohei Ohtani News",
  },
  twitter: {
    card: "summary_large_image",
    title: "大谷翔平 記事一覧",
    description: "大谷翔平に関する最新ニュースまとめ。",
  },
};

// ✅ 記事データ取得 (サーバーサイド)
async function getArticles(): Promise<Article[]> {
  const res = await fetch("http://otani-matome.com:8000/api/articles/otani?limit=20", {
    cache: "no-store",
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default async function OtaniArticlesPage() {
  const articles = await getArticles();

  if (articles.length === 0) {
    return <p className="p-4">大谷翔平の記事が見つかりませんでした。</p>;
  }

  // ✅ JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "大谷翔平 記事一覧",
    description:
      "大谷翔平に関する最新ニュース記事をまとめています。移籍情報、成績速報、海外メディアの反応などを一括チェック！",
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
          name: a.source_name ?? "不明な出典",
        },
        image: a.thumbnail ?? undefined,
        description: a.excerpt ?? undefined,
      },
    })),
  };

  return (
    <main className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* ✅ JSON-LD を埋め込み */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">
        大谷翔平 記事一覧
      </h1>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row border rounded-lg overflow-hidden shadow hover:shadow-md hover:bg-gray-50 transition"
          >
            {a.thumbnail && (
              <img
                src={a.thumbnail}
                alt={a.title ?? "サムネイル"}
                className="w-full sm:w-32 sm:h-24 object-cover"
              />
            )}

            <div className="flex-1 p-3">
              <h2 className="font-semibold text-lg line-clamp-2">
                {a.title ?? "(無題)"}
              </h2>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                {a.published_at && (
                    <span>{new Date(a.published_at).toLocaleString("ja-JP")}</span>
                )}
                {a.source_name && (
                    <span className="flex items-center gap-1 text-gray-400">
                    {a.source_icon && (
                        <img
                        src={a.source_icon}
                        alt={a.source_name ?? "source icon"}
                        className="w-4 h-4 rounded-full"
                        />
                    )}
                    {a.source_name}
                    </span>
                )}
                </div>
              {a.excerpt && (
                <p className="mt-2 text-sm text-gray-700 line-clamp-3">
                  {a.excerpt}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

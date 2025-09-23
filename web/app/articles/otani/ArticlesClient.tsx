// app/ArticlesClient.tsx
"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

type Article = {
  id: number;
  title: string | null;
  url: string;
  excerpt: string | null;
  published_at: string | null;
  source_name: string | null;
  thumbnail: string | null;
};

export default function ArticlesClient() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/articles/otani?limit=20")
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;
  if (articles.length === 0)
    return <p className="p-4">大谷翔平の記事が見つかりませんでした。</p>;

  const ogImage = articles[0]?.thumbnail ?? "/default-ogp.jpg";
  const description =
    "大谷翔平に関する最新ニュース記事をまとめています。移籍情報、成績速報、海外メディアの反応などを一括チェック！";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "大谷翔平 記事一覧",
    description: description,
    itemListElement: articles.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: a.url,
      name: a.title ?? "(無題)",
    })),
  };

  return (
    <main className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* ✅ 構造化データ */}
      <Script
        id="otani-articles-jsonld"
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

              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                {a.published_at && (
                  <span>
                    {new Date(a.published_at).toLocaleDateString("ja-JP")}
                  </span>
                )}
                {a.source_name && (
                  <span className="text-gray-400">({a.source_name})</span>
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

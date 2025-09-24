// app/articles/source/[id]/SourceArticles.tsx
"use client";

import { useEffect, useState } from "react";

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

export default function SourceArticles({ sourceId }: { sourceId: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sourceId) return;
    fetch(`https://otani-matome.com/api/articles/by-source/${sourceId}?limit=20`)
      .then((res) => res.json())
      .then((data) => {
        setArticles(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sourceId]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (articles.length === 0) return <p className="p-4">記事が見つかりませんでした。</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        出典: {articles[0]?.source_name || "不明"}
      </h1>
      <div className="space-y-4">
        {articles.map((a) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex border rounded-lg p-4 shadow hover:bg-gray-50 transition gap-4"
          >
            {a.thumbnail && (
              <img
                src={a.thumbnail}
                alt={a.title ?? "サムネイル"}
                className="w-32 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h2 className="font-semibold text-lg">{a.title ?? "(無題)"}</h2>
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
              {a.excerpt && <p className="mt-2 text-gray-700">{a.excerpt}</p>}
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}

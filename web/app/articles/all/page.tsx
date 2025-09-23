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


export default function AllArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (pageNum: number) => {
    try {
      const res = await fetch(
        `http://localhost:8000/api/articles?limit=20&offset=${pageNum * 20}`
      );
      const data = await res.json();

      if (data.length === 0) {
        setHasMore(false);
        return;
      }

      if (pageNum === 0) {
        setArticles(data);
      } else {
        setArticles((prev) => [...prev, ...data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  if (loading && page === 0) return <p className="p-4">Loading...</p>;

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">全記事一覧</h1>
      <div className="space-y-4">
        {articles.map((a) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex gap-4 border rounded-lg p-4 shadow hover:bg-gray-50 transition"
          >
            {/* サムネイル */}
            {a.thumbnail && (
              <img
                src={a.thumbnail}
                alt={a.title ?? "サムネイル"}
                className="w-32 h-20 object-cover rounded"
              />
            )}

            {/* テキスト部分 */}
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

              {a.excerpt && (
                <p className="mt-2 text-gray-700 line-clamp-2">{a.excerpt}</p>
              )}
            </div>
          </a>
        ))}
      </div>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            もっと見る
          </button>
        </div>
      )}
    </main>
  );
}

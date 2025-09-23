"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Article = {
  id: number;
  title: string | null;
  url: string;
  excerpt: string | null;
  published_at: string | null;
};

export default function ArticleDetailPage() {
  const params = useParams();
  const id = params?.id; // /articles/[id]
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://localhost:8000/api/articles/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p className="p-4">Loading...</p>;
  if (!article) return <p className="p-4">記事が見つかりませんでした</p>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{article.title ?? "(無題)"}</h1>
      {article.published_at && (
        <p className="text-sm text-gray-500 mb-2">
          {new Date(article.published_at).toLocaleString("ja-JP")}
        </p>
      )}
      {article.excerpt && (
        <p className="text-gray-700 whitespace-pre-line mb-6">{article.excerpt}</p>
      )}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 underline"
      >
        元記事を読む
      </a>
    </main>
  );
}

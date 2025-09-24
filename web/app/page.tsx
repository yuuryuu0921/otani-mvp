// app/page.tsx
import { Metadata } from "next";
import Link from "next/link"; // ← 追加

export const metadata: Metadata = {
  title: "Shohei Ohtani News | 大谷翔平まとめサイト",
  description:
    "大谷翔平に関するニュース・成績・移籍情報をまとめたポータルサイト。MLB最新速報から海外メディアの反応まで一括チェック！",
  openGraph: {
    title: "Shohei Ohtani News | 大谷翔平まとめサイト",
    description:
      "大谷翔平に関する最新ニュースや成績速報、海外メディアの反応をまとめています。",
    url: "https://otani-matome.com",
    siteName: "Shohei Ohtani News",
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shohei Ohtani News | 大谷翔平まとめサイト",
    description: "大谷翔平に関する最新ニュースまとめポータル。",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Shohei Ohtani News",
    url: "https://otani-matome.com",
    description:
      "大谷翔平に関するニュース・成績・移籍情報をまとめたポータルサイト。",
    publisher: {
      "@type": "Organization",
      name: "Shohei Ohtani News 運営事務局",
      url: "https://otani-matome.com",
      logo: {
        "@type": "ImageObject",
        url: "https://otani-matome.com/logo.png",
      },
    },
    potentialAction: {
      "@type": "SearchAction",
      target: "https://otani-matome.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="text-3xl font-bold mb-6 text-center">
        Shohei Ohtani News
      </h1>

      <p className="text-lg text-gray-700 leading-relaxed mb-6 text-center">
        大谷翔平に関するニュース・成績・移籍情報をまとめたポータルサイト。
        <br />
        MLBの最新速報や海外メディアの反応をいち早くお届けします。
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/articles/otani"
          className="block border rounded-lg p-6 shadow hover:shadow-md hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">📰 最新ニュース</h2>
          <p className="text-gray-600">
            大谷翔平に関する最新の記事をまとめています。
          </p>
        </Link>

        <Link
          href="/articles/all"
          className="block border rounded-lg p-6 shadow hover:shadow-md hover:bg-gray-50 transition"
        >
          <h2 className="text-xl font-semibold mb-2">📚 全記事一覧</h2>
          <p className="text-gray-600">記事を網羅的にチェック。</p>
        </Link>
      </div>
    </main>
  );
}

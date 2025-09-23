import Link from "next/link";
import "./globals.css";
import SourceDropdown from "@/components/SourceDropdown";
import Script from "next/script";

export const metadata = {
  title: "Shohei Ohtani News | 大谷翔平まとめサイト",
  description: "大谷翔平に関するニュース・成績・移籍情報をまとめたポータルサイト。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="flex flex-col min-h-screen">
        {/* ====== 構造化データ (JSON-LD) ====== */}
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Shohei Ohtani News",
              url: "https://your-domain.com/",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://your-domain.com/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
              publisher: {
                "@type": "Organization",
                name: "Shohei Ohtani News",
                url: "https://your-domain.com/",
                logo: {
                  "@type": "ImageObject",
                  url: "https://your-domain.com/logo.png", // ロゴ画像を用意すると効果UP
                },
              },
            }),
          }}
        />

        {/* ====== Header ====== */}
        <header className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                Shohei Ohtani News
              </Link>

              <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
                <Link href="/articles/otani" className="hover:text-blue-600 transition">
                  大谷記事
                </Link>
                <Link href="/articles/all" className="hover:text-blue-600 transition">
                  全記事
                </Link>
                <SourceDropdown />
              </nav>
            </div>
          </div>
        </header>

        {/* ====== Main Content ====== */}
        <main className="flex-1">{children}</main>

        {/* ====== Footer ====== */}
        <footer className="bg-gray-900 text-gray-300 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Shohei Ohtani News
              </h3>
              <p className="text-sm">
                様々なニュース・成績・移籍情報をまとめたポータルサイト。
              </p>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">
                サイト情報
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white transition">
                    運営者情報
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/disclaimer" className="hover:text-white transition">
                    免責事項
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-3">その他</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/rss.xml" className="hover:text-white transition">
                    RSSフィード
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* ====== Google AdSense Placeholder ====== */}
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="bg-gray-800 text-center py-6 rounded-md">
              <p className="text-sm text-gray-400">
                ここに広告が表示されます（Google AdSense 用）
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 text-center py-4 text-sm text-gray-500">
            © {new Date().getFullYear()} Shohei Ohtani News. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

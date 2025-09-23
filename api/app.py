from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

DB_DSN = "dbname=otani user=otani password=secret host=localhost"

app = FastAPI(title="Otani MVP API")
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://192.168.11.8:3000"],  # Next.js開発サーバーのURL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =====================
# 出典付きのレスポンス定義
# =====================
class ArticleOut(BaseModel):
    id: int
    title: str | None
    url: str
    excerpt: str | None
    published_at: datetime | None
    source_name: str | None   # ← 出典名を追加
    thumbnail: str | None = None
    source_icon: str | None = None  # ← 出典のアイコンURLを追加

def get_conn():
    return psycopg2.connect(DB_DSN, cursor_factory=RealDictCursor)


# =====================
# 記事一覧
# =====================
@app.get('/api/articles', response_model=list[ArticleOut])
def list_articles(limit: int = 20, offset: int = 0):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
    SELECT a.id, a.title, a.url, a.excerpt, a.published_at,
           s.name AS source_name, s.icon_url AS source_icon, a.thumbnail
    FROM articles a
    LEFT JOIN sources s ON a.source_id = s.id
    ORDER BY a.published_at DESC NULLS LAST
    LIMIT %s OFFSET %s
        """,
        (limit, offset)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


# =====================
# 大谷翔平関連記事
# =====================
@app.get('/api/articles/otani', response_model=list[ArticleOut])
def list_otani_articles(limit: int = 20, offset: int = 0):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT a.id, a.title, a.url, a.excerpt, a.published_at,
          s.name AS source_name, s.icon_url AS source_icon, a.thumbnail
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        WHERE a.is_otani = true
        ORDER BY a.published_at DESC NULLS LAST
        LIMIT %s OFFSET %s
        """,
        (limit, offset)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


# =====================
# 記事詳細
# =====================
@app.get('/api/articles/{article_id}', response_model=ArticleOut)
def get_article(article_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT a.id, a.title, a.url, a.excerpt, a.published_at,
          s.name AS source_name, s.icon_url AS source_icon, a.thumbnail
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        WHERE a.id=%s
        """,
        (article_id,)
    )
    r = cur.fetchone()
    cur.close()
    conn.close()
    if not r:
        raise HTTPException(status_code=404, detail='Not found')
    return r

from fastapi.responses import Response
from datetime import datetime

# =====================
# サイトマップ
# =====================
@app.get("/sitemap.xml", response_class=Response)
def sitemap():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT url, published_at FROM articles ORDER BY published_at DESC LIMIT 1000"
    )
    articles = cur.fetchall()
    cur.close()
    conn.close()

    sitemap_xml = """<?xml version="1.0" encoding="UTF-8"?>\n"""
    sitemap_xml += """<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n"""

    # 固定ページ (トップ)
    sitemap_xml += f"""
    <url>
      <loc>https://your-domain.com/</loc>
      <lastmod>{datetime.utcnow().date()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
    </url>
    """

    # 記事ページ
    for a in articles:
        lastmod = a["published_at"].date() if a["published_at"] else datetime.utcnow().date()
        sitemap_xml += f"""
        <url>
          <loc>{a['url']}</loc>
          <lastmod>{lastmod}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
        """

    sitemap_xml += "</urlset>"""

    return Response(content=sitemap_xml, media_type="application/xml")


# =====================
# RSS
# =====================
@app.get("/rss.xml", response_class=Response)
def rss():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT title, url, excerpt, published_at, s.name AS source_name "
        "FROM articles a LEFT JOIN sources s ON a.source_id = s.id "
        "ORDER BY published_at DESC LIMIT 50"
    )
    articles = cur.fetchall()
    cur.close()
    conn.close()

    rss_xml = """<?xml version="1.0" encoding="UTF-8"?>\n"""
    rss_xml += """<rss version="2.0"><channel>\n"""
    rss_xml += """
      <title>大谷翔平ニュースまとめ</title>
      <link>https://your-domain.com/</link>
      <description>大谷翔平に関する最新ニュースをまとめています</description>
      <language>ja</language>
    """

    for a in articles:
        pub_date = (
            a["published_at"].strftime("%a, %d %b %Y %H:%M:%S +0900")
            if a["published_at"]
            else ""
        )
        rss_xml += f"""
        <item>
          <title>{a['title'] or '(無題)'}</title>
          <link>{a['url']}</link>
          <description>{a['excerpt'] or ''}</description>
          <author>{a['source_name'] or ''}</author>
          <pubDate>{pub_date}</pubDate>
        </item>
        """

    rss_xml += "</channel></rss>"""

    return Response(content=rss_xml, media_type="application/xml")

class SourceOut(BaseModel):
    id: int
    name: str
    icon_url: str | None = None

@app.get("/api/sources", response_model=list[SourceOut])
def list_sources():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, name, icon_url FROM sources ORDER BY name")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows


# 出典ごとの記事
@app.get("/api/articles/by-source/{source_id}", response_model=list[ArticleOut])
def list_articles_by_source(source_id: int, limit: int = 20, offset: int = 0):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT a.id, a.title, a.url, a.excerpt, a.published_at,
            s.name AS source_name, s.icon_url AS source_icon, a.thumbnail
        FROM articles a
        LEFT JOIN sources s ON a.source_id = s.id
        WHERE s.id = %s
        ORDER BY a.published_at DESC NULLS LAST
        LIMIT %s OFFSET %s
        """,
        (source_id, limit, offset)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

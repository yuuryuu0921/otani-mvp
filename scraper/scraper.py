# -*- coding: utf-8 -*-
"""
非同期 RSS スクレイパー（Postgresに保存）
使い方: PYTHONPATH=. python scraper.py
"""
import asyncio
import hashlib
from datetime import datetime

import aiohttp
import feedparser
import psycopg2
from bs4 import BeautifulSoup
from dateutil import parser as dateparser

# 設定（環境に合わせて変更）
DB_DSN = "dbname=otani user=otani password=secret host=localhost"

HEADERS = {"User-Agent": "OtaniMVPBot/1.0 (+https://example.com)"}

# ========== DB関連 ==========
def load_sources_from_db(conn):
    """sources テーブルからRSSを持つサイト一覧を取得"""
    cur = conn.cursor()
    cur.execute("SELECT id, name, rss_url, base_url FROM sources WHERE rss_url IS NOT NULL")
    rows = cur.fetchall()
    cur.close()
    return rows


def article_exists(conn, url):
    """既に記事が保存されているか確認"""
    cur = conn.cursor()
    cur.execute("SELECT id FROM articles WHERE url=%s", (url,))
    r = cur.fetchone()
    cur.close()
    return bool(r)

from urllib.parse import urlparse

def get_favicon_url(base_url: str) -> str | None:
    if not base_url:
        return None
    domain = urlparse(base_url).netloc
    if not domain:
        return None
    return f"https://www.google.com/s2/favicons?domain={domain}"

def save_source_if_missing(conn, source):
    """sourcesに存在しなければ追加、icon_urlも設定"""
    cur = conn.cursor()
    cur.execute("SELECT id, icon_url FROM sources WHERE name=%s", (source["name"],))
    r = cur.fetchone()
    if r:
        # もしアイコン未登録なら更新
        if not r[1] and source.get("base_url"):
            icon_url = get_favicon_url(source["base_url"])
            if icon_url:
                cur.execute("UPDATE sources SET icon_url=%s WHERE id=%s", (icon_url, r[0]))
                conn.commit()
        return r[0]

    # 新規登録
    icon_url = get_favicon_url(source.get("base_url"))
    cur.execute(
        "INSERT INTO sources (name, base_url, rss_url, icon_url) VALUES (%s,%s,%s,%s) RETURNING id",
        (source["name"], source.get("base_url"), source.get("rss_url"), icon_url),
    )
    sid = cur.fetchone()[0]
    conn.commit()
    cur.close()
    return sid

# ========== ロジック ==========
OTANI_KEYWORDS = ["大谷", "翔平", "Shohei", "Ohtani", "オオタニサン", "Showtime"]


async def fetch(session, url):
    """HTTP GET"""
    async with session.get(url, headers=HEADERS, timeout=20) as resp:
        resp.raise_for_status()
        return await resp.text()


async def fetch_content(session, url):
    """本文を取得（保存はしない）"""
    try:
        html = await fetch(session, url)
        soup = BeautifulSoup(html, "html.parser")
        # ざっくり本文を取得
        texts = soup.find_all(["p", "article"])
        content = " ".join(t.get_text(" ", strip=True) for t in texts)
        return content[:5000]  # 長すぎる場合はカット
    except Exception:
        return ""


def is_otani_article(title, excerpt, content):
    """本文も含めて大谷翔平の記事かを判定"""
    text_for_check = (title or "") + " " + (excerpt or "") + " " + (content or "")
    return any(kw.lower() in text_for_check.lower() for kw in OTANI_KEYWORDS)


async def process_feed(session, conn, source):
    """RSSを処理"""
    rss_url = source.get("rss_url")
    if not rss_url:
        return
    try:
        print(f"Fetching RSS: {rss_url}")
        text = await fetch(session, rss_url)
        feed = feedparser.parse(text)
        sid = save_source_if_missing(conn, source)

        for entry in feed.entries:
            url = entry.get("link")
            if not url:
                continue
            if article_exists(conn, url):
                continue

            title = entry.get("title")
            published = None
            if entry.get("published"):
                try:
                    published = dateparser.parse(entry.get("published"))
                except Exception:
                    published = None

            excerpt = entry.get("summary") or ""
            excerpt = BeautifulSoup(excerpt, "html.parser").get_text()[:1000]

            # 本文を取得
            content = await fetch_content(session, url)

            # サムネイル取得（←必ずここに入れる）
            thumbnail = None
            if "media_thumbnail" in entry:
                thumbnail = entry.media_thumbnail[0].get("url")
            elif "media_content" in entry:
                thumbnail = entry.media_content[0].get("url")
            elif "links" in entry:
                for link in entry.links:
                    if link.get("rel") == "enclosure" and "image" in link.get("type", ""):
                        thumbnail = link.get("href")

            # 判定は本文も含めて
            is_otani = is_otani_article(title, excerpt, content)

            # DB保存
            cur = conn.cursor()
            fetched_hash = hashlib.sha256(url.encode("utf-8")).hexdigest()
            cur.execute(
                """
                INSERT INTO articles (source_id, url, title, published_at, excerpt, fetched_hash, is_otani, thumbnail)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
                ON CONFLICT (url) DO UPDATE
                SET title = EXCLUDED.title,
                    excerpt = EXCLUDED.excerpt,
                    published_at = EXCLUDED.published_at,
                    is_otani = EXCLUDED.is_otani,
                    thumbnail = EXCLUDED.thumbnail
                """,
                (sid, url, title, published, excerpt, fetched_hash, is_otani, thumbnail),
            )
            conn.commit()
            cur.close()

            print(f"Saved: {title} (Ohtani={is_otani}) thumb={thumbnail}")

    except Exception as e:
        print("Feed error", rss_url, e)


# ========== メイン ==========
async def main():
    conn = psycopg2.connect(DB_DSN)
    sources = load_sources_from_db(conn)

    async with aiohttp.ClientSession() as session:
        tasks = [
            process_feed(
                session,
                conn,
                {"id": s[0], "name": s[1], "rss_url": s[2], "base_url": s[3]},
            )
            for s in sources
        ]
        await asyncio.gather(*tasks)

    conn.close()

if __name__ == "__main__":
    asyncio.run(main())

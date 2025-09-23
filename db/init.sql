CREATE TABLE IF NOT EXISTS sources (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT,
  rss_url TEXT,
  last_crawled TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  source_id INT REFERENCES sources(id),
  url TEXT UNIQUE NOT NULL,
  title TEXT,
  author TEXT,
  published_at TIMESTAMP,
  fetched_at TIMESTAMP DEFAULT now(),
  excerpt TEXT,
  fetched_hash TEXT,
  language TEXT
);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles (published_at);

ALTER TABLE articles ADD COLUMN is_otani boolean DEFAULT false;
ALTER TABLE articles ADD COLUMN thumbnail TEXT;
ALTER TABLE public.sources OWNER TO otani;
ALTER TABLE public.articles OWNER TO otani;

ALTER SEQUENCE public.sources_id_seq OWNER TO otani;
ALTER SEQUENCE public.articles_id_seq OWNER TO otani;

# Otani MVP Project

This project is a minimal viable product (MVP) for aggregating articles related to Shohei Ohtani. It consists of a Python scraper that fetches articles from various RSS feeds, a FastAPI server that provides an API for accessing the articles, and a Next.js frontend that displays the articles.

## Project Structure

```
otani-mvp/
├── docker-compose.yml       # Configuration for PostgreSQL container
├── db/
│   └── init.sql            # SQL schema for the PostgreSQL database
├── scraper/
│   ├── requirements.txt     # Dependencies for the Python scraper
│   └── scraper.py           # Asynchronous RSS scraper implementation
├── api/
│   ├── requirements.txt     # Dependencies for the FastAPI server
│   └── app.py               # FastAPI server setup and API endpoints
├── web/
│   └── pages/
│       └── index.js         # Next.js main page displaying articles
└── README.md                # Project documentation
```

## Setup Instructions

1. **Database Setup**:
   - Ensure PostgreSQL is installed or use Docker to run a PostgreSQL container.
   - If using Docker, run the following command to start the database:
     ```
     docker-compose up
     ```
   - The database schema will be automatically initialized using `db/init.sql`.

2. **Scraper Setup**:
   - Navigate to the `scraper` directory:
     ```
     cd scraper
     ```
   - Create a virtual environment and install dependencies:
     ```
     python -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     ```
   - Run the scraper to fetch initial data:
     ```
     python scraper.py
     ```

3. **API Setup**:
   - Navigate to the `api` directory:
     ```
     cd api
     ```
   - Create a virtual environment and install dependencies:
     ```
     python -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     ```
   - Start the FastAPI server:
     ```
     uvicorn app:app --reload --port 8000
     ```

4. **Frontend Setup**:
   - Navigate to the `web` directory and initialize a Next.js project:
     ```
     cd web
     npx create-next-app@latest . --typescript=false --eslint=false
     ```
   - Replace the contents of `pages/index.js` with the provided implementation.
   - Start the Next.js development server:
     ```
     npm run dev
     ```
   - Access the application at `http://localhost:3000`.

## Operational Notes

- Ensure to check the usage policies of the sources being scraped to comply with their terms.
- Consider implementing rate limiting and error handling in the scraper for production use.
- Future improvements may include adding search functionality, enhancing the frontend design, and implementing automated testing.
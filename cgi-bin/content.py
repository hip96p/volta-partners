#!/usr/bin/env python3
"""
Volta Partners CMS API — Serves content from Notion-synced JSON.
Caches results for 60 seconds. POST /refresh to push new content.
"""
import json
import os
import sys
import time
import sqlite3
from pathlib import Path

NOTION_DB_ID = "8be9905d-b7ea-496b-8643-fcb07fd0fa0f"
CACHE_TTL = 60
CACHE_DB = Path("cms_cache.db")

def init_cache():
    db = sqlite3.connect(str(CACHE_DB))
    db.execute("CREATE TABLE IF NOT EXISTS cache (key TEXT PRIMARY KEY, data TEXT, updated_at REAL)")
    db.commit()
    return db

def get_cached(db, key):
    row = db.execute("SELECT data, updated_at FROM cache WHERE key = ?", [key]).fetchone()
    if row and (time.time() - row[1]) < CACHE_TTL:
        return json.loads(row[0])
    return None

def set_cache(db, key, data):
    db.execute("INSERT OR REPLACE INTO cache (key, data, updated_at) VALUES (?, ?, ?)", [key, json.dumps(data), time.time()])
    db.commit()

def fetch_from_file():
    static_file = Path("cms_content.json")
    if static_file.exists():
        with open(static_file) as f:
            return json.loads(f.read())
    return None

def respond(data, status=200):
    print(f"Status: {status}")
    print("Content-Type: application/json")
    print("Cache-Control: public, max-age=60")
    print("Access-Control-Allow-Origin: *")
    print()
    print(json.dumps(data))

def main():
    method = os.environ.get("REQUEST_METHOD", "GET")
    path = os.environ.get("PATH_INFO", "")
    query = os.environ.get("QUERY_STRING", "")

    if method == "OPTIONS":
        print("Status: 204")
        print("Access-Control-Allow-Origin: *")
        print("Access-Control-Allow-Methods: GET, POST, OPTIONS")
        print("Access-Control-Allow-Headers: Content-Type")
        print()
        return

    if method == "GET":
        db = init_cache()
        cached = get_cached(db, "all_content")
        if cached:
            respond(cached)
            return
        content = fetch_from_file()
        if content:
            set_cache(db, "all_content", content)
            respond(content)
            return
        respond({"error": "Content not yet loaded"}, 503)
        return

    if method == "POST" and (path == "/refresh" or "refresh" in query):
        try:
            length = int(os.environ.get("CONTENT_LENGTH", 0))
            body = sys.stdin.read(length) if length > 0 else "{}"
            data = json.loads(body) if body else {}
            if data.get("content"):
                Path("cms_content.json").write_text(json.dumps(data["content"]))
                db = init_cache()
                db.execute("DELETE FROM cache WHERE key = 'all_content'")
                db.commit()
                respond({"status": "refreshed", "blocks": len(data["content"])})
                return
            respond({"error": "POST body must include 'content' key"}, 400)
        except Exception as e:
            respond({"error": str(e)}, 500)
        return

    respond({"error": "Not found"}, 404)

if __name__ == "__main__":
    main()
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Source = { id: number; name: string };

export default function SourceDropdown() {
  const [sources, setSources] = useState<Source[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/sources")
      .then((res) => res.json())
      .then((data) => setSources(data))
      .catch((err) => console.error("Failed to load sources:", err));
  }, []);

  return (
    <div className="relative">
      {/* トリガー */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="text-blue-600 hover:underline"
      >
        出典で探す ▼
      </button>

      {/* ドロップダウンメニュー */}
      {open && (
        <div
          className="
            absolute left-0 mt-2 w-48 rounded-md bg-white shadow-lg border
            z-50
          "
        >
          <ul className="py-1">
            {sources.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/articles/source/${s.id}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setOpen(false)} // 選択後に閉じる
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

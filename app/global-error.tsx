"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const detail =
    process.env.NODE_ENV === "development"
      ? error.message
      : "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";

  return (
    <html lang="ko">
      <body>
        <section
          className="mx-auto max-w-7xl space-y-4 px-4 py-16"
          aria-labelledby="global-error-title"
        >
          <h1 id="global-error-title" className="text-2xl font-bold text-white">
            오류
          </h1>
          <p className="text-sm text-slate-400" role="alert">
            {detail}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded bg-slate-700 px-4 py-2 text-sm text-white hover:bg-slate-600"
          >
            다시 시도
          </button>
        </section>
      </body>
    </html>
  );
}

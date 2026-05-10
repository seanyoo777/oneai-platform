import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "페이지 없음",
  description: "요청한 주소가 바뀌었거나 존재하지 않는 경로입니다.",
  robots: { index: false, follow: false }
};

export default function NotFound() {
  return (
    <section className="mx-auto max-w-7xl space-y-4 px-4 py-16" aria-labelledby="not-found-title">
      <h1 id="not-found-title" className="text-2xl font-bold text-white">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-slate-400" role="status">
        주소가 바뀌었거나 존재하지 않는 경로입니다.
      </p>
      <Link href="/" className="inline-block text-blue-400 underline-offset-2 hover:underline">
        홈으로
      </Link>
    </section>
  );
}

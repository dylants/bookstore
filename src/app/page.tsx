"use client";

import BookQuery from "@/app/BookQuery";

export default function Home() {
  return (
    <main className="min-h-screen p-2">
      <h1 className="text-lg m-2">bookstore</h1>
      <div className="flex min-h-screen justify-center items-center">
        <BookQuery />
      </div>
    </main>
  );
}

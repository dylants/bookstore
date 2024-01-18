"use client";

import BookQuery from "@/components/BookQuery";

export default function AddBookPage() {
  return (
    <div className="flex">
      <h1 className="text-2xl">Add a new book</h1>
      <BookQuery />
    </div>
  );
}

import ListPageLoading from "@/app/list/loading";
import ListPage from "@/app/list/page";
import { Suspense } from "react";

export default async function ListPageLayout() {
  return (
    <>
      <h1 className="text-2xl text-customPalette-500 my-4">Books</h1>
      <hr className="mt-4 mb-8 border-customPalette-300" />

      <Suspense fallback={<ListPageLoading />}>
        <ListPage />
      </Suspense>
    </>
  );
}

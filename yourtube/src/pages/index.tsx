"use client";

import { Suspense, useState } from "react";
import CategoryTabs from "@/components/category-tabs";
import Videogrid from "@/components/Videogrid";
import { VIDEO_CATEGORIES } from "@/lib/video";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState(
    VIDEO_CATEGORIES[0]
  );

  return (
    <main className="min-w-0 flex-1 px-3 py-4 sm:px-5 lg:px-6">
      <div className="mx-auto max-w-[1800px]">
        <CategoryTabs
          activeCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        <Suspense fallback={<div>Loading videos...</div>}>
          <Videogrid selectedCategory={selectedCategory} />
        </Suspense>
      </div>
    </main>
  );
}

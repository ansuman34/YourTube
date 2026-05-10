"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { VIDEO_CATEGORIES } from "@/lib/video";

type CategoryTabsProps = {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
};

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const categories = useMemo(() => VIDEO_CATEGORIES, []);

  return (
    <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "secondary"}
          className="h-8 whitespace-nowrap rounded-full px-4"
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}

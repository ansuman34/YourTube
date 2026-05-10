"use client";

import React, { useEffect, useState } from "react";
import Videocard from "./videocard";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { type VideoRecord } from "@/lib/video";

type VideogridProps = {
  selectedCategory?: string;
};

const Videogrid = ({ selectedCategory = "All" }: VideogridProps) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useUser();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get("/video/getall");
        setVideos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
        setError("Could not load videos. Please check the backend connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3 p-2">
            <div className="aspect-video animate-pulse rounded-lg bg-zinc-100" />
            <div className="flex gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-4/5 rounded bg-zinc-100" />
                <div className="h-3 w-2/3 rounded bg-zinc-100" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  const filteredVideos = selectedCategory
    ? videos.filter((video) =>
        selectedCategory === "All"
          ? true
          : (video.category || "Uncategorized") === selectedCategory
      )
    : videos;

  if (filteredVideos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
        <h2 className="text-lg font-semibold">No videos found</h2>
        <p className="mt-2 text-sm text-zinc-600">
          There are no videos matching the selected category right now.
        </p>
      </div>
    );
  }

  const visibleVideos = user ? filteredVideos : filteredVideos.slice(0, 8);

  return (
    <div className="space-y-4">
      {!user && (
        <div className="rounded-lg border bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          You can browse a preview of videos. Sign in when you pick one to
          watch.
        </div>
      )}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {visibleVideos.map((video) => (
          <Videocard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Videogrid;

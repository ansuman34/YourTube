import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import axiosInstance from "@/lib/axiosinstance";
import {
  formatViews,
  getChannelInitial,
  getVideoUrl,
  type VideoRecord,
} from "@/lib/video";

const SearchResult = ({ query }: { query: string | string[] }) => {
  const normalizedQuery = Array.isArray(query) ? query[0] || "" : query || "";
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      if (!normalizedQuery.trim()) {
        setVideos([]);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get("/video/getall");
        setVideos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error(error);
        setError("Could not load search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [normalizedQuery]);

  const results = useMemo(() => {
    const value = normalizedQuery.trim().toLowerCase();
    if (!value) return [];

    return videos.filter(
      (video) =>
        video.videotitle?.toLowerCase().includes(value) ||
        video.videochanel?.toLowerCase().includes(value)
    );
  }, [normalizedQuery, videos]);

  if (!normalizedQuery.trim()) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
        <p className="text-zinc-600">
          Enter a search term to find videos and channels.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-8 text-sm text-zinc-600">Loading results...</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center">
        <h2 className="text-xl font-semibold">No results found</h2>
        <p className="mt-2 text-zinc-600">
          Try different keywords or remove search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {results.map((video) => (
        <div key={video._id} className="group flex flex-col gap-4 sm:flex-row">
          <Link href={`/watch/${video._id}`} className="w-full sm:w-80">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100">
              <video
                src={getVideoUrl(video.filepath)}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                muted
                preload="metadata"
                playsInline
              />
            </div>
          </Link>

          <div className="min-w-0 flex-1 py-1">
            <Link href={`/watch/${video._id}`}>
              <h3 className="line-clamp-2 text-lg font-medium group-hover:text-red-600">
                {video.videotitle || "Untitled video"}
              </h3>
            </Link>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>
                {video.createdAt
                  ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                  : "recently"}
              </span>
            </div>

            <Link
              href={`/channel/${video.uploader}`}
              className="mt-3 flex items-center gap-2 hover:text-red-600"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-xs">
                  {getChannelInitial(video.videochanel)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-zinc-600">
                {video.videochanel || "YourTube channel"}
              </span>
            </Link>

            <p className="mt-3 line-clamp-2 text-sm text-zinc-700">
              Watch this video on YourTube after signing in.
            </p>
          </div>
        </div>
      ))}

      <div className="py-4 text-center text-sm text-zinc-600">
        Showing {results.length} result{results.length === 1 ? "" : "s"} for "
        {normalizedQuery}"
      </div>
    </div>
  );
};

export default SearchResult;

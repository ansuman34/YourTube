"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, ThumbsUp, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { formatViews, getVideoUrl } from "@/lib/video";

export default function LikedVideosContent() {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading } = useUser();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      loadLikedVideos();
    } else {
      setLikedVideos([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadLikedVideos = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const likedData = await axiosInstance.get(`/like/${user._id}`);
      setLikedVideos(likedData.data);
    } catch (error) {
      console.error("Error loading liked videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlikeVideo = async (videoId: string, likedVideoId: string) => {
    if (!user) return;

    try {
      await axiosInstance.post(`/like/${videoId}`, { userId: user._id });
      setLikedVideos(likedVideos.filter((item) => item._id !== likedVideoId));
    } catch (error) {
      console.error("Error unliking video:", error);
    }
  };

  if (loading || authLoading) {
    return <div>Loading liked videos...</div>;
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <ThumbsUp className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
        <h2 className="mb-2 text-xl font-semibold">
          Keep track of videos you like
        </h2>
        <p className="text-zinc-600">Sign in to see your liked videos.</p>
      </div>
    );
  }

  if (likedVideos.length === 0) {
    return (
      <div className="py-12 text-center">
        <ThumbsUp className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
        <h2 className="mb-2 text-xl font-semibold">No liked videos yet</h2>
        <p className="text-zinc-600">Videos you like will appear here.</p>
      </div>
    );
  }

  const firstVideo = likedVideos.find((item) => item.videoid?._id)?.videoid;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-600">{likedVideos.length} videos</p>
        {firstVideo && (
          <Button asChild className="flex items-center gap-2 rounded-full">
            <Link href={`/watch/${firstVideo._id}`}>
              <Play className="h-4 w-4" />
              Play all
            </Link>
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {likedVideos.map((item) => {
          const video = item.videoid;
          if (!video?._id) return null;

          return (
            <div key={item._id} className="group flex gap-4">
              <Link href={`/watch/${video._id}`} className="flex-shrink-0">
                <div className="relative aspect-video w-40 overflow-hidden rounded bg-zinc-100">
                  <video
                    src={getVideoUrl(video.filepath)}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    muted
                    preload="metadata"
                    playsInline
                  />
                </div>
              </Link>

              <div className="min-w-0 flex-1">
                <Link href={`/watch/${video._id}`}>
                  <h3 className="mb-1 line-clamp-2 text-sm font-medium group-hover:text-red-600">
                    {video.videotitle || "Untitled video"}
                  </h3>
                </Link>
                <p className="text-sm text-zinc-600">{video.videochanel}</p>
                <p className="text-sm text-zinc-600">
                  {formatViews(video.views)} •{" "}
                  {video.createdAt
                    ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                    : "recently"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Liked {formatDistanceToNow(new Date(item.createdAt))} ago
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleUnlikeVideo(video._id, item._id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove from liked videos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        })}
      </div>
    </div>
  );
}

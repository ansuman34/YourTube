"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreVertical, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/AuthContext";
import { formatViews, getVideoUrl } from "@/lib/video";

export default function HistoryContent() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, authLoading } = useUser();

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      loadHistory();
    } else {
      setHistory([]);
      setLoading(false);
    }
  }, [user, authLoading]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const historyData = await axiosInstance.get(`/history/${user._id}`);
      setHistory(historyData.data);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromHistory = async (historyId: string) => {
    try {
      await axiosInstance.delete(`/history/${historyId}`);
      setHistory(history.filter((item) => item._id !== historyId));
    } catch (error) {
      console.error("Error removing from history:", error);
    }
  };

  if (loading || authLoading) {
    return <div>Loading history...</div>;
  }

  if (!user) {
    return (
      <div className="py-12 text-center">
        <Clock className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
        <h2 className="mb-2 text-xl font-semibold">
          Keep track of what you watch
        </h2>
        <p className="text-zinc-600">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
        <h2 className="mb-2 text-xl font-semibold">No watch history yet</h2>
        <p className="text-zinc-600">Videos you watch will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-600">{history.length} videos</p>

      <div className="space-y-4">
        {history.map((item) => {
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
                  Added {formatDistanceToNow(new Date(item.createdAt))} ago
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
                    onClick={() => handleRemoveFromHistory(item._id)}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove from watch history
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

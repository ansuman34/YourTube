"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { useUser } from "@/lib/AuthContext";
import {
  formatViews,
  getChannelInitial,
  getVideoUrl,
  type VideoRecord,
} from "@/lib/video";

export default function VideoCard({ video }: { video: VideoRecord }) {
  const router = useRouter();
  const { user, authLoading, handlegooglesignin } = useUser();

  if (!video?._id) return null;

  const watchUrl = `/watch/${video._id}`;
  const handleWatchClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (user || authLoading) return;

    event.preventDefault();
    toast.message("Sign in to watch this video.");
    const signedInUser = await handlegooglesignin();
    if (signedInUser) {
      router.push(watchUrl);
    }
  };

  return (
    <Link href={watchUrl} className="group block" onClick={handleWatchClick}>
      <div className="space-y-3 rounded-lg p-2 transition-colors hover:bg-zinc-50">
        <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100">
          <video
            src={getVideoUrl(video.filepath)}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            muted
            preload="metadata"
            playsInline
          />
          {!user && (
            <div className="absolute bottom-2 right-2 rounded bg-black/80 px-2 py-1 text-xs text-white">
              Sign in
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback>{getChannelInitial(video.videochanel)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-5 group-hover:text-red-600">
              {video.videotitle || "Untitled video"}
            </h3>
            <p className="mt-1 text-sm text-zinc-600">
              {video.videochanel || "YourTube channel"}
            </p>
            <p className="text-sm text-zinc-600">
              {formatViews(video.views)} •{" "}
              {video.createdAt
                ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                : "recently"}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}

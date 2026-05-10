import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  formatViews,
  getVideoUrl,
  type VideoRecord,
} from "@/lib/video";

interface RelatedVideosProps {
  videos: VideoRecord[];
}

export default function RelatedVideos({ videos = [] }: RelatedVideosProps) {
  if (videos.length === 0) {
    return (
      <aside className="rounded-lg border border-dashed border-zinc-300 p-5 text-sm text-zinc-600">
        No related videos yet.
      </aside>
    );
  }

  return (
    <aside className="space-y-3">
      {videos.slice(0, 12).map((video) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-50"
        >
          <div className="relative aspect-video w-40 flex-shrink-0 overflow-hidden rounded bg-zinc-100">
            <video
              src={getVideoUrl(video.filepath)}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              muted
              preload="metadata"
              playsInline
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-5 group-hover:text-red-600">
              {video.videotitle || "Untitled video"}
            </h3>
            <p className="mt-1 text-xs text-zinc-600">{video.videochanel}</p>
            <p className="text-xs text-zinc-600">
              {formatViews(video.views)} •{" "}
              {video.createdAt
                ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
                : "recently"}
            </p>
          </div>
        </Link>
      ))}
    </aside>
  );
}

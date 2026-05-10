"use client";

import { useRef } from "react";
import { getVideoUrl, type VideoRecord } from "@/lib/video";

interface VideoPlayerProps {
  video: VideoRecord;
}

export default function VideoPlayer({ video }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoSource = getVideoUrl(video?.filepath);

  return (
    <div className="aspect-video overflow-hidden rounded-lg bg-black">
      <video
        ref={videoRef}
        className="h-full w-full"
        controls
        preload="metadata"
        playsInline
      >
        {videoSource && (
          <source
            src={videoSource}
            type="video/mp4"
          />
        )}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

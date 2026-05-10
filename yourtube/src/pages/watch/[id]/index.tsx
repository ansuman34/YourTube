import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videopplayer from "@/components/Videopplayer";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { type VideoRecord } from "@/lib/video";
import { Lock, User } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const WatchPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user, authLoading, handlegooglesignin } = useUser();
  const [video, setVideo] = useState<VideoRecord | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideo = async () => {
      if (!id || typeof id !== "string" || authLoading || !user) return;

      setLoading(true);
      setError("");
      try {
        const [videoRes, allVideosRes] = await Promise.all([
          axiosInstance.get(`/video/${id}`),
          axiosInstance.get("/video/getall"),
        ]);
        setVideo(videoRes.data);
        setRelatedVideos(
          Array.isArray(allVideosRes.data)
            ? allVideosRes.data.filter((item: VideoRecord) => item._id !== id)
            : []
        );
      } catch (error: any) {
        console.error(error);
        setError(error.response?.data?.message || "Video not found");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, user, authLoading]);

  if (authLoading) {
    return <main className="flex-1 p-6">Loading...</main>;
  }

  if (!user) {
    return (
      <main className="flex min-h-[calc(100vh-57px)] flex-1 items-center justify-center p-6">
        <div className="max-w-md rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold">Sign in to watch</h1>
          <p className="mt-2 text-sm text-zinc-600">
            You can browse videos on the home page, but playback is available
            after signing in.
          </p>
          <Button
            className="mt-6 rounded-full"
            onClick={() => handlegooglesignin()}
          >
            <User className="h-4 w-4" />
            Sign in with Google
          </Button>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="flex-1 p-6">Loading video...</main>;
  }

  if (error || !video) {
    return (
      <main className="flex-1 p-6">
        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
          {error || "Video not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 flex-1 bg-white">
      <div className="mx-auto max-w-7xl p-3 sm:p-4">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-4">
            <Videopplayer video={video} />
            <VideoInfo video={video} />
            <Comments videoId={id} />
          </div>
          <RelatedVideos videos={relatedVideos} />
        </div>
      </div>
    </main>
  );
};

export default WatchPage;

import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { type VideoRecord } from "@/lib/video";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const ChannelPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser();
  const [channel, setChannel] = useState<any>(null);
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const channelId = typeof id === "string" ? id : "";
  const isOwner = Boolean(user?._id && channelId && user._id === channelId);

  const fetchChannel = async () => {
    if (!channelId) return;

    try {
      setLoading(true);
      setError("");
      const [channelRes, videosRes] = await Promise.all([
        axiosInstance.get(`/user/${channelId}`),
        axiosInstance.get("/video/getall"),
      ]);
      setChannel(channelRes.data);
      setVideos(
        Array.isArray(videosRes.data)
          ? videosRes.data.filter(
              (video: VideoRecord) => video.uploader === channelId
            )
          : []
      );
    } catch (error: any) {
      console.error("Error fetching channel data:", error);
      setError(error.response?.data?.message || "Channel not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannel();
  }, [channelId]);

  if (loading) {
    return <main className="flex-1 p-6">Loading channel...</main>;
  }

  if (error || !channel) {
    return (
      <main className="flex-1 p-6">
        <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-red-700">
          {error || "Channel not found"}
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 flex-1 bg-white">
      <ChannelHeader channel={channel} user={user} />
      <Channeltabs />
      {isOwner && channel.channelname && (
        <div className="px-4 pb-8 pt-4">
          <VideoUploader
            channelId={channelId}
            channelName={channel.channelname}
            onUploadSuccess={fetchChannel}
          />
        </div>
      )}
      <div className="px-4 pb-8">
        <ChannelVideos videos={videos} />
      </div>
    </main>
  );
};

export default ChannelPage;

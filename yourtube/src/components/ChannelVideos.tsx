import VideoCard from "./videocard";
import { type VideoRecord } from "@/lib/video";

export default function ChannelVideos({ videos }: { videos: VideoRecord[] }) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No videos uploaded yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Videos</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

import React, { useEffect } from "react";
import { useUser } from "@/lib/AuthContext";
import VideoUploader from "@/components/VideoUploader";
import Videogrid from "@/components/Videogrid";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const Upload = () => {
  const { user } = useUser();

  useEffect(() => {
    if (typeof window !== "undefined" && !user) {
      window.location.href = "/";
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleUploadSuccess = () => {
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Upload Video</h1>
          <p className="text-gray-600 mt-2">
            Share your video with the YourTube community and preview existing uploads below.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <VideoUploader
            channelId={user._id}
            channelName={user.channelname || user.name}
            onUploadSuccess={handleUploadSuccess}
          />
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Uploaded Videos</h2>
              <p className="text-sm text-zinc-600">
                Browse all videos currently available in the upload section.
              </p>
            </div>
          </div>
          <Videogrid />
        </div>
      </div>
    </div>
  );
};

export default Upload;

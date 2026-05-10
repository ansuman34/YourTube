import React, { useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import Videocard from "@/components/videocard";
import { Download } from "lucide-react";

const Downloads = () => {
  const { user, authLoading } = useUser();
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloads = async () => {
      if (authLoading) return;

      if (!user) {
        setDownloads([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axiosInstance.get(`/download/${user._id}`);
        setDownloads(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDownloads();
  }, [user, authLoading]);

  if (loading || authLoading) {
    return <main className="flex-1 p-6">Loading downloads...</main>;
  }

  if (!user) {
    return (
      <main className="flex-1 p-6">
        <div className="py-12 text-center">
          <Download className="mx-auto mb-4 h-16 w-16 text-zinc-400" />
          <h1 className="mb-2 text-2xl font-bold">Downloads</h1>
          <p className="text-zinc-600">Please sign in to view downloads.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-w-0 flex-1 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-6 text-2xl font-bold">Your downloads</h1>
        {downloads.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-zinc-600">
            You haven't downloaded any videos yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {downloads.map((download) =>
              download.videoId ? (
                <Videocard key={download._id} video={download.videoId} />
              ) : null
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Downloads;

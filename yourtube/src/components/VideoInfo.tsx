import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";
import {
  formatViews,
  getChannelInitial,
  type VideoRecord,
} from "@/lib/video";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const isValidObjectId = (id?: string | null) =>
  Boolean(id && /^[0-9a-fA-F]{24}$/.test(id));

const VideoInfo = ({ video }: { video: VideoRecord }) => {
  const [likes, setLikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [uploaderId, setUploaderId] = useState<string | null>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(false);
  const { user, handlegooglesignin } = useUser();
  const viewTrackedRef = useRef("");

  useEffect(() => {
    setLikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
    setIsWatchLater(false);
  }, [video._id, video.Like, video.Dislike]);

  useEffect(() => {
    const trackView = async () => {
      if (!video?._id || !user?._id) return;

      const viewKey = `${user._id}:${video._id}`;
      if (viewTrackedRef.current === viewKey) return;
      viewTrackedRef.current = viewKey;

      try {
        await axiosInstance.post(`/history/${video._id}`, {
          userId: user._id,
        });
      } catch (error) {
        console.error(error);
      }
    };

    trackView();
  }, [user?._id, video?._id]);

  // Find uploader and check subscription status
  useEffect(() => {
    const findUploaderAndCheckSubscription = async () => {
      if (!user?._id) return;

      try {
        let uploaderUserId: string | null = null;
        const searchNames = [video.uploader?.trim(), video.videochanel?.trim()].filter(
          Boolean
        ) as string[];

        if (video.uploader && video.uploader.match(/^[0-9a-fA-F]{24}$/)) {
          uploaderUserId = video.uploader;
        }

        for (const searchName of searchNames) {
          if (uploaderUserId) break;
          try {
            const userRes = await axiosInstance.get("/user/search", {
              params: { name: searchName },
            });
            if (userRes.data && userRes.data._id) {
              uploaderUserId = userRes.data._id;
            }
          } catch (searchError: any) {
            if (searchError.response?.status !== 404) {
              console.error("Uploader lookup error:", searchError);
            }
          }
        }

        if (uploaderUserId) {
          setUploaderId(uploaderUserId);

          try {
            const subRes = await axiosInstance.get("/subscription/check", {
              params: {
                subscriberId: user._id,
                channelId: uploaderUserId,
              },
            });
            setIsSubscribed(subRes.data.isSubscribed);
          } catch (subError: any) {
            console.debug("Could not check subscription status:", subError.message);
          }
        } else {
          setUploaderId(null);
          setIsSubscribed(false);
        }
      } catch (error: any) {
        console.error("Error in uploader check:", error);
      }
    };

    setIsCheckingSubscription(true);
    findUploaderAndCheckSubscription().finally(() =>
      setIsCheckingSubscription(false)
    );
  }, [user?._id, video.uploader, video.videochanel]);

  const requireUser = async () => {
    if (user) return user;

    toast.message("Please sign in first.");
    const signedInUser = await handlegooglesignin();
    return signedInUser;
  };

  const handleLike = async () => {
    const activeUser = await requireUser();
    if (!activeUser) return;

    try {
      const wasLiked = isLiked;
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: activeUser._id,
      });

      if (res.data.liked) {
        setIsLiked(true);
        if (!wasLiked) setLikes((prev) => prev + 1);
        if (isDisliked) {
          setDislikes((prev) => Math.max(0, prev - 1));
          setIsDisliked(false);
        }
      } else {
        setIsLiked(false);
        if (wasLiked) setLikes((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not update like.");
    }
  };

  const handleDislike = async () => {
    const activeUser = await requireUser();
    if (!activeUser) return;

    setIsDisliked((prev) => !prev);
    setDislikes((prev) => (isDisliked ? Math.max(0, prev - 1) : prev + 1));
    if (isLiked) {
      setIsLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
    }
  };

  const handleWatchLater = async () => {
    const activeUser = await requireUser();
    if (!activeUser) return;

    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: activeUser._id,
      });
      setIsWatchLater(Boolean(res.data.watchlater));
      toast.success(res.data.watchlater ? "Saved to Watch later" : "Removed");
    } catch (error) {
      console.error(error);
      toast.error("Could not update Watch later.");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link.");
    }
  };

  const handleDownload = async () => {
    const activeUser = await requireUser();
    if (!activeUser) return;

    try {
      const res = await axiosInstance.post(
        "/download",
        {
          userId: activeUser._id,
          videoId: video._id,
        },
        { responseType: "blob" }
      );
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = video.filename || `${video.videotitle || "video"}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Download failed.");
    }
  };

  const isOwnChannel = user?._id === uploaderId;

  const handleSubscribe = async () => {
    const activeUser = await requireUser();
    if (!activeUser) return;
    if (!isValidObjectId(uploaderId)) {
      toast.error("This channel cannot be subscribed to.");
      return;
    }
    if (activeUser._id === uploaderId) {
      toast.error("You cannot subscribe to your own channel.");
      return;
    }

    try {
      if (isSubscribed) {
        await axiosInstance.post("/subscription/unsubscribe", {
          subscriberId: activeUser._id,
          channelId: uploaderId,
        });
        setIsSubscribed(false);
        toast.success("Unsubscribed");
      } else {
        await axiosInstance.post("/subscription/subscribe", {
          subscriberId: activeUser._id,
          channelId: uploaderId,
        });
        setIsSubscribed(true);
        toast.success("Subscribed!");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription"
      );
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold leading-7 sm:text-2xl">
        {video.videotitle || "Untitled video"}
      </h1>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{getChannelInitial(video.videochanel)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="truncate font-medium">
              {video.videochanel || "YourTube channel"}
            </h3>
            <p className="text-sm text-zinc-600">Creator</p>
          </div>
          {!isOwnChannel && isValidObjectId(uploaderId) && (
            <Button
              onClick={handleSubscribe}
              disabled={isCheckingSubscription}
              variant="default"
              className={`ml-auto rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                isSubscribed
                  ? "bg-zinc-900 text-white hover:bg-zinc-800"
                  : "bg-red-600 text-white hover:bg-red-700"
              }`}
            >
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-full bg-zinc-100">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-l-full"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`mr-2 h-5 w-5 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="h-6 w-px bg-zinc-300" />
            <Button
              variant="ghost"
              size="sm"
              className="rounded-r-full"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`mr-2 h-5 w-5 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full bg-zinc-100 ${
              isWatchLater ? "text-red-600" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="mr-2 h-5 w-5" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-zinc-100"
            onClick={handleShare}
          >
            <Share className="mr-2 h-5 w-5" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full bg-zinc-100"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-5 w-5" />
            Download
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-zinc-100"
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.message("Report feature coming soon")}>
                Report
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.message("Not interested")}>
                Not interested
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.message("Don't recommend channel")}>
                Don't recommend channel
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.message("Save to playlist (coming soon)")}>
                Save to playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-lg bg-zinc-100 p-4">
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-sm font-medium">
          <span>{formatViews(video.views)}</span>
          <span>
            {video.createdAt
              ? `${formatDistanceToNow(new Date(video.createdAt))} ago`
              : "Recently"}
          </span>
          {video.category && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-700">
              {video.category}
            </span>
          )}
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>
            {video.description && video.description.trim()
              ? video.description
              : "No description has been added for this video yet."}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-auto p-0 font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show less" : "Show more"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;

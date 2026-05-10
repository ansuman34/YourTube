import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { getChannelInitial } from "@/lib/video";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "sonner";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user: currentUser } = useUser();
  const channelName = channel?.channelname || channel?.name || "Untitled channel";

  // Check subscription status and get subscriber count on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!currentUser?._id || !channel?._id) return;

      try {
        const [subRes, countRes] = await Promise.all([
          axiosInstance.get("/subscription/check", {
            params: {
              subscriberId: currentUser._id,
              channelId: channel._id,
            },
          }),
          axiosInstance.get(`/subscription/count/${channel._id}`),
        ]);

        setIsSubscribed(subRes.data.isSubscribed);
        setSubscriberCount(countRes.data.subscriberCount);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };

    checkSubscription();
  }, [currentUser?._id, channel?._id]);

  const handleSubscribeToggle = async () => {
    if (!currentUser?._id) {
      toast.message("Please sign in first.");
      return;
    }

    setIsLoading(true);
    try {
      if (isSubscribed) {
        await axiosInstance.post("/subscription/unsubscribe", {
          subscriberId: currentUser._id,
          channelId: channel._id,
        });
        setIsSubscribed(false);
        setSubscriberCount((prev) => Math.max(0, prev - 1));
        toast.success("Unsubscribed");
      } else {
        await axiosInstance.post("/subscription/subscribe", {
          subscriberId: currentUser._id,
          channelId: channel._id,
        });
        setIsSubscribed(true);
        setSubscriberCount((prev) => prev + 1);
        toast.success("Subscribed!");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="relative h-28 overflow-hidden bg-[linear-gradient(120deg,#18181b,#dc2626_60%,#f97316)] md:h-44 lg:h-52" />

      <div className="px-4 py-6">
        <div className="flex flex-col items-start gap-6 md:flex-row">
          <Avatar className="h-20 w-20 md:h-32 md:w-32">
            <AvatarFallback className="text-2xl">
              {getChannelInitial(channelName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <h1 className="text-2xl font-bold md:text-4xl">{channelName}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-zinc-600">
              <span>@{channelName.toLowerCase().replace(/\s+/g, "")}</span>
              <span>{subscriberCount} subscriber{subscriberCount !== 1 ? "s" : ""}</span>
            </div>
            {channel?.description && (
              <p className="max-w-2xl text-sm text-zinc-700">
                {channel.description}
              </p>
            )}
          </div>

          {currentUser && currentUser?._id !== channel?._id && channel?.channelname && (
            <div className="flex gap-2">
              <Button
                onClick={handleSubscribeToggle}
                disabled={isLoading}
                variant="default"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  isSubscribed
                    ? "bg-zinc-900 text-white hover:bg-zinc-800"
                    : "bg-red-600 text-white hover:bg-red-700"
                }`}
              >
                {isLoading ? "..." : isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;

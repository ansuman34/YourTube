import Subscription from "../Modals/subscription.js";
import User from "../Modals/Auth.js";
import mongoose from "mongoose";

export const subscribe = async (req, res) => {
  try {
    const { subscriberId, channelId } = req.body;

    if (!subscriberId || !channelId) {
      return res
        .status(400)
        .json({ message: "subscriberId and channelId are required" });
    }

    if (subscriberId === channelId) {
      return res.status(400).json({ message: "Cannot subscribe to yourself" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(subscriberId) ||
      !mongoose.Types.ObjectId.isValid(channelId)
    ) {
      return res.status(400).json({ message: "Invalid user IDs" });
    }

    const channelExists = await User.findById(channelId);
    if (!channelExists || !channelExists.channelname) {
      return res
        .status(404)
        .json({ message: "Channel not found or user has no channel" });
    }

    const existingSubscription = await Subscription.findOne({
      subscriberId,
      channelId,
    });

    if (existingSubscription) {
      return res.status(400).json({ message: "Already subscribed to this channel" });
    }

    const subscription = new Subscription({ subscriberId, channelId });
    const savedSubscription = await subscription.save();

    return res
      .status(201)
      .json({
        message: "Subscribed successfully",
        subscription: savedSubscription,
      });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { subscriberId, channelId } = req.body;

    if (!subscriberId || !channelId) {
      return res
        .status(400)
        .json({ message: "subscriberId and channelId are required" });
    }

    const result = await Subscription.deleteOne({ subscriberId, channelId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    return res.status(200).json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("Unsubscribe error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const isSubscribed = async (req, res) => {
  try {
    const { subscriberId, channelId } = req.query;

    if (!subscriberId || !channelId) {
      return res
        .status(400)
        .json({ message: "subscriberId and channelId are required" });
    }

    const subscription = await Subscription.findOne({
      subscriberId,
      channelId,
    });

    return res.status(200).json({ isSubscribed: !!subscription });
  } catch (error) {
    console.error("Check subscription error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getChannelSubscriberCount = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
      return res.status(400).json({ message: "Invalid channel ID" });
    }

    const count = await Subscription.countDocuments({ channelId });

    return res.status(200).json({ subscriberCount: count });
  } catch (error) {
    console.error("Get subscriber count error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getUserSubscriptions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const subscriptions = await Subscription.find({ subscriberId: userId })
      .populate("channelId", "channelname image description")
      .sort({ createdAt: -1 });

    return res.status(200).json({ subscriptions });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

import mongoose from "mongoose";

const subscriptionSchema = mongoose.Schema(
  {
    subscriberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "subscriptions",
  }
);

// Create a compound unique index to prevent duplicate subscriptions
subscriptionSchema.index({ subscriberId: 1, channelId: 1 }, { unique: true });

export default mongoose.model("subscription", subscriptionSchema);

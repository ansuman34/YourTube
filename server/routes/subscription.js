import express from "express";
import {
  subscribe,
  unsubscribe,
  isSubscribed,
  getChannelSubscriberCount,
  getUserSubscriptions,
} from "../controllers/subscription.js";

const routes = express.Router();

routes.post("/subscribe", subscribe);
routes.post("/unsubscribe", unsubscribe);
routes.get("/check", isSubscribed);
routes.get("/count/:channelId", getChannelSubscriberCount);
routes.get("/list/:userId", getUserSubscriptions);

export default routes;

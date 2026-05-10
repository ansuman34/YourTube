import express from "express";
import { getallvideo, getvideo, uploadvideo } from "../controllers/video.js";
import upload from "../filehelper/filehelper.js";

const routes = express.Router();

routes.post("/upload", upload.single("file"), uploadvideo);
routes.get("/getall", getallvideo);
routes.get("/:id", getvideo);
export default routes;

import express from "express";
import { getuser, login, updateprofile, searchUser } from "../controllers/auth.js";
const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateprofile);
routes.get("/search", searchUser);
routes.get("/:id", getuser);
export default routes;

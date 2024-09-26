import express from "express";
import { login, getUser, logout, signup } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.get("/get-user", protectRoute, getUser);

router.post("/logout", logout);

export default router;
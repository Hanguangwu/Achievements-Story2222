import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import upload from "../utils/multer.js";

import {
    addStory,
    editStory,
    getAllStories,
    imageUpload,
    imageDelete,
    deleteStory,
    searchStory,
    updateStoryPinned,
    filterStoryByDateRange,
} from "../controllers/travelStory.controller.js";

const router = express.Router();

router.post("/add-story", protectRoute, upload.single("image"), addStory);
router.put("/edit-story/:id", protectRoute, upload.single("image"), editStory);
router.delete("/delete-story/:id", protectRoute, deleteStory); // 注意这里不需要 upload.single("image")
router.get("/get-all-stories", protectRoute, getAllStories);
router.post("/image-upload", upload.single("image"), imageUpload);
router.delete("/image-delete", protectRoute, imageDelete);
router.put("/update-story-pinned/:id", protectRoute, updateStoryPinned);
router.get("/search", protectRoute, searchStory);
router.get("/travel-stories/filter", protectRoute, filterStoryByDateRange);

export default router;
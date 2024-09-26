import travelStory from "../models/travelStory.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const imageUpload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: "No image uploaded" });
        }

        // 使用 buffer 而不是 stream
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) {
                return res.status(500).json({ error: true, message: error.message });
            }
            res.status(200).json({ imageUrl: result.secure_url, public_id: result.public_id });
        });

        uploadStream.end(req.file.buffer); // 使用 buffer 结束上传
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
};

export const addStory = async (req, res) => {
    const { title, story, visitedLocation, visitedDate } = req.body;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!title || !story || !visitedLocation || !visitedDate || !req.file) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }

    // 验证 visitedDate 是否为有效日期
    const parsedDate = new Date(visitedDate);
    if (isNaN(parsedDate)) {
        return res.status(400).json({ error: true, message: "Invalid date format for visitedDate" });
    }

    try {
        // 上传图片并获取 URL
        const uploadedResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            });
            uploadStream.end(req.file.buffer);
        });

        const newTravelStory = new travelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl: uploadedResponse.secure_url,
            visitedDate: parsedDate, // 使用解析后的日期
        });

        await newTravelStory.save();
        res.status(201).json({ story: newTravelStory, message: "TravelStory added successfully" });
    } catch (error) {
        console.error("Error adding story:", error);
        return res.status(500).json({ error: true, message: error.message });
    }
};

export const editStory = async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocation, visitedDate } = req.body;

    const userId = req.user?._id;
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const existingStory = await travelStory.findById(id);
        if (!existingStory) {
            return res.status(404).json({ error: true, message: "Story not found" });
        }

        existingStory.title = title || existingStory.title;
        existingStory.story = story || existingStory.story;
        existingStory.visitedLocation = visitedLocation || existingStory.visitedLocation;
        existingStory.visitedDate = visitedDate ? new Date(visitedDate) : existingStory.visitedDate;

        // 处理图片上传
        if (req.file) {
            // 如果有新图片，删除旧图片
            if (existingStory.imageUrl) {
                const publicId = existingStory.imageUrl.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            }

            // 上传新图片并获取 URL
            const uploadedResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream({ resource_type: "image" }, (error, result) => {
                    if (error) {
                        return reject(error);
                    }
                    resolve(result);
                });
                uploadStream.end(req.file.buffer);
            });

            existingStory.imageUrl = uploadedResponse.secure_url;
        }

        await existingStory.save();
        return res.status(200).json({ story: existingStory, message: "TravelStory updated successfully" });
    } catch (error) {
        console.error("Error updating story:", error);
        return res.status(500).json({ error: true, message: error.message });
    }
};

export const imageDelete = async (req, res) => {
    const { public_id } = req.body;
    if (!public_id) {
        return res.status(400).json({ error: true, message: "public_id is required" });
    }

    try {
        const result = await cloudinary.uploader.destroy(public_id);
        if (result.result !== 'ok') {
            throw new Error('Failed to delete image');
        }
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
};



export const getUser = async (req, res) => {
	const { userId } = req.user;
	const isUser = await User.findOne({ _id: userId });

	if (!isUser) {
		return res.sendStuatus(401);
	}
	return res.json({
		user: isUser,
		message: "",
	});
}

export const deleteStory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id; // 直接获取 _id

    try {
        // 查找故事并确保它属于当前用户
        const story = await travelStory.findOne({ _id: id, userId: userId });
		
        if (!story) {
            return res.status(404).json({ error: true, message: "Travel story not found" });
        }

        // 删除 Cloudinary 上的图片
        if (story.imageUrl) {
            const publicId = story.imageUrl.split("/").pop().split(".")[0]; // 提取 public ID
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
        }

        // 删除故事
        await travelStory.deleteOne({ _id: id });

        res.status(200).json({ message: "Story deleted successfully" });

    } catch (error) {
        console.error("Error deleting story:", error); // 打印详细错误信息
        res.status(500).json({ error: true, message: error.message });
    }
};

export const getAllStories = async (req, res, next) => {
	const userId = req.user.id

	try {
		const stories = await travelStory.find({ userId: userId }).sort({ isPinned: -1 })

		res.status(200).json({
			success: true,
			message: "All stories retrived successfully",
			stories,
		})
	} catch (error) {
		next(error)
	}
}

export const updateStoryPinned = async (req, res) => {

	const { id } = req.params;
	const { isFavourite } = req.body;
	// const { userId } = req.user;
	const userId = req.user._id; // 直接获取 _id

	try {
		const Story = await travelStory.findOne({ _id: id, userId: userId });

		if (!Story) {
			return res.status(404).json({ error: true, message: "Travel story not found" })
		}

		Story.isFavourite = isFavourite;

		await Story.save();

		res.status(200).json({
			story: Story,
			message: "Updated successfully",
		})
	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}


export const searchStory = async (req, res) => {

	const { query } = req.query
	const userId = req.user._id; // 直接获取 _id

	if (!query) {
		return res.status(404).json({ error: true, message: "Search query is required" });
	}

	try {
		const matchingStories = await travelStory.find({
			userId: userId,
			$or: [
				{ title: { $regex: new RegExp(query, "i") } }, //{title: {$regex: query, $options: "i"}}
				{ story: { $regex: new RegExp(query, "i") } },
				{ visitedLocation: { $regex: new RegExp(query, "i") } },
			],
		}).sort({ isFavourite: -1 })

		res.status(200).json({
			// message: "Stories matching the search query retrieved successfully",
			stories: matchingStories,
		})
	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}

export const filterStoryByDateRange = async (req, res) => {

	const { startDate, endDate } = req.query
	const userId = req.user._id; // 直接获取 _id

	try {
		// Convert startDate and endDate from milliseconds to Date objects
		const start = new Date(parseInt(startDate));
		const end = new Date(parseInt(endDate));

		// Find travel stories that belong to the authenticated user and fall within the date range
		const filterdStories = await travelStory.find({
			userId: userId,
			visitedDate: { $gte: start, $lte: end },
		}).sort({ isFavourite: -1 })

		res.status(200).json({
			stories: filterdStories,
		})
	} catch (error) {
		res.status(500).json({ error: true, message: error.message });
	}
}





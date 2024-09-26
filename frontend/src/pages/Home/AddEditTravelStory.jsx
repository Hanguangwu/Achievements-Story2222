import React, { useState } from "react";
import { MdAdd, MdClose, MdUpdate } from "react-icons/md";
import { toast } from "react-toastify";
import DateSelector from "../../components/Input/DateSelector";
import ImageSelector from "../../components/Input/ImageSelector";
import TagInput from "../../components/Input/TagInput";
import moment from "moment";
import axiosInstance from "../../utils/axiosInstance";

const AddEditTravelStory = ({ onClose, storyInfo, type, getAllStories }) => {
    const [title, setTitle] = useState(storyInfo?.title || "");
    const [story, setStory] = useState(storyInfo?.story || "");
    const [storyImg, setStoryImg] = useState(null);
    const [visitedLocation, setVisitedLocation] = useState(storyInfo?.visitedLocation || []);
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);
    const [error, setError] = useState("");

    const addNewTravelStory = async () => {
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('story', story);
            formData.append('visitedLocation', JSON.stringify(visitedLocation));
            
            // 使用 ISO 字符串格式传递 visitedDate
            formData.append('visitedDate', visitedDate ? moment(visitedDate).toISOString() : moment().toISOString());
            
            if (storyImg) {
                formData.append('image', storyImg);
            }
    
            const response = await axiosInstance.post("/api/add-story", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.data && response.data.story) {
                toast.success("Story Added Successfully!");
                getAllStories();
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const updateTravelStory = async () => {
        const storyId = storyInfo._id;
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('story', story);
            formData.append('visitedLocation', JSON.stringify(visitedLocation));
            formData.append('visitedDate', visitedDate ? moment(visitedDate).toISOString() : moment().toISOString());
    
            if (storyImg) {
                formData.append('image', storyImg);
            }
    
            const response = await axiosInstance.put(`/api/edit-story/${storyId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            if (response.data && response.data.story) {
                toast.success("Story Updated Successfully!");
                getAllStories();
                onClose();
            }
        } catch (error) {
            setError(error.response?.data?.message || "An unexpected error occurred.");
        }
    };

    const handleAddOrUpdateClick = () => {
        if (!title) {
            setError("Please enter the title.");
            return;
        }
        if (!story) {
            setError("Please enter the story.");
            return;
        }

        setError("");
        if (type === "edit") {
            updateTravelStory();
        } else {
            addNewTravelStory();
        }
    };

    const handleDeleteStoryImg = async () => {
        try {
            const publicId = storyInfo.imageUrl.split("/").pop().split(".")[0];
            const response = await axiosInstance.delete("/api/image-delete", {
                data: { public_id: publicId },
            });

            if (response.data) {
                const storyId = storyInfo._id;
                const postData = {
                    title,
                    story,
                    imageUrl: "",
                    visitedLocation,
                    visitedDate: moment().valueOf(),
                };
                await axiosInstance.put(`/api/edit-story/${storyId}`, postData);
                setStoryImg(null);
                toast.success("Image deleted successfully!");
                getAllStories();
            }
        } catch (error) {
            setError(error.response?.data?.message || "Failed to delete image.");
        }
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between">
                <h5 className="text-xl font-medium text-slate-700">
                    {type === "add" ? "Add Story" : "Update Story"}
                </h5>
                <div>
                    <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
                        <button className="btn-small" onClick={handleAddOrUpdateClick}>
                            {type === "add" ? <MdAdd className="text-lg" /> : <MdUpdate className="text-lg" />}
                            {type === "add" ? "ADD STORY" : "UPDATE STORY"}
                        </button>
                        <button className="" onClick={onClose}>
                            <MdClose className="text-xl text-slate-400" />
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs pt-2 text-right">{error}</p>}
                </div>
            </div>
            <div>
                <div className="flex-1 flex flex-col gap-2 pt-4">
                    <label className="input-label">TITLE</label>
                    <input
                        type="text"
                        className="text-2xl text-slate-950 outline-none"
                        placeholder="A Day at the Great Wall"
                        value={title}
                        onChange={({ target }) => setTitle(target.value)}
                    />
                    <div className="my-3">
                        <DateSelector date={visitedDate} setDate={setVisitedDate} />
                    </div>
                    <ImageSelector
                        image={storyImg}
                        setImage={setStoryImg}
                        handleDeleteImg={handleDeleteStoryImg}
                    />
                    <div className="flex flex-col gap-2 mt-4">
                        <label className="input-label">STORY</label>
                        <textarea
                            className="text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded"
                            placeholder="YOUR STORY"
                            rows={10}
                            value={story}
                            onChange={({ target }) => setStory(target.value)}
                        />
                    </div>
                    <div className="pt-3">
                        <label className="input-label">TAGS</label>
                        <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditTravelStory;
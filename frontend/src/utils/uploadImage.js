import axiosInstance from "./axiosInstance";

const uploadImage = async (image) => {
    const formData = new FormData();
    formData.append("image", image);

    try {
        const response = await axiosInstance.post("/api/image-upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading the image", error);
        throw error; // 抛出错误以供调用者处理
    }
};

export default uploadImage;



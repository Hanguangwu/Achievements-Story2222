import multer from "multer";

// 使用内存存储
const storage = multer.memoryStorage();

// 文件过滤器，仅接受图片
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only images are allowed"), false);
    }
};

// 初始化 multer 实例
const upload = multer({ storage, fileFilter });
export default upload;

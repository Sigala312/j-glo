import multer from "multer";

// 1. 改用記憶體儲存 (Memory Storage)
// 這樣檔案會暫存在 req.file.buffer 中，而不是寫入硬碟
const storage = multer.memoryStorage();

// 2. 設定檔案過濾器 (保持你原本的優良邏輯)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    // 這裡建議丟出一個更友善的錯誤
    cb(new Error("不支援的檔案格式！僅限 Excel, PDF 與圖片。"), false);
  }
};

// 3. 匯出配置好的 multer
export const fileUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 保持 5MB 限制
  },
});
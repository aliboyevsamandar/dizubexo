const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");  // CORS import
require("dotenv").config();

const app = express();

// CORS'ni yoqish
app.use(cors());

// Statik fayllar uchun katalog
app.use(express.static(path.join(__dirname, "public")));
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Upload papkasini tekshirish va yaratish
const uploadDir = path.join(__dirname, "upload");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer sozlamalari
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Rasm yuklash
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "File not uploaded!" });
    }

    res.json({
        message: "File uploaded successfully!",
        fileUrl: `/upload/${req.file.filename}`,
        base64Url: `/image-base64/${req.file.filename}`,
        downloadUrl: `/download/${req.file.filename}`,
    });
});

// Rasmni Base64 formatda ko‘rsatish
app.get("/image-base64/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        const image = fs.readFileSync(filePath);
        const base64Image = Buffer.from(image).toString("base64");
        res.json({ image: base64Image });
    } else {
        res.status(404).send("Picture not found!");
    }
});

// Faylni yuklab olish
app.get("/download/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).send("Picture not found!");
    }
});

// Port
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`🚀 Server ishga tushdi: http://localhost:${PORT}`);
});

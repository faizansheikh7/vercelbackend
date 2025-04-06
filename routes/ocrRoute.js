import express from 'express';
import multer from 'multer';
import { performGeminiOCR } from '../ocr.js'; // Correct path to ocr.js

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/process-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ extractedText: "No file uploaded." });
    }

    try {
        const ocrResult = await performGeminiOCR(req.file.buffer, req.file.mimetype);
        if (ocrResult) {
            res.json({ extractedText: ocrResult });
        } else {
            res.status(500).json({ extractedText: "OCR processing failed." });
        }
    } catch (error) {
        console.error("OCR or other error:", error);
        res.status(500).json({ extractedText: `An error occurred during processing: ${error.message}` });
    }
});

export default router;
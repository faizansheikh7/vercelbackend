import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function performGeminiOCR(imageBuffer, mimeType) {
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set.");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash"
        });

        const base64String = imageBuffer.toString('base64');

        // This is our core of the OCR process. It calls the generateContent method of the Gemini model. This method sends the image and the prompt to the Gemini API
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [
                    { text: "Extract and refine the OCR text with corrections based on medical knowledge and common abbreviations. Provide only the corrected text without any introductory or explanatory sentences. Additionally, give a two-sentence description of the medicine mentioned" },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64String
                        }
                    }
                ]
            }]
        });

        if (result && result.response && result.response.candidates && result.response.candidates[0] && result.response.candidates[0].content && result.response.candidates[0].content.parts) {
            let extractedText = "";
            for (const part of result.response.candidates[0].content.parts) {
                if (part.text) {
                    extractedText += part.text;
                }
            }
            return extractedText;
        } else {
            console.error("Unexpected response format:", JSON.stringify(result, null, 2));
            return "Could not extract text. Unexpected response format.";
        }

    } catch (error) {
        console.error("Error performing Gemini OCR:", error);
        throw new Error(`Error performing Gemini OCR: ${error.message}`);
    }
}
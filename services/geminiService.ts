import { GoogleGenAI, Modality } from "@google/genai";
import { EditImageParams, ImageGenerationResult } from "../types";

// Initialize the Gemini API client
// We create a new instance per request to ensure the latest env var is picked up if it changes dynamically (though typically static in this context)
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

export const editImageWithGemini = async ({
  base64Image,
  mimeType,
  prompt,
}: EditImageParams): Promise<ImageGenerationResult> => {
  try {
    const ai = getAiClient();
    
    // Clean the base64 string if it contains the header
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana model
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];

    if (part && part.inlineData && part.inlineData.data) {
      const generatedBase64 = part.inlineData.data;
      // Construct a displayable data URL. The API usually returns PNG or JPEG, defaults to input or PNG often.
      // We'll assume PNG for the data URL prefix safe bet, or try to infer.
      // The Flash Image model typically returns PNG unless configured otherwise.
      const outputUrl = `data:image/png;base64,${generatedBase64}`;
      return { success: true, imageUrl: outputUrl };
    } else {
      return { success: false, error: "No image data found in the response." };
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unknown error occurred during generation." 
    };
  }
};

import { GoogleGenAI, Type } from "@google/genai";
import { DetectedObject } from "../types";

export const detectObjectsInFrame = async (base64Image: string): Promise<DetectedObject[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            text: `Identify all distinct shoppable items in this image, such as specific clothing (e.g., "denim jacket", "running shoes"), electronics (e.g., "headphones", "smartphone"), accessories (e.g., "watch", "sunglasses"), or home decor. 

IMPORTANT: 
1. Do NOT detect "person" or "human" as an object. Instead, identify the specific garments or items the person is wearing or holding.
2. Provide a specific, searchable brand or product name if visible, otherwise a clear descriptive name.
3. For each object, provide a normalized bounding box [ymin, xmin, ymax, xmax] in the range [0, 1000].
4. Return the data as a JSON array.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { 
                type: Type.STRING,
                description: "Specific product name or descriptive category (e.g., 'Blue Nike Sneakers')"
              },
              confidence: { type: Type.NUMBER },
              box_2d: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "[ymin, xmin, ymax, xmax]",
              },
            },
            required: ["label", "box_2d"],
          },
        },
      },
    });

    const results = JSON.parse(response.text || "[]");
    return results.map((item: any, index: number) => ({
      id: `obj-${index}`,
      label: item.label,
      confidence: item.confidence || 0.9,
      box_2d: {
        ymin: item.box_2d[0],
        xmin: item.box_2d[1],
        ymax: item.box_2d[2],
        xmax: item.box_2d[3],
      }
    }));
  } catch (error) {
    console.error("Gemini Detection Error:", error);
    return [];
  }
};

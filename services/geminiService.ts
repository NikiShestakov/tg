
import { GoogleGenAI } from "@google/genai";
import { ParsedUserData } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY is not set in environment variables");
}

const ai = new GoogleGenAI({ apiKey });

const systemInstruction = `You are an intelligent assistant for a Telegram bot. Your task is to analyze a user's text, which may consist of one or more messages concatenated together, and extract profile information into a structured JSON object. The user provides information in free form, so the order of data points is not guaranteed. The text is in Russian.

The fields to extract are:
- name: The user's name (string).
- age: The user's age in years (number).
- height: The user's height in cm (number).
- weight: The user's weight in kg (number).
- measurements: Body measurements, like "90/60/90" (string).
- about: A short biography or "about me" text (string).

If a field is not present in the text, its value in the JSON should be null.
The final output must be ONLY the JSON object, without any surrounding text, explanations, or markdown code fences.

Example 1 (single message):
Input: "Маша, 21 год. Рост 177. Фигура 90/60/90. [ФОТО ПРИКРЕПЛЕНО] Люблю спорт и путешествия."
Output:
{
  "name": "Маша",
  "age": 21,
  "height": 177,
  "weight": null,
  "measurements": "90/60/90",
  "about": "Люблю спорт и путешествия."
}

Example 2 (unordered):
Input: "Привет, я Олег. 185/80. 28 лет. Увлекаюсь программированием. [ВИДЕО ПРИКРЕПЛЕНО]"
Output:
{
  "name": "Олег",
  "age": 28,
  "height": 185,
  "weight": 80,
  "measurements": null,
  "about": "Увлекаюсь программированием."
}

Example 3 (fragmented messages joined by newline):
Input: "Это Лена\\n\\n[ФОТО ПРИКРЕПЛЕНО]\\n\\nрост 165 вес 52\\n\\nлюблю кошек"
Output:
{
  "name": "Лена",
  "age": null,
  "height": 165,
  "weight": 52,
  "measurements": null,
  "about": "люблю кошек"
}
`;


export const parseUserProfile = async (text: string): Promise<ParsedUserData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: text,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    let jsonStr = (response.text || '').trim();
    // In case Gemini still wraps the JSON in markdown
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    const parsedData = JSON.parse(jsonStr);

    // Ensure all keys are present, defaulting to null
    const result: ParsedUserData = {
      name: parsedData.name || null,
      age: parsedData.age || null,
      height: parsedData.height || null,
      weight: parsedData.weight || null,
      measurements: parsedData.measurements || null,
      about: parsedData.about || null,
    };

    return result;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to parse user profile with Gemini API.");
  }
};
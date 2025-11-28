import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateOrkName = async (role: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a single, funny, gritty Ork name for a Gorkamorka ${role}. Just the name, nothing else.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Gorgutz (AI Error)";
  }
};

export const generateBattleReport = async (mobName: string, opponent: string, outcome: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a very short (2 sentences), hilarious, broken-English Ork diary entry about a battle between ${mobName} and ${opponent}. The outcome was a ${outcome}. Use terms like 'krump', 'dakka', 'Waaagh'.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "We faught hard. It was loud. Waaagh!";
  }
};
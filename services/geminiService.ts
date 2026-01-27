import { GoogleGenAI, Chat, GenerateContentParameters } from "@google/genai";
import { ChatMessage, UserProfile } from "../types";

let chatSession: Chat | null = null;
const createClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Exécute un appel direct au modèle (Génération de contenu unique).
 */
export const callAI = async (params: GenerateContentParameters): Promise<string> => {
  const ai = createClient();
  const response = await ai.models.generateContent(params);
  return response.text || "";
};

/**
 * Initialise une session de chat interactive (Le Mentor).
 */
export const initializeChat = async (user: UserProfile, history: ChatMessage[] = []) => {
  const ai = createClient();
  const systemInstruction = `Tu es BusinessMentorGPT, un stratège entrepreneurial du Trigenys Group. 
  Entrepreneur : ${user.name} | Vision : ${user.mainGoal} | Pays : ${user.country}`;

  chatSession = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { 
      temperature: 0.7, 
      systemInstruction, 
      tools: [{googleSearch: {}}] 
    },
    history: history.map(msg => ({ 
      role: msg.role === 'user' ? 'user' : 'model', 
      parts: [{ text: msg.text }] 
    })) as any
  });
  
  if (history.length === 0) {
    const response = await chatSession.sendMessage({ message: "Analyse initiale du périmètre de mission." });
    return { 
      text: response.text, 
      groundingUrls: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(c => c.web).map(c => ({ title: c.web?.title, uri: c.web?.uri }))
    };
  }
  return null;
};

/**
 * Envoie un message dans la session de chat active.
 */
export const sendMessageToMentor = async (message: string) => {
  if (!chatSession) throw new Error("Session non initialisée");
  const result = await chatSession.sendMessage({ message });
  return { 
    text: result.text, 
    groundingUrls: result.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(c => c.web).map(c => ({ title: c.web?.title, uri: c.web?.uri }))
  };
};
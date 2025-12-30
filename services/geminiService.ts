
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, PlanSection, UserProfile, SimulationDataPoint, PlanData } from "../types";

const MENTOR_SYSTEM_INSTRUCTION = `
Tu es BusinessMentorGPT, un mentor entrepreneurial stratège.
Ta mission est de guider l'utilisateur à travers un workflow précis de création d'entreprise.

**Workflow :**
1. Fondations & Idée
2. Marché & Cible
3. Business Model
4. Structure Légale
5. Finance & ROI
6. Marketing & Expansion

**Ton Comportement :**
- Tu es direct et poses des questions précises pour combler les manques du plan.
- Si l'utilisateur clique sur une étape, concentre-toi dessus.
- Analyse si tu as assez d'infos (Problème, Solution, Client Type, Concurrents, Revenus, Coûts, Statuts, Canaux).
- Quand une section te semble complète à plus de 80%, félicite l'utilisateur et suggère de passer à l'étape suivante.

**Outils :**
- Utilise Google Search pour les données de marché et les lois en vigueur dans le pays de l'utilisateur.
`;

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

// Helper to initialize the client with the API key from environment
const getClient = () => {
  if (!client) {
    if(!process.env.API_KEY) throw new Error("API Key is missing");
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

// Initializes a chat session with the mentor model
export const initializeChat = async (user: UserProfile): Promise<string> => {
  const ai = getClient();
  const personalizedInstruction = `${MENTOR_SYSTEM_INSTRUCTION}
  \nContexte : Entrepreneur ${user.name} en ${user.country}. Projet : ${user.businessName || 'non nommé'}.
  S'il s'agit du début, commence par valider l'idée de base.`;

  chatSession = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      temperature: 0.7,
      systemInstruction: personalizedInstruction,
      tools: [{googleSearch: {}}]
    },
  });
  return "Session ready";
};

// Sends a message to the mentor model and returns the response text
export const sendMessageToMentor = async (message: string): Promise<string> => {
  if (!chatSession) throw new Error("No session");
  const result = await chatSession.sendMessage({ message });
  return result.text;
};

// Distills the current plan from chat history using structured JSON output
export const distillPlanFromHistory = async (
  history: ChatMessage[],
  user: UserProfile
): Promise<Partial<PlanData>> => {
  const ai = getClient();
  const formattedHistory = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n\n");
  
  const prompt = `
    Analyse cette conversation. Pour chaque section du workflow, produis :
    1. Une synthèse Markdown.
    2. Un score de complétion (0-100) basé sur la clarté et la complétude des informations.
    
    Sections : "Fondations & Idée", "Marché & Cible", "Business Model", "Structure Légale", "Finance & ROI", "Marketing & Expansion".
    
    Historique :
    ${formattedHistory}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            [PlanSection.IDEA_VALIDATION]: {
              type: Type.OBJECT,
              properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.MARKET_STUDY]: {
              type: Type.OBJECT,
              properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.BUSINESS_MODEL]: {
              type: Type.OBJECT,
              properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.LEGAL]: {
              type: Type.OBJECT,
              properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.FINANCIALS]: {
              type: Type.OBJECT,
              properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.GROWTH]: {
              type: Type.OBJECT,
              properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
          }
        }
      }
    });

    if (!response.text) return {};
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Distillation error", e);
    return {};
  }
};

/**
 * Generates a financial simulation based on a strategic scenario and country.
 * Uses gemini-3-flash-preview for speed and efficiency in generating structured data.
 */
export const generateFinancialSimulation = async (
  scenario: string,
  country: string
): Promise<SimulationDataPoint[]> => {
  const ai = getClient();
  const prompt = `Simule les données financières et opérationnelles d'une entreprise pour les 24 prochains mois en se basant sur ce scénario stratégique : "${scenario}".
  Le pays d'opération est ${country}.
  Génère des points de données pour les mois 1, 3, 6, 9, 12, 18, 24.
  Revenus et dépenses sont en unité monétaire locale.
  Stress et Stabilité sont des scores de 0 à 100.
  Réponds uniquement avec le tableau JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              month: { type: Type.NUMBER },
              revenue: { type: Type.NUMBER },
              expenses: { type: Type.NUMBER },
              stress: { type: Type.NUMBER },
              stability: { type: Type.NUMBER },
            },
            required: ["month", "revenue", "expenses", "stress", "stability"],
          },
        },
      },
    });

    if (!response.text) return [];
    return JSON.parse(response.text.trim());
  } catch (e) {
    console.error("Simulation generation error", e);
    throw e;
  }
};

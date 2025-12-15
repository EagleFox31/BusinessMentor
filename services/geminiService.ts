import { GoogleGenAI, ChatSession, GenerativeModel } from "@google/genai";
import { ChatMessage, PlanSection, UserProfile, SimulationDataPoint } from "../types";

const MENTOR_SYSTEM_INSTRUCTION = `
Tu es BusinessMentorGPT, un mentor entrepreneurial immersif, calme et stratège.
Ta voix est posée, celle de la raison. Tu n'es pas un simple chatbot, tu es un ancrage rationnel.

**Tes principes fondamentaux :**
1. **Rationalité Radicale :** Tu evalues les risques avant de bouger. Tu ne flattes jamais.
2. **Vision Long Terme :** Tu privilégies la cohérence à la séduction.
3. **Rigueur :** Tu cites des références comme "The Lean Startup", "Good to Great", "La semaine de 4 heures" quand c'est pertinent.
4. **Contexte & Légal :** Tu as accès à Google Search. Utilise-le SYSTÉMATIQUEMENT pour vérifier les lois, taxes et régulations spécifiques au pays de l'utilisateur avant de répondre sur des sujets légaux ou fiscaux.

**Ton Processus :**
- Validation de l'idée
- Étude de marché (Chiffres réels via Search)
- Business Model
- Analyse financière
- Légal & Gouvernance (Lois locales précises)

**Ton Style :**
- Ton bas, précis, presque méditatif.
- Réponses structurées en Markdown.
`;

let client: GoogleGenAI | null = null;
let chatSession: ChatSession | null = null;

const getClient = () => {
  if (!client) {
    if(!process.env.API_KEY) {
        throw new Error("API Key is missing");
    }
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const initializeChat = async (user: UserProfile): Promise<string> => {
  const ai = getClient();
  
  const currencySymbol = user.currency || 'EUR';

  const personalizedInstruction = `${MENTOR_SYSTEM_INSTRUCTION}
  \n\nContexte Utilisateur :
  - Nom : ${user.name}
  - Pays : ${user.country}
  - Devise de travail : ${currencySymbol} (Tous les montants doivent être estimés dans cette devise)
  - Projet : ${user.businessName || 'Non défini'}
  - Stade : ${user.stage || 'Non défini'}
  - Type : ${user.businessType || 'Non défini'}
  - Objectif Principal : ${user.mainGoal || 'Non défini'}
  
  IMPORTANT : Pour toute question légale, fiscale ou administrative, utilise Google Search pour trouver les informations officielles actuelles du pays : ${user.country}.
  `;

  // Create chat with Google Search tool enabled
  chatSession = ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      temperature: 0.7,
      systemInstruction: personalizedInstruction,
      tools: [{googleSearch: {}}]
    },
  });

  return "Session initialisée.";
};

export const sendMessageToMentor = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }

  try {
    const result = await chatSession.sendMessage({
      message: message
    });
    
    return result.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Je perçois une interférence momentanée. Veuillez répéter votre requête.";
  }
};

export const generateFinancialSimulation = async (
  scenarioDescription: string, 
  country: string
): Promise<SimulationDataPoint[]> => {
  const ai = getClient();
  
  const prompt = `
    Tu es un expert en modélisation financière.
    Génère une simulation financière sur 24 mois pour une entreprise basée en ${country}.
    
    Scénario utilisateur : "${scenarioDescription}"
    
    Règles :
    1. Estime des revenus et coûts réalistes basés sur le secteur implicite.
    2. Calcule un score de 'stress' (0-100) basé sur la trésorerie et le risque.
    3. Retourne UNIQUEMENT un tableau JSON valide.
    4. Structure des objets du tableau : { "month": number, "revenue": number, "expenses": number, "stress": number, "stability": number }
    5. Ne mets PAS de markdown (pas de \`\`\`json). Juste le tableau brut [ ... ].
    6. Génère des points pour les mois : 1, 3, 6, 9, 12, 18, 24.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: { 
        responseMimeType: "application/json" 
      }
    });

    const text = result.text.trim();
    // Clean potential markdown just in case
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(cleanJson) as SimulationDataPoint[];
  } catch (e) {
    console.error("Simulation error", e);
    // Fallback data
    return [
      { month: 1, revenue: 0, expenses: 2000, stress: 10, stability: 90 },
      { month: 12, revenue: 10000, expenses: 8000, stress: 50, stability: 50 }
    ];
  }
};

import { GoogleGenAI, Chat, Type } from "@google/genai";
import { ChatMessage, PlanSection, UserProfile, SimulationDataPoint, PlanData } from "../types";

const MENTOR_SYSTEM_INSTRUCTION = `
Tu es BusinessMentorGPT, un mentor entrepreneurial stratège et percutant.
Ta mission est de guider l'utilisateur à travers un workflow précis de création d'entreprise.

**Workflow :**
1. Fondations & Idée
2. Marché & Cible
3. Business Model
4. Structure Légale
5. Finance & ROI
6. Marketing & Expansion

**IMPORTANT :**
L'utilisateur t'a déjà fourni les détails de son projet lors de l'onboarding. 
NE LUI RE-DEMANDE PAS ce qu'il veut faire. 
Analyse les informations reçues et commence directement par une évaluation critique ou une question d'approfondissement sur le point 1 (Fondations & Idée).

**Ton Comportement :**
- Tu es direct et poses des questions précises pour combler les manques du plan.
- Si l'utilisateur a des collaborateurs, mentionne-les dans tes conseils stratégiques (ex: répartition des rôles, gestion de l'équipe).
- Si l'utilisateur clique sur une étape, concentre-toi dessus.
- Analyse si tu as assez d'infos (Problème, Solution, Client Type, Concurrents, Revenus, Coûts, Statuts, Canaux).
- Quand une section te semble complète à plus de 80%, félicite l'utilisateur et suggère de passer à l'étape suivante.

**Outils :**
- Utilise Google Search pour les données de marché et les lois en vigueur dans le pays de l'utilisateur.
`;

let client: GoogleGenAI | null = null;
let chatSession: Chat | null = null;

const getClient = () => {
  if (!client) {
    if(!process.env.API_KEY) throw new Error("API Key is missing");
    client = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return client;
};

export const initializeChat = async (user: UserProfile): Promise<string> => {
  const ai = getClient();
  const personalizedInstruction = `${MENTOR_SYSTEM_INSTRUCTION}
  \n--- CONTEXTE DE MISSION ---
  Entrepreneur : ${user.name}
  Équipage / Associés : ${user.collaborators?.join(', ') || 'Agent Solo'}
  Localisation : ${user.country}
  Nom du Projet : ${user.businessName || 'Non nommé'}
  Type de Business : ${user.businessType}
  Stade actuel : ${user.stage}
  CONCEPT / IDÉE : "${user.mainGoal}"
  ---------------------------
  
  Instructions pour ton premier message : 
  1. Salue l'utilisateur de manière tactique (style Apex Horus).
  2. Confirme que tu as bien reçu les détails de son projet : "${user.mainGoal}".
  3. Si l'équipage contient des collaborateurs, mentionne que la cellule de mission est prête avec ${user.collaborators?.length} associés.
  4. Donne une première impression rapide sur la viabilité ou un défi majeur lié au secteur "${user.businessType}".
  5. Pose une question spécifique pour valider le "Problème" que l'idée résout.`;

  chatSession = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      temperature: 0.7,
      systemInstruction: personalizedInstruction,
      tools: [{googleSearch: {}}]
    },
  });
  
  const response = await chatSession.sendMessage({ message: "Systèmes en ligne. Initialise la session de mentorat en fonction de mon projet." });
  return response.text;
};

export const sendMessageToMentor = async (message: string): Promise<string> => {
  if (!chatSession) throw new Error("No session");
  const result = await chatSession.sendMessage({ message });
  return result.text;
};

export const distillPlanFromHistory = async (
  history: ChatMessage[],
  user: UserProfile
): Promise<Partial<PlanData>> => {
  const ai = getClient();
  const formattedHistory = history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join("\n\n");
  
  const prompt = `
    Analyse cette conversation. Pour chaque section du workflow, produis une synthèse riche, stratégique et structurée.
    Chaque section doit être rédigée comme un chapitre de Business Plan professionnel.
    Intègre les rôles des collaborateurs (${user.collaborators?.join(', ') || 'N/A'}) si mentionnés.
    Utilise des sous-titres clairs et des listes à puces.
    
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
              type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.MARKET_STUDY]: {
              type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.BUSINESS_MODEL]: {
              type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.LEGAL]: {
              type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.FINANCIALS]: {
              type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
            },
            [PlanSection.GROWTH]: {
              type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } }
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

export const generateFormalDocument = async (
  type: 'PACTE_ASSOCIES' | 'STATUTS_DRAFT' | 'CONTRAT_PRESTATION',
  history: ChatMessage[],
  user: UserProfile
): Promise<string> => {
  const ai = getClient();
  
  const docModels = {
    'PACTE_ASSOCIES': "Préambule, Objet, Gouvernance (Décisions, Comité), Transmission des titres (Droit de préemption, Clause d'agrément, Inaliénabilité), Sortie (Tag-along, Drag-along), Dispositions générales.",
    'STATUTS_DRAFT': "Dénomination sociale, Objet social, Siège social, Durée, Apports, Capital social, Actions/Parts, Direction, Assemblées Générales, Exercice social, Liquidation.",
    'CONTRAT_PRESTATION': "Objet du contrat, Description des prestations, Prix et modalités de paiement, Obligations du prestataire, Obligations du client, Propriété intellectuelle, Confidentialité, Résiliation, Loi applicable."
  };

  const prompt = `
    Agis en tant qu'expert juridique senior. Rédige un document de type "${type.replace('_', ' ')}" extrêmement formel et structuré.
    
    ASSOCIÉS / COLLABORATEURS À INCLURE DANS LES PARTIES :
    - Fondateur : ${user.name}
    - Associés : ${user.collaborators?.join(', ') || 'Aucun (Agent Solo)'}

    STRUCTURE OBLIGATOIRE À SUIVRE :
    ${docModels[type]}

    RÈGLES DE RÉDACTION :
    - Utilise exclusivement une structure par ARTICLES numérotés (ARTICLE 1, ARTICLE 2...).
    - Le texte doit être dense, précis et utiliser le jargon juridique de ${user.country}.
    - Si une information manque, laisse un champ vide explicite : [A COMPLÉTER].
    - N'inclus aucun commentaire personnel, uniquement le texte du contrat.
    - Ajoute un espace pour les signatures de TOUS les associés à la fin.

    CONTEXTE DU PROJET :
    Nom : ${user.businessName}
    Pays : ${user.country}
    Activité : ${user.businessType}
    Détails discutés : ${history.slice(-10).map(m => m.text).join(' ')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { temperature: 0.2 }
  });

  return response.text || "Erreur de génération du document.";
};

export const generateFinancialSimulation = async (
  scenario: string,
  country: string
): Promise<SimulationDataPoint[]> => {
  const ai = getClient();
  const prompt = `Simule les données financières pour les 24 prochains mois : "${scenario}". Pays : ${country}. Tableau JSON uniquement.`;

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

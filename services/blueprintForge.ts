
import { Project, UserProfile, BlueprintDocType, ChatMessage, PlanData, PlanSection, CollaboratorProfile } from '../types';
import { Type } from "@google/genai";
import { callAI } from './geminiService';

// Importation des forges atomiques
import { getOnePagerPrompt } from "./forge/onePager";
import { getPitchPrompt } from "./forge/pitch";
import { getPricingPrompt } from "./forge/pricing";
import { getBusinessModelPrompt } from "./forge/businessModel";
import { getProposalPrompt } from "./forge/proposal";
import { getSowPrompt } from "./forge/sow";
import { getEthicsPrompt } from "./forge/ethics";
import { getDeliveryPrompt } from "./forge/delivery";
import { getFormalLegalPrompt } from "./forge/legal";

export interface RefineResponse {
  assistantMessage: string;
  updatedContent: string;
}

/**
 * Forge un document stratégique initial.
 */
export const forgeProfessionalAsset = async (type: BlueprintDocType, project: Project, user: UserProfile): Promise<string> => {
  const strategy = FORGE_STRATEGIES[type];
  const prompt = strategy ? strategy(project, user) : `Générer document: ${type}`;
  return await callAI({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { temperature: 0.2, thinkingConfig: { thinkingBudget: 4000 } }
  });
};

/**
 * Dialogue avec l'IA pour raffiner un document spécifique.
 * Retourne une réponse textuelle ET le contenu du document mis à jour.
 */
export const refineProfessionalAssetWithChat = async (
  type: BlueprintDocType,
  currentContent: string,
  userMessage: string,
  history: { role: 'user' | 'assistant', text: string }[],
  project: Project,
  user: UserProfile
): Promise<RefineResponse> => {
  const prompt = `
Tu es un expert en stratégie du Trigenys Group. Tu travailles sur le document "${type}" pour le projet "${project.name}".

CONTENU ACTUEL DU DOCUMENT :
---
${currentContent}
---

HISTORIQUE DE LA CONVERSATION DE RAFFINEMENT :
${history.map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n')}

NOUVELLE QUESTION/INSTRUCTION DE L'ENTREPRENEUR : 
"${userMessage}"

TES MISSIONS :
1. ANALYSE : Si l'utilisateur demande "de quoi as-tu besoin ?", identifie les "À préciser" ou les manques logiques dans le document actuel.
2. RÉPONSE : Réponds à l'utilisateur de manière concise et professionnelle dans "assistantMessage".
3. MISE À JOUR : Si l'utilisateur apporte des précisions, intègre-les dans "updatedContent" en respectant le format Markdown strict (##, ###, **gras**, - listes). Si aucune modification n'est nécessaire, renvoie le "currentContent" tel quel.

RÈGLES DE FORMATAGE :
- Toujours utiliser "**texte**" pour le gras.
- Ne jamais inventer de données non confirmées par l'utilisateur.
`.trim();

  const response = await callAI({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          assistantMessage: { 
            type: Type.STRING, 
            description: "Message de dialogue direct avec l'utilisateur (conseils, questions, confirmation)." 
          },
          updatedContent: { 
            type: Type.STRING, 
            description: "Le contenu complet du document (Markdown) éventuellement mis à jour." 
          }
        },
        required: ["assistantMessage", "updatedContent"]
      }
    }
  });

  try {
    return JSON.parse(response);
  } catch (e) {
    return {
      assistantMessage: "J'ai rencontré une erreur lors de l'analyse. Pouvez-vous reformuler ?",
      updatedContent: currentContent
    };
  }
};

const FORGE_STRATEGIES: Record<BlueprintDocType, (p: Project, u: UserProfile) => string> = {
  'CONCEPT_ONE_PAGER': getOnePagerPrompt,
  'PITCH_SCRIPT': getPitchPrompt,
  'ROADMAP_12M': (p) => `Roadmap 12 mois pour ${p.name}.`,
  'GTM_STRATEGY': (p) => `Go-To-Market pour ${p.name}.`,
  'BUSINESS_MODEL_RESUME': getBusinessModelPrompt,
  'FINANCIAL_FORECAST': (p) => `Prévisionnel financier 12m pour ${p.name}.`,
  'UNIT_ECONOMICS': (p) => `Analyse Unit Economics pour ${p.name}.`,
  'PACTE_ASSOCIES': (p, u) => getFormalLegalPrompt('PACTE_ASSOCIES', p.history, u),
  'CAP_TABLE': (p) => `Cap Table pour ${p.name}.`,
  'RACI_ORG': (p) => `Matrice RACI pour ${p.name}.`,
  'CHARTE_ETHIQUE': getEthicsPrompt,
  'PLAYBOOK_DELIVERY': getDeliveryPrompt,
  'OFFRES_PRICING': getPricingPrompt,
  'PROP_COMMERCIALE': getProposalPrompt,
  'SOW_TEMPLATE': getSowPrompt,
  'CHANGE_REQUEST_FORM': (p) => `Change Request Form pour ${p.name}.`,
  'PV_RECETTE': (p) => `PV de Recette pour ${p.name}.`,
  'PRD_MINIMAL': (p) => `PRD Minimal pour ${p.name}.`,
  'SPEC_TECH': (p) => `Spec Tech pour ${p.name}.`,
  'QA_PLAN': (p) => `Plan de Tests pour ${p.name}.`,
  'COMPANY_PROFILE': (p) => `Company Profile pour ${p.name}.`,
  'BRAND_KIT_SUMMARY': (p) => `Brand Kit pour ${p.name}.`,
};

export const sculptCollaboratorProfile = async (collab: CollaboratorProfile, project: Project): Promise<Partial<CollaboratorProfile>> => {
  const prompt = `expert en branding personnel. Sculpte le profil de ${collab.name} pour ${project.name}. JSON uniquement.`;
  const response = await callAI({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { role: { type: Type.STRING }, bio: { type: Type.STRING }, expertise: { type: Type.ARRAY, items: { type: Type.STRING } } },
        required: ["role", "bio", "expertise"]
      }
    }
  });
  try { return JSON.parse(response); } catch { return collab; }
};

export const forgeFormalContract = async (type: string, history: ChatMessage[], user: UserProfile): Promise<string> => {
  const prompt = getFormalLegalPrompt(type, history, user);
  return await callAI({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: { temperature: 0.1, thinkingConfig: { thinkingBudget: 8000 } }
  });
};

export const extractProjectData = async (history: ChatMessage[], user: UserProfile): Promise<Partial<PlanData>> => {
  const prompt = `Analyse l'historique et extrait l'avancement du projet de ${user.name} en JSON structuré.\n\n${history.map(m => m.text).join("\n")}`;
  const response = await callAI({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          [PlanSection.IDEA_VALIDATION]: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } } },
          [PlanSection.MARKET_STUDY]: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } } },
          [PlanSection.BUSINESS_MODEL]: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } } },
          [PlanSection.LEGAL]: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } } },
          [PlanSection.FINANCIALS]: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } } },
          [PlanSection.GROWTH]: { type: Type.OBJECT, properties: { content: { type: Type.STRING }, completion: { type: Type.NUMBER } } },
        }
      }
    }
  });
  try { return JSON.parse(response); } catch (e) { return {}; }
};

export const forgeFinancialSimulation = async (scenario: string, country: string): Promise<any[]> => {
  const response = await callAI({
    model: "gemini-3-flash-preview",
    contents: `Simulation JSON 24 mois basée sur le scénario stratégique : ${scenario} dans le contexte de ${country}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: { month: { type: Type.NUMBER }, revenue: { type: Type.NUMBER }, expenses: { type: Type.NUMBER }, stress: { type: Type.NUMBER }, stability: { type: Type.NUMBER } },
          required: ["month", "revenue", "expenses", "stress", "stability"],
        }
      }
    }
  });
  try { return JSON.parse(response); } catch { return []; }
};

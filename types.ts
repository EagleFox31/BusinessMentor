
export interface UserProfile {
  uid: string;
  name: string;
  fullName?: string;
  username?: string;
  email?: string;
  projectIds?: string[];
  isDemoAdmin?: boolean;
  collaborators?: string[];
  country?: string;
  businessName?: string;
  businessType?: BusinessType;
  stage?: BusinessStage;
  mainGoal?: string;
  currency?: string;
  equityShares?: Record<string, number>;
  capacity?: string;
  resources?: string;
  team?: string;
  role?: string;
  bio?: string;
  expertise?: string[];
}

export interface CollaboratorProfile {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  expertise?: string[];
}

export type AgencyType =
  | "DEV_ESN"
  | "DATA_AI"
  | "CYBERSECURITY"
  | "MARKETING_COMM"
  | "DESIGN_BRANDING"
  | "CONSULTING_STRATEGY"
  | "TRAINING_EDTECH"
  | "HR_RECRUITING"
  | "UNKNOWN";

export type RevenueModel =
  | "PROJECT_FIXED"
  | "TIME_MATERIAL"
  | "RETAINER"
  | "SAAS"
  | "HYBRID"
  | "UNKNOWN";

export interface Project {
  id: string;
  ownerId: string;
  ownerEmail?: string;
  name: string;
  country: string;
  currency: string;
  businessType: BusinessType;
  stage: BusinessStage;
  mainGoal: string;
  collaborators: string[];
  collaboratorProfiles?: CollaboratorProfile[];
  collaboratorEmails: string[];
  equityShares: Record<string, number>;
  plan: Partial<PlanData>;
  history: ChatMessage[];
  createdAt: Date;
  lastUpdated: Date;
  // Nouveau : Stockage des documents générés
  generatedAssets?: Record<string, string>;
  // Métadonnées Blueprint
  type?: string;
  offer?: string;
  problem?: string;
  icp?: string;
  differentiation?: string;
  pricing?: string;
  constraints?: string;
  proof?: string;
  description?: string;
  stack?: string;
  deliveryMode?: string;
  security?: string;
  services?: string;
  agencyType?: AgencyType;
  revenueModelType?: RevenueModel;
  aiPolicyHint?: string;
  revenueModel?: string;
  value?: string;
  costs?: string;
  positioning?: string;
  timeline?: string;
  assumptions?: string;
  clientContact?: string;
  clientName?: string;
  scope?: string;
}

export enum BusinessStage {
  IDEA = 'Idée / Concept',
  MVP = 'Lancement / MVP',
  SCALING = 'Croissance / Scale',
  PIVOT = 'Restructuration / Pivot'
}

export enum BusinessType {
  SERVICE = 'Service & Consulting',
  ECOMMERCE = 'E-commerce & Retail',
  SAAS = 'Tech & SaaS',
  INDUSTRIAL = 'Industrie & Artisanat',
  CREATIVE = 'Arts & Média'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  groundingUrls?: { title?: string; uri?: string }[];
}

export enum PlanSection {
  IDEA_VALIDATION = 'Fondations & Idée',
  MARKET_STUDY = 'Marché & Cible',
  BUSINESS_MODEL = 'Business Model',
  LEGAL = 'Structure Légale',
  FINANCIALS = 'Finance & ROI',
  GROWTH = 'Marketing & Expansion'
}

export type BlueprintDocType = 
  | 'CONCEPT_ONE_PAGER' 
  | 'PITCH_SCRIPT' 
  | 'ROADMAP_12M'
  | 'GTM_STRATEGY'
  | 'BUSINESS_MODEL_RESUME' 
  | 'FINANCIAL_FORECAST'
  | 'UNIT_ECONOMICS'
  | 'PACTE_ASSOCIES'
  | 'CAP_TABLE'
  | 'RACI_ORG'
  | 'CHARTE_ETHIQUE' 
  | 'PLAYBOOK_DELIVERY'
  | 'OFFRES_PRICING' 
  | 'PROP_COMMERCIALE' 
  | 'SOW_TEMPLATE' 
  | 'CHANGE_REQUEST_FORM'
  | 'PV_RECETTE'
  | 'PRD_MINIMAL'
  | 'SPEC_TECH'
  | 'QA_PLAN'
  | 'COMPANY_PROFILE'
  | 'BRAND_KIT_SUMMARY';

export interface SectionProgress {
  content: string;
  completion: number;
}

export type PlanData = Record<PlanSection, SectionProgress>;

export interface SimulationDataPoint {
  month: number;
  revenue: number;
  expenses: number;
  stress: number;
  stability: number;
}

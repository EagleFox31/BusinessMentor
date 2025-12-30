
export interface UserProfile {
  name: string;
  email?: string;
  country: string;
  currency?: string;
  businessName?: string;
  industry?: string;
  stage?: BusinessStage;
  businessType?: BusinessType;
  mainGoal?: string;
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
}

export enum PlanSection {
  IDEA_VALIDATION = 'Fondations & Idée',
  MARKET_STUDY = 'Marché & Cible',
  BUSINESS_MODEL = 'Business Model',
  LEGAL = 'Structure Légale',
  FINANCIALS = 'Finance & ROI',
  GROWTH = 'Marketing & Expansion'
}

export interface SectionProgress {
  content: string;
  completion: number; // 0 to 100
}

export type PlanData = Record<PlanSection, SectionProgress>;

export interface SimulationDataPoint {
  month: number;
  revenue: number;
  expenses: number;
  stress: number;
  stability: number;
}
